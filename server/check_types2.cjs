const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/northomes_db' });
pool.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'hotel_reservations' 
  AND column_name IN ('checked_in_at', 'check_in_date')
`).then(res => {
  console.log(res.rows);
  pool.end();
}).catch(e => { console.error(e.message); pool.end(); });
