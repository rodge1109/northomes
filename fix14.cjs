const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const startMarker = '// ── Folio Modal — Full Screen Redesign ───────────────────────────────────────';
const startIdx = c.indexOf(startMarker);

if (startIdx === -1) {
  console.log("Could not find Folio Modal start marker.");
  process.exit(1);
}

const before = c.substring(0, startIdx);
let folioModalCode = c.substring(startIdx);

// Replace conditionals setting red color for balance
folioModalCode = folioModalCode.replace(/folioTotals\.balance>0\?'text-red-600':'text-\[#00754A\]'/g, "'text-[#00754A]'");
folioModalCode = folioModalCode.replace(/folioTotals\.balance>0\?'text-red-600':'text-black'/g, "'text-[#00754A]'");

// For the bottom total bar:
folioModalCode = folioModalCode.replace(/color:folioTotals\.balance>0\?'text-red-600':'text-\[#00754A\]'/g, "color:'text-[#00754A]'");

fs.writeFileSync('src/App.jsx', before + folioModalCode, 'utf8');
console.log("Successfully set balance amount text color to green.");
