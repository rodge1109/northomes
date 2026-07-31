const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `className="flex-1 overflow-y-auto p-6 bg-white"`;
const replacementStr = `className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-white"`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Successfully adjusted left padding to 10px offset from sidebar.');
} else {
  console.log('Failed to find target string in src/App.jsx');
}
