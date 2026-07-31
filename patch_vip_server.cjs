const fs = require('fs');
let content = fs.readFileSync('server/index.js', 'utf8');

// 1. Add schema migrations
const migrationTarget = `      \`ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false\`,`;
const migrationReplacement = `      \`ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false\`,
      \`ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false\`,
      \`ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS is_repeat BOOLEAN DEFAULT false\`,
      \`ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false\`,
      \`ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS is_repeat BOOLEAN DEFAULT false\`,`;
content = content.replace(migrationTarget, migrationReplacement);

// 2. Update walkin endpoint to receive add_to_profile, is_vip, is_repeat
const walkinParamsTarget = `        purpose, payment_method, deposit_amount, payment_collected, special_requests, notes
      } = req.body;`;
const walkinParamsReplacement = `        purpose, payment_method, deposit_amount, payment_collected, special_requests, notes,
        add_to_profile, is_vip, is_repeat
      } = req.body;`;
content = content.replace(walkinParamsTarget, walkinParamsReplacement);

// 3. Conditionally create guest profile
const findGuestTarget = `      // Find or create the guest profile in hotel_guests
      const guestId = await findOrCreateGuest(null, {
        title, full_name, middle_name, gender, date_of_birth: birth_date,
        nationality, country, address, city, email, phone: phone_number,
        id_type, id_number, purpose_of_visit: purpose
      });`;
const findGuestReplacement = `      // Find or create the guest profile in hotel_guests IF add_to_profile is true
      let guestId = null;
      if (add_to_profile !== false) { // Default to true if undefined
        guestId = await findOrCreateGuest(null, {
          title, full_name, middle_name, gender, date_of_birth: birth_date,
          nationality, country, address, city, email, phone: phone_number,
          id_type, id_number, purpose_of_visit: purpose,
          is_vip, is_repeat
        });
        
        // Update VIP/Repeat status if they changed
        if (guestId) {
           await pool.query(\`UPDATE hotel_guests SET is_vip = $1, is_repeat = $2 WHERE id = $3\`, [is_vip ? true : false, is_repeat ? true : false, guestId]);
        }
      }`;
content = content.replace(findGuestTarget, findGuestReplacement);

// 4. Update reservation INSERT to include is_vip, is_repeat
const insertResTarget = `          room_number, payment_collected || false,
          special_requests || '', notes || '', rate_code || '',
          title || '', middle_name || '', gender || '',
          birth_date || null, nationality || '', country || '',
          address || '', city || '', id_type || '', id_number || '',
          purpose || '', eta || '', payment_method || '', deposit_amount || 0,
          initialStatus, guestId
        ]`;
const insertResReplacement = `          room_number, payment_collected || false,
          special_requests || '', notes || '', rate_code || '',
          title || '', middle_name || '', gender || '',
          birth_date || null, nationality || '', country || '',
          address || '', city || '', id_type || '', id_number || '',
          purpose || '', eta || '', payment_method || '', deposit_amount || 0,
          initialStatus, guestId, is_vip ? true : false, is_repeat ? true : false
        ]`;
content = content.replace(insertResTarget, insertResReplacement);

const insertSqlTarget = `          room_number, payment_collected,
          special_requests, front_desk_notes, rate_code,
          title, middle_name, gender, date_of_birth, nationality, country,
          address, city, id_type, id_number, purpose_of_visit,
          eta, payment_method, deposit_amount, status, guest_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
        ) RETURNING *`;
const insertSqlReplacement = `          room_number, payment_collected,
          special_requests, front_desk_notes, rate_code,
          title, middle_name, gender, date_of_birth, nationality, country,
          address, city, id_type, id_number, purpose_of_visit,
          eta, payment_method, deposit_amount, status, guest_id, is_vip, is_repeat
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35
        ) RETURNING *`;
content = content.replace(insertSqlTarget, insertSqlReplacement);

fs.writeFileSync('server/index.js', content, 'utf8');
console.log('Successfully patched server for VIP/Repeat flags.');
