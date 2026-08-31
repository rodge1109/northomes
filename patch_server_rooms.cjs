const fs = require('fs');
let c = fs.readFileSync('server/index.js', 'utf8');

const regex = /const availability = await Promise\.all\(\s*roomTypes\.rows\.map\(async \(rt\) => \{[\s\S]*?return \{ \.\.\.rt, booked: bookedCount, available: Math\.max\(0, effectiveTotal - bookedCount\) \};\s*\}\)\s*\);/;

const replacement = `const availability = await Promise.all(
        roomTypes.rows.map(async (rt) => {
          const booked = await pool.query(
            \`SELECT room_number FROM hotel_reservations
             WHERE room_type = $1
               AND status NOT IN ('cancelled', 'checked_out', 'no_show')
               AND check_in_date < $3
               AND check_out_date > $2
               AND room_number IS NOT NULL AND room_number != ''\`,
            [rt.name, checkIn, checkOut]
          );
          const bookedRoomNumbers = booked.rows.map(r => r.room_number);
          const bookedCount = booked.rows.length;

          const ooo = await pool.query(
            \`SELECT room_number FROM hotel_rooms WHERE room_type = $1 AND hk_status = 'out_of_order' AND active = true\`,
            [rt.name]
          );
          const oooRoomNumbers = ooo.rows.map(r => r.room_number);
          const oooCount = ooo.rows.length;
          
          const allRooms = await pool.query(
            \`SELECT room_number FROM hotel_rooms WHERE room_type = $1 AND active = true\`,
            [rt.name]
          );
          
          const availableRooms = allRooms.rows
            .map(r => r.room_number)
            .filter(rn => !bookedRoomNumbers.includes(rn) && !oooRoomNumbers.includes(rn));
          
          const effectiveTotal = Math.max(0, rt.total_rooms - oooCount);
          return { 
            ...rt, 
            booked: bookedCount, 
            available: Math.max(0, effectiveTotal - bookedCount),
            availableRooms
          };
        })
      );`;

if(regex.test(c)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync('server/index.js', c);
    console.log("server/index.js Patched successfully!");
} else {
    console.log("Regex not found in server/index.js!");
}
