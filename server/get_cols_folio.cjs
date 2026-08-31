const pool = require('./db.js');
async function check() {
  const p = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'hotel_folio_payments'");
  console.log("payments:", p.rows.map(x=>x.column_name));
  const i = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'hotel_folio_items'");
  console.log("items:", i.rows.map(x=>x.column_name));
  pool.end();
}
check();
