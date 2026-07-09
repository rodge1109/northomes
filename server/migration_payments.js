const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clinic_booking',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  try {
    console.log('Running database migrations...');
    await pool.query(`
      ALTER TABLE hotel_folio_payments 
      ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
    `);
    console.log('Successfully added notes column to hotel_folio_payments table.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
