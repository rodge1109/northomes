const fs = require('fs');

// Patch server/index.js
let server = fs.readFileSync('server/index.js', 'utf8');

const serverRegex = /if \(newCheckout <= currentCheckout\) \{[\s\S]*?return res\.status\(400\)\.json\(\{ success: false, message: 'New check-out date must be after the current check-out date\.' \}\);\s*\}/;
const serverReplacement = `if (newCheckout <= new Date(resv.check_in_date)) {
        return res.status(400).json({ success: false, message: 'New check-out date must be after the check-in date.' });
      }
      if (newCheckout.getTime() === currentCheckout.getTime()) {
        return res.status(400).json({ success: false, message: 'New check-out date must be different from current check-out date.' });
      }`;

if (serverRegex.test(server)) {
    server = server.replace(serverRegex, serverReplacement);
    
    // Also skip conflict check if shortening
    const conflictRegex = /let warning = null;\s*if \(resv\.room_number\) \{/
    const conflictReplacement = `let warning = null;
      if (resv.room_number && newCheckout > currentCheckout) {`
    
    server = server.replace(conflictRegex, conflictReplacement);
    
    fs.writeFileSync('server/index.js', server);
    console.log("server/index.js patched for shortening stay.");
} else {
    console.log("server/index.js regex 1 not found!");
}

// Patch src/App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');

const appRegexMinDate = /const minDate = \(\(\) => \{ const d = new Date\(currentCheckout\); d\.setDate\(d\.getDate\(\) \+ 1\); return d\.toISOString\(\)\.slice\(0, 10\); \}\)\(\);/;
const appReplacementMinDate = `const minDate = (() => { const d = new Date(extendGuest.check_in_date); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();`;

if (appRegexMinDate.test(app)) {
    app = app.replace(appRegexMinDate, appReplacementMinDate);
    
    const titleRegex = /Extend Stay\s*<\/div>/;
    app = app.replace(titleRegex, `Adjust Checkout</div>`);
    
    const confirmButtonRegex = /disabled=\{extendSubmitting \|\| !extendNewDate \|\| additionalNights <= 0\}/;
    app = app.replace(confirmButtonRegex, `disabled={extendSubmitting || !extendNewDate || additionalNights === 0}`);
    
    const badgeRegex = /\{additionalNights > 0 && \([\s\S]*?\{additionalNights !== 1 \? 's' : ''\}<\/span>[\s\S]*?<\/div>\s*\)\}/;
    const badgeReplacement = `{additionalNights !== 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#f0fdf8] border border-[#00754A]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="2"><path d="M12 2v10l4 4" /><circle cx="12" cy="12" r="10" /></svg>
                      <span className="text-xs font-semibold text-[#00754A]">
                        {additionalNights > 0 
                          ? \`+\${additionalNights} additional night\${additionalNights !== 1 ? 's' : ''}\`
                          : \`\${additionalNights} night\${additionalNights !== -1 ? 's' : ''} (Shortened)\`
                        }
                      </span>
                      <span className="text-xs text-black/40 ml-auto">Remember to adjust charges manually</span>
                    </div>
                  )}`;
    app = app.replace(badgeRegex, badgeReplacement);
    
    const confirmTextRegex = /\{extendSubmitting \? 'Extending\.\.\.' : extendConflict \? 'Extend Anyway' : 'Confirm Extension'\}/;
    app = app.replace(confirmTextRegex, `{extendSubmitting ? 'Saving...' : extendConflict ? 'Extend Anyway' : 'Confirm Change'}`);
    
    fs.writeFileSync('src/App.jsx', app);
    console.log("src/App.jsx patched for shortening stay.");
} else {
    console.log("src/App.jsx regex not found!");
}
