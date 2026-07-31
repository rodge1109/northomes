const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `      }
      {editModal && (`;

const replacementStr = `      })()}
      {editModal && (`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Fixed syntax error in App.jsx');
