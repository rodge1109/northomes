const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Find the block we inserted
const startStr = '      {confirmModal && (() => {';
const endStr = '      })()}\n      {editModal && (';

let startIndex = content.indexOf(startStr);
let endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  // Extract the block
  const blockToMove = content.substring(startIndex, endIndex + '      })()\n'.length);
  
  // Remove the block from its current location
  content = content.replace(blockToMove, '');
  
  // Insert it before {addPayOpen && (() => {
  content = content.replace('{addPayOpen && (() => {', blockToMove + '\n      {addPayOpen && (() => {');
  
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Successfully moved ConfirmModal to the bottom of the component.');
} else {
  console.log('Could not find the block to move.');
}
