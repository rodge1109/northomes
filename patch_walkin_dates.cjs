const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Make Check-In Date read-only and look disabled
const checkInTarget = `<input type="date" value={wkCheckIn} onChange={e => setWkCheckIn(e.target.value)}
                                    className="w-2/3 px-3 py-1.5 bg-white border border-black/10 rounded-md text-[12px] font-medium focus:border-[#00754A] outline-none transition-all shadow-sm" />`;

const checkInReplacement = `<input type="date" value={wkCheckIn} readOnly disabled
                                    className="w-2/3 px-3 py-1.5 bg-gray-100 border border-black/10 rounded-md text-[12px] font-medium text-black/50 outline-none shadow-sm cursor-not-allowed" />`;

if (content.includes(checkInTarget)) {
  content = content.replace(checkInTarget, checkInReplacement);
} else {
  // If it doesn't match perfectly, try a regex
  content = content.replace(/<input type="date" value=\{wkCheckIn\} onChange=\{e => setWkCheckIn\(e\.target\.value\)\}\s+className="[^"]+"/g, 
    `<input type="date" value={wkCheckIn} readOnly disabled className="w-2/3 px-2 py-1.5 bg-gray-100 border border-black/10 rounded-md text-[12px] font-medium text-black/50 outline-none shadow-sm cursor-not-allowed"`);
}

// 2. Make Check-Out Date strictly strictly greater than Check-In Date
// Current: min={wkCheckIn || today}
// Target: min={wkCheckIn ? new Date(new Date(wkCheckIn).getTime() + 86400000).toISOString().split('T')[0] : new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]}

const checkOutTargetRegex = /<input type="date" value=\{wkCheckOut\} min=\{wkCheckIn \|\| today\} onChange=\{e => setWkCheckOut\(e\.target\.value\)\}/g;
const checkOutReplacement = `<input type="date" value={wkCheckOut} min={wkCheckIn ? new Date(new Date(wkCheckIn).getTime() + 86400000).toISOString().split('T')[0] : new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]} onChange={e => setWkCheckOut(e.target.value)}`;

content = content.replace(checkOutTargetRegex, checkOutReplacement);

// 3. Add an effect or onChange handler inside CheckOut to ensure it's not invalid.
// But wait, the native HTML min attribute already handles invalidity if the user uses the picker.
// To be very safe, we could just rely on the `min` attribute preventing the user from picking an invalid date via the UI calendar.

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Successfully patched Check-In readOnly and Check-Out min date constraints.');
