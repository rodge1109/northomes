const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND data_type IN ('text', 'character varying', 'character')
    `);
    
    for (const row of tablesRes.rows) {
      const { table_name, column_name } = row;
      try {
        const searchRes = await pool.query(`
          SELECT * FROM "${table_name}" 
          WHERE CAST("${column_name}" AS text) ILIKE '%kit%'
        `);
        if (searchRes.rows.length > 0) {
          console.log(`Found in table: ${table_name}, column: ${column_name}`);
          console.log(searchRes.rows);
        }
      } catch (err) {
        // Skip
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
