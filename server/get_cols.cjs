const pool = require('./db.js');
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'hotel_guests'")
  .then(r => console.log(r.rows.map(x=>x.column_name)))
  .catch(console.error)
  .finally(() => pool.end());
