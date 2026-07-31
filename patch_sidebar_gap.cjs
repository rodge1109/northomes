const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// The main wrapper padding
content = content.replace(/ml-\[150px\]/g, 'ml-[120px]');

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Successfully reduced the sidebar gap from 150px to 120px (matching the sidebar width).');
