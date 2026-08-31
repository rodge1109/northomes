const { Pool } = require('pg');
const pool = require('./db.js');

async function check() {
  try {
    const existing = await pool.query("SELECT * FROM hotel_reservations WHERE status IN ('pending', 'confirmed') ORDER BY id DESC LIMIT 1");
    if (existing.rows.length === 0) return console.log('No pending reservations.');
    
    const id = existing.rows[0].id;
    const roomNumber = existing.rows[0].room_number || '101';
    const idVerified = true;
    const paymentCollected = true;
    const notes = '';
    
    console.log(`Checking in reservation ${id} with room ${roomNumber}`);
    
    // Simulate checkin
    try {
      const result = await pool.query(
        `UPDATE hotel_reservations SET
           status            = 'checked_in',
           checked_in_at     = NOW(),
           room_number       = $1,
           id_verified       = $2,
           payment_collected = $3,
           front_desk_notes  = $4
         WHERE id = $5
         RETURNING *`,
        [roomNumber || null, idVerified || false, paymentCollected || false, notes || '', id]
      );
      
      console.log('Update result:', result.rowCount);
      
      if (roomNumber) {
        await pool.query(
          `INSERT INTO hotel_rooms (room_number, room_type) VALUES ($1,$2) ON CONFLICT (room_number) DO NOTHING`,
          [roomNumber, existing.rows[0].room_type || '']
        );
      }
      
      // Simulate autoPostRoomCharge
      const r = result.rows[0];
      const checkIn = new Date(r.check_in_date);
      const checkOut = new Date(r.check_out_date);
      const nights = Math.max(1, Math.round((checkOut - checkIn) / 86400000));
      
      let price = null;
      if (r.rate_code) {
        const rcPriceRes = await pool.query(
          `SELECT rcp.price_per_night
           FROM hotel_rate_code_prices rcp
           JOIN hotel_rate_codes rc ON rcp.rate_code_id = rc.id
           JOIN hotel_room_types rt ON rcp.room_type_id = rt.id
           WHERE rc.code = $1 AND rt.name = $2`,
          [r.rate_code.toUpperCase().trim(), r.room_type]
        );
        if (rcPriceRes.rows.length > 0) {
          price = parseFloat(rcPriceRes.rows[0].price_per_night);
        }
      }
      if (price === null) {
        const rtResult = await pool.query("SELECT price_per_night FROM hotel_room_types WHERE name = $1", [r.room_type]);
        price = rtResult.rows.length > 0 ? parseFloat(rtResult.rows[0].price_per_night) : 3500;
      }
      const amount = nights * price;
      
      console.log('Inserting into hotel_folio_items...');
      await pool.query(
        `INSERT INTO hotel_folio_items (reservation_id, charge_type, description, quantity, unit_price, amount)
         VALUES ($1, 'room_charge', $2, $3, $4, $5)`,
        [id, `Room Charge (${r.room_type} - ${nights} night\${nights>1?'s':''})`, nights, price, amount]
      );
      
      console.log('Check-in simulation successful!');
    } catch (e) {
      console.error('SIMULATION ERROR:', e);
    }
  } catch (err) {
    console.error('Initial error:', err);
  } finally {
    pool.end();
  }
}

check();
