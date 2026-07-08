const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldFeaturedImg = `                  <img
                    src={i % 2 === 0 ? "/assets/images/rooms/sample_room_1.png" : "/assets/images/rooms/sample_room_2.png"}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />`;

const newFeaturedImg = `                  <img
                    src={(room.images && Array.isArray(room.images) && room.images.length > 0) ? room.images[0] : (i % 2 === 0 ? "/assets/images/rooms/sample_room_1.png" : "/assets/images/rooms/sample_room_2.png")}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />`;

content = content.replace(oldFeaturedImg, newFeaturedImg);

fs.writeFileSync(file, content, 'utf8');
console.log('Featured accommodations updated to use uploaded images!');
