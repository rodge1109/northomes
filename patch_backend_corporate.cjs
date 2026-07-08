const fs = require('fs');
const file = 'c:\\website\\northomes-system\\server\\index.js';
let content = fs.readFileSync(file, 'utf8');

const injection = `
// POST /api/corporate-accounts
app.post('/api/corporate-accounts', async (req, res) => {
  try {
    const { company_name, account_number, contact_person, contact_email, contact_phone, credit_limit } = req.body;
    
    // Check if account_number exists
    const existing = await pool.query("SELECT * FROM hotel_corporate_accounts WHERE account_number = $1", [account_number]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Account number already exists.' });
    }

    const result = await pool.query(
      \`INSERT INTO hotel_corporate_accounts (company_name, account_number, contact_person, contact_email, contact_phone, credit_limit, balance)
       VALUES ($1, $2, $3, $4, $5, $6, 0) RETURNING *\`,
      [company_name, account_number, contact_person, contact_email, contact_phone, parseFloat(credit_limit || 0)]
    );
    res.json({ success: true, account: result.rows[0], message: 'Corporate account created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create corporate account.' });
  }
});

// PUT /api/corporate-accounts/:id
app.put('/api/corporate-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, account_number, contact_person, contact_email, contact_phone, credit_limit } = req.body;

    const existing = await pool.query("SELECT * FROM hotel_corporate_accounts WHERE account_number = $1 AND id != $2", [account_number, id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Account number already exists on another account.' });
    }

    const result = await pool.query(
      \`UPDATE hotel_corporate_accounts SET 
        company_name = $1, account_number = $2, contact_person = $3, contact_email = $4, contact_phone = $5, credit_limit = $6
       WHERE id = $7 RETURNING *\`,
      [company_name, account_number, contact_person, contact_email, contact_phone, parseFloat(credit_limit || 0), id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Account not found.' });
    res.json({ success: true, account: result.rows[0], message: 'Corporate account updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update corporate account.' });
  }
});

// DELETE /api/corporate-accounts/:id
app.delete('/api/corporate-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("UPDATE hotel_corporate_accounts SET status = 'inactive' WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Account not found.' });
    res.json({ success: true, message: 'Corporate account deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete corporate account.' });
  }
});

// GET /api/corporate-accounts/:id/ledger
app.get('/api/corporate-accounts/:id/ledger', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM hotel_corporate_ledgers WHERE account_id = $1 ORDER BY date ASC, created_at ASC", [id]);
    res.json({ success: true, ledger: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch ledger.' });
  }
});

// POST /api/reservations/:id/checkout`;

content = content.replace('// POST /api/reservations/:id/checkout', injection);
fs.writeFileSync(file, content, 'utf8');
console.log('Backend endpoints inserted!');
