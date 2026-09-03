const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/northomes_db' });
pool.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'hotel_reservations' 
  AND column_name IN ('check_in_date', 'checked_in_at')
`).then(res => {
  console.log(res.rows);
  pool.end();
});
