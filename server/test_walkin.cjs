const { Pool } = require('pg');
const pool = require('./db.js');

async function check() {
  try {
    const data = {
      full_name: 'Test Walkin',
      room_type: 'Standard Room',
      check_in_date: '2026-08-28',
      check_out_date: '2026-08-30',
      room_number: '101',
      initialStatus: 'checked_in',
      company: 'Test Company'
    };
    
    // Simulate walkin insert
    const result = await pool.query(
        `INSERT INTO hotel_reservations
           (full_name, email, phone_number, room_type, check_in_date, check_out_date,
            number_of_guests, room_number, payment_collected, special_requests,
            front_desk_notes, rate_code, status, checked_in_at, guest_arrived_at,
            title, middle_name, gender, date_of_birth, nationality, country,
            address, city, id_type, id_number, purpose_of_visit, eta,
            payment_method, deposit_amount, guest_id, company)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$27,
                 CASE WHEN $27='checked_in' THEN NOW() ELSE NULL END,
                 CASE WHEN $27='checked_in' THEN NOW() ELSE NULL END,
                 $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26, $28, $29)
         RETURNING *`,
        [
          data.full_name, '', '', data.room_type,
          data.check_in_date, data.check_out_date, 1,
          data.room_number, false,
          '', '', '',
          '', '', '',
          null, '', '',
          '', '', '', '',
          '', '', '', 0,
          data.initialStatus, null, data.company
        ]
      );
      console.log('Insert success!', result.rows[0].id);
      
      // Auto-upsert room record
      await pool.query(
        `INSERT INTO hotel_rooms (room_number, room_type) VALUES ($1,$2) ON CONFLICT (room_number) DO NOTHING`,
        [data.room_number, data.room_type]
      );
      
      console.log('Room upsert success!');
  } catch (err) {
    console.error('SIMULATION ERROR:', err);
  } finally {
    pool.end();
  }
}

check();
