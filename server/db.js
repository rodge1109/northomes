const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clinic_booking',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

// Supabase and most managed databases require SSL for remote connections
if (
  process.env.DB_SSL === 'true' || 
  (process.env.DB_HOST && process.env.DB_HOST.includes('supabase.co'))
) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', (client) => {
  console.log('Connected to PostgreSQL database');
  client.query("SET TIME ZONE 'Asia/Manila'").catch(err => console.error('Timezone set error:', err));
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

module.exports = pool;
