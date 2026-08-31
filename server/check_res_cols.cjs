const pool = require('./db.js');
async function check() {
  const p = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'hotel_reservations'");
  console.log("reservations:", p.rows.map(x=>x.column_name));
  pool.end();
}
check();
