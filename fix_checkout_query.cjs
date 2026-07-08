const fs = require('fs');
const file = 'c:\\website\\northomes-system\\server\\index.js';
let content = fs.readFileSync(file, 'utf8');

const findQuery = `        await pool.query(
          \`INSERT INTO hotel_folio_payments (reservation_id, description, amount, method, ref_number)
           VALUES ($1, $2, $3, $4, $5)\`,
          [id, 'Corporate Transfer', balance, 'Corporate', \`CORP-\${corporateAccountId}\`]
        );`;

const replaceQuery = `        await pool.query(
          \`INSERT INTO hotel_folio_payments (reservation_id, payment_method, amount, reference)
           VALUES ($1, $2, $3, $4)\`,
          [id, 'Corporate Transfer', balance, \`CORP-\${corporateAccountId}\`]
        );`;

content = content.replace(findQuery, replaceQuery);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed folio payment insert query!');
