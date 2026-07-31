const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10 bg-white">`;

const replacementStr = `            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Successfully tightened outer container padding.');
} else {
  // If not found, try a generic replace just in case formatting is different
  const fallbackTarget = 'className="flex-1 overflow-y-auto p-10 bg-white"';
  const fallbackReplace = 'className="flex-1 overflow-y-auto p-6 bg-white"';
  
  if (content.includes(fallbackTarget)) {
    content = content.replace(fallbackTarget, fallbackReplace);
    fs.writeFileSync('src/App.jsx', content, 'utf8');
    console.log('Successfully tightened outer container padding using fallback.');
  } else {
    console.log('Failed to find target string in src/App.jsx');
  }
}
