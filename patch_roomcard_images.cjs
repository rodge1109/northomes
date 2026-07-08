const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `  const images = room.id % 2 === 0 ? [
    "/assets/images/rooms/sample_room_2.png",
    "/assets/images/gallery/bathroom.jpg",
    "/assets/images/gallery/room_standard.jpg"
  ] : [
    "/assets/images/rooms/sample_room_1.png",
    "/assets/images/gallery/room_standard.jpg",
    "/assets/images/gallery/bathroom.jpg"
  ];`;

const newCode = `  const images = (room.images && Array.isArray(room.images) && room.images.length > 0) ? room.images : (room.id % 2 === 0 ? [
    "/assets/images/rooms/sample_room_2.png",
    "/assets/images/gallery/bathroom.jpg",
    "/assets/images/gallery/room_standard.jpg"
  ] : [
    "/assets/images/rooms/sample_room_1.png",
    "/assets/images/gallery/room_standard.jpg",
    "/assets/images/gallery/bathroom.jpg"
  ]);`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(file, content, 'utf8');
console.log('RoomCard updated to use uploaded images!');
