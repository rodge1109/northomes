const fs = require('fs');
let serverContent = fs.readFileSync('server/index.js', 'utf8');

const regex = /purpose \|\| '', eta \|\| '', payment_method \|\| '', deposit_amount \|\| 0,\s*initialStatus, guestId/;
const replacement = `purpose || '', eta || '', payment_method || '', deposit_amount || 0,
          initialStatus, guestId, company || ''`;

if (regex.test(serverContent)) {
    serverContent = serverContent.replace(regex, replacement);
    fs.writeFileSync('server/index.js', serverContent);
    console.log("server/index.js fixed!");
}

let appContent = fs.readFileSync('src/App.jsx', 'utf8');
const regexApp = /payment_method: wkPaymentMethod, deposit_amount: i === 0 \? \(wkGuaranteeAmount \|\| 0\) : 0,/;
const replacementApp = `payment_method: wkPaymentMethod, deposit_amount: i === 0 ? (wkGuaranteeAmount || 0) : 0,
              company: wkCompany.trim(),`;

if (regexApp.test(appContent)) {
    appContent = appContent.replace(regexApp, replacementApp);
    fs.writeFileSync('src/App.jsx', appContent);
    console.log("App.jsx fixed!");
}
