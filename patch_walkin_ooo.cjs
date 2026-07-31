const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `rooms.filter(r => r.room_type === wkRoomType && r.computed_status !== 'occupied' && r.computed_status !== 'arriving')`;
const replacementStr = `rooms.filter(r => r.room_type === wkRoomType && r.computed_status !== 'occupied' && r.computed_status !== 'arriving' && r.computed_status !== 'out_of_order')`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Successfully excluded OOO rooms from Walk-in dropdown.');
} else {
  console.log('Target string not found, attempting regex replacement...');
  content = content.replace(/rooms\.filter\(r => r\.room_type === wkRoomType && r\.computed_status !== 'occupied' && r\.computed_status !== 'arriving'\)/g, replacementStr);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Regex replacement finished.');
}
