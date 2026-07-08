const fs = require('fs');
const file = 'c:\\website\\northomes-system\\server\\index.js';
let content = fs.readFileSync(file, 'utf8');

// Fix PUT route
content = content.replace(
  'images          = COALESCE($10, images)',
  'images          = COALESCE($10::jsonb, images)'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed COALESCE jsonb cast in backend!');
