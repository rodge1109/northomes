const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'northomes_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function initCorporate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotel_corporate_accounts (
          id SERIAL PRIMARY KEY,
          account_number VARCHAR(50) NOT NULL UNIQUE,
          company_name VARCHAR(255) NOT NULL,
          contact_person VARCHAR(255),
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          credit_limit NUMERIC(10,2) DEFAULT 0.00,
          balance NUMERIC(10,2) DEFAULT 0.00,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotel_corporate_ledgers (
          id SERIAL PRIMARY KEY,
          account_id INTEGER REFERENCES hotel_corporate_accounts(id),
          date DATE NOT NULL,
          reference VARCHAR(100) NOT NULL,
          description TEXT,
          debit NUMERIC(12,2) DEFAULT 0,
          credit NUMERIC(12,2) DEFAULT 0,
          balance NUMERIC(12,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert dummy data if table is empty
    const res = await pool.query('SELECT COUNT(*) FROM hotel_corporate_accounts');
    if (parseInt(res.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO hotel_corporate_accounts (account_number, company_name, contact_person, credit_limit, balance)
        VALUES 
          ('CORP-001', 'Acme Corporation', 'John Doe', 50000.00, 0.00),
          ('CORP-002', 'Stark Industries', 'Tony Stark', 100000.00, 0.00),
          ('CORP-003', 'Wayne Enterprises', 'Bruce Wayne', 150000.00, 0.00)
      `);
      console.log('Dummy corporate accounts inserted.');
    }

    console.log('Corporate tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing tables:', err);
  } finally {
    pool.end();
  }
}

initCorporate();
