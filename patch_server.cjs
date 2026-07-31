const fs = require('fs');
let content = fs.readFileSync('server/index.js', 'utf8');

const targetStr = `      if (status === 'confirmed' && room_number !== undefined) {
        if (room_number === '') {
          query = 'UPDATE hotel_reservations SET status = $1, room_number = NULL WHERE id = $2 RETURNING *';
        } else {
          query = 'UPDATE hotel_reservations SET status = $1, room_number = $3 WHERE id = $2 RETURNING *';
          params.push(room_number);
        }
      }`;

const replacementStr = `      if ((status === 'confirmed' || status === 'pending') && room_number !== undefined) {
        if (room_number === '') {
          query = 'UPDATE hotel_reservations SET status = $1, room_number = NULL WHERE id = $2 RETURNING *';
        } else if (status === 'confirmed') {
          query = 'UPDATE hotel_reservations SET status = $1, room_number = $3 WHERE id = $2 RETURNING *';
          params.push(room_number);
        }
      }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('server/index.js', content, 'utf8');
console.log('Fixed server/index.js status update logic');
