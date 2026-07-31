const fs = require('fs');
let content = fs.readFileSync('server/index.js', 'utf8');

const targetStr = `        SELECT r.*,
          CASE
            WHEN r.hk_status = 'out_of_order' THEN 'out_of_order'
            WHEN res.status = 'checked_in' AND res.check_out_date::date = CURRENT_DATE THEN 'due_out'
            WHEN res.status = 'checked_in' THEN 'occupied'
            WHEN res.status IN ('pending','confirmed') AND res.check_in_date::date = CURRENT_DATE THEN 'arriving'
            WHEN r.hk_status = 'dirty' THEN 'dirty'
            WHEN r.hk_status = 'inspected' THEN 'inspected'
            ELSE 'available'
          END as computed_status,
          res.id as reservation_id, res.full_name as guest_name,
          res.check_in_date, res.check_out_date, res.number_of_guests,
          res.status as reservation_status
        FROM hotel_rooms r
        LEFT JOIN hotel_reservations res ON res.room_number = r.room_number
          AND res.status IN ('checked_in','pending','confirmed')
          AND res.check_out_date >= CURRENT_DATE
        WHERE r.active = true
        ORDER BY r.floor ASC, r.room_number ASC,
          CASE
            WHEN res.status = 'checked_in' AND res.check_out_date::date = CURRENT_DATE THEN 1
            WHEN res.status = 'checked_in' THEN 2
            WHEN res.status IN ('pending','confirmed') AND res.check_in_date::date = CURRENT_DATE THEN 3
            ELSE 4
          END ASC`;

const replacementStr = `        SELECT * FROM (
          SELECT DISTINCT ON (r.room_number) r.*,
            CASE
              WHEN r.hk_status = 'out_of_order' THEN 'out_of_order'
              WHEN res.status = 'checked_in' AND res.check_out_date::date = CURRENT_DATE THEN 'due_out'
              WHEN res.status = 'checked_in' THEN 'occupied'
              WHEN res.status IN ('pending','confirmed') AND res.check_in_date::date = CURRENT_DATE THEN 'arriving'
              WHEN r.hk_status = 'dirty' THEN 'dirty'
              WHEN r.hk_status = 'inspected' THEN 'inspected'
              ELSE 'available'
            END as computed_status,
            res.id as reservation_id, res.full_name as guest_name,
            res.check_in_date, res.check_out_date, res.number_of_guests,
            res.status as reservation_status
          FROM hotel_rooms r
          LEFT JOIN hotel_reservations res ON res.room_number = r.room_number
            AND res.status IN ('checked_in','pending','confirmed')
            AND res.check_out_date >= CURRENT_DATE
          WHERE r.active = true
          ORDER BY r.room_number ASC,
            CASE
              WHEN res.status = 'checked_in' THEN 1
              WHEN res.check_in_date::date = CURRENT_DATE THEN 2
              ELSE 3
            END ASC
        ) as unique_rooms
        ORDER BY unique_rooms.floor ASC, unique_rooms.room_number ASC`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('server/index.js', content, 'utf8');
  console.log('Successfully updated GET /api/rooms for duplicate resolution.');
} else {
  console.log('Failed to find target string in server/index.js');
}
