const fs = require('fs');
let content = fs.readFileSync('server/index.js', 'utf8');

const targetStr = `const initialStatus = (isToday || !isFuture) ? 'checked_in' : 'confirmed';`;

const replacementStr = `let initialStatus = (isToday || !isFuture) ? 'checked_in' : 'confirmed';

      // 3. Current Occupant Check - if room is still occupied by someone who hasn't checked out yet
      const currentOccupant = await pool.query(
        \`SELECT id FROM hotel_reservations WHERE room_number = $1 AND status = 'checked_in'\`,
        [room_number]
      );
      if (currentOccupant.rows.length > 0 && initialStatus === 'checked_in') {
        initialStatus = 'confirmed'; // Auto fallback to confirmed so we don't double-check-in
      }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('server/index.js', content, 'utf8');
  console.log('Successfully updated walk-in auto-fallback logic.');
} else {
  console.log('Failed to find target string in server/index.js');
}
