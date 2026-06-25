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
    await pool.query("ALTER TABLE hotel_room_types ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;");
    console.log("Successfully added images column.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}

run();
