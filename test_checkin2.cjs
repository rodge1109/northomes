const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/reservations/1/checkin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({ roomNumber: '101', idVerified: true, paymentCollected: true }));
req.end();
