const pool = require('./db');
pool.query("DELETE FROM hotel_settings WHERE key = 'email_booking_body'")
  .then(() => {
    console.log("Deleted");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
