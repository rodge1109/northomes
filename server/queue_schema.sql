-- Queue System Schema

-- Transaction Types
CREATE TABLE IF NOT EXISTS queue_transaction_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  prefix VARCHAR(3) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teller Windows
CREATE TABLE IF NOT EXISTS queue_tellers (
  id SERIAL PRIMARY KEY,
  window_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Queue Tickets
CREATE TABLE IF NOT EXISTS queue_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  cellphone_number VARCHAR(20) NOT NULL,
  transaction_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  teller_window VARCHAR(50),
  queue_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  called_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_tickets_date ON queue_tickets(queue_date);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_status ON queue_tickets(status);

-- Window-Transaction Assignments (many-to-many)
CREATE TABLE IF NOT EXISTS queue_window_transactions (
  id SERIAL PRIMARY KEY,
  teller_id INTEGER REFERENCES queue_tellers(id) ON DELETE CASCADE,
  transaction_type_id INTEGER REFERENCES queue_transaction_types(id) ON DELETE CASCADE,
  UNIQUE(teller_id, transaction_type_id)
);

-- Seed default transaction types
INSERT INTO queue_transaction_types (name, prefix) VALUES
  ('Business Permit', 'BP'),
  ('Payment', 'PY'),
  ('Inquiry', 'IQ')
ON CONFLICT DO NOTHING;

-- Seed default teller windows
INSERT INTO queue_tellers (window_name) VALUES
  ('Window 1'),
  ('Window 2')
ON CONFLICT DO NOTHING;


-- Settings for queue display
CREATE TABLE IF NOT EXISTS queue_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed default settings
INSERT INTO queue_settings (key, value) VALUES
  ('marquee_text', 'Welcome to our service queue system'),
  ('display_template', 'template1')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
