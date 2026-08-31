const fs = require('fs');

let content = fs.readFileSync('server/index.js', 'utf8');

const target1 = "updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
const repl1 = `updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          company          TEXT DEFAULT ''`;

if (content.includes(target1) && !content.includes("company          TEXT DEFAULT ''")) {
  content = content.replace(target1, repl1);
}

// Add ALTER TABLE just to be safe
const target2 = "console.log('Backfill migration to dedicated guests table completed successfully.');";
const repl2 = `console.log('Backfill migration to dedicated guests table completed successfully.');
    }
    await pool.query('ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS company TEXT DEFAULT \\'\\'');`;

if (content.includes(target2) && !content.includes("ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS company TEXT")) {
  content = content.replace(target2, repl2);
}

fs.writeFileSync('server/index.js', content);
console.log('Patched server/index.js');
