const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
c = c.replace(
  `className="fixed inset-0 z-[100] flex" style={{background:'#ffffff'}}`,
  `className="fixed top-0 right-0 bottom-0 z-[100] flex" style={{left: '240px', background:'#ffffff'}}`
);
// Also try the 120px in case the sidebar is 120px. Wait, earlier I saw width: '120px' but the text in the screenshot definitely needs ~240px. 
// If it's 120px in the code, I should use 120px. Let's look for both.
c = c.replace(
  `className="fixed top-0 right-0 bottom-0 z-[100] flex" style={{left: '240px', background:'#ffffff'}}`,
  `className="fixed top-0 right-0 bottom-0 z-[100] flex" style={{left: '120px', background:'#ffffff'}}`
);
fs.writeFileSync('src/App.jsx', c);
