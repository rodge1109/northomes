const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const startStr = '      {confirmModal && (() => {';
const editModalStr = '      {editModal && (';

let startIndex = content.indexOf(startStr);
let endIndex = content.indexOf(editModalStr);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  // Extract the block
  const blockToMove = content.substring(startIndex, endIndex);
  
  // Remove the block from its current location
  content = content.replace(blockToMove, '');
  
  // Insert it before {addPayOpen && (() => {
  content = content.replace('{addPayOpen && (() => {', blockToMove + '\n      {addPayOpen && (() => {');
  
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Successfully moved ConfirmModal to the bottom of the component.');
} else {
  console.log('Could not find the block to move.', startIndex, endIndex);
}
