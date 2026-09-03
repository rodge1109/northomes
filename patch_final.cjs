const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Fix 1: Remove fetchReservations()
code = code.replace(
  /setSignatureModal\({ open: false, res: null }\);\r?\n\s*fetchReservations\(\);/,
  "setSignatureModal({ open: false, res: null });\n        alert('Signature saved successfully!');"
);
code = code.replace(
  /alert\('Error saving signature'\);/,
  "alert('Error saving signature: ' + err.message);"
);

// Fix 2: Remove replace(/Z$/, '') hack safely
code = code.replace(
  /const safeDateStr = res\.checked_in_at && typeof res\.checked_in_at === 'string' \? res\.checked_in_at\.replace\(\/Z\$\/, ''\) : res\.checked_in_at;/,
  "const safeDateStr = res.checked_in_at;"
);

fs.writeFileSync('src/App.jsx', code);
console.log('Final fixes applied successfully.');
