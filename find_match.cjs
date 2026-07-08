const fs = require('fs');
const content = fs.readFileSync('c:\\website\\northomes-system\\src\\App.jsx', 'utf8');

const regex = /}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*, document\.body\)}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('Matched at index ' + match.index);
  // Get line number
  const lines = content.substring(0, match.index).split('\n');
  console.log('Line number: ' + lines.length);
}
