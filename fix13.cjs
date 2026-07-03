const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// We only want to patch FolioModal at the end of the file.
const startMarker = '// ── Folio Modal — Full Screen Redesign ───────────────────────────────────────';
const startIdx = c.indexOf(startMarker);

if (startIdx === -1) {
  console.log("Could not find Folio Modal start marker.");
  process.exit(1);
}

const before = c.substring(0, startIdx);
let folioModalCode = c.substring(startIdx);

// Replace text color classes in folioModalCode
// e.g. text-black/35, text-black/40, text-black/45, text-black/55, text-black/60, text-black/65, text-black/70
folioModalCode = folioModalCode.replace(/text-black\/\d+/g, 'text-black');

// e.g. text-[#000000]/87, text-[#000000]/80
folioModalCode = folioModalCode.replace(/text-\[#000000\]\/\d+/g, 'text-black');

// Make specific adjustments for tabs where unselected needs to be slightly distinguishable? 
// User asked for "all fonts, black to make it clear". Let's literally make them all text-black.

fs.writeFileSync('src/App.jsx', before + folioModalCode, 'utf8');
console.log("Successfully made all fonts black in FolioModal.");
