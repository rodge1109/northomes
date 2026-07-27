require('dotenv').config();

const resendApiKey = process.env.RESEND_API_KEY;
const emailUser = process.env.EMAIL_USER;
const toEmail = 'rodge.tonacao@gmail.com';
const fromAddress = `Northomes Pensione <${emailUser}>`;

console.log('Testing email using Resend API...');
console.log('API Key present:', !!resendApiKey);

async function testResend() {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: toEmail,
        subject: 'Test Email via Resend - Northomes Pensionne',
        html: '<p>This is a test email sent using the Resend API to verify the new configuration.</p>'
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.error('Test email failed:', data.message || 'Failed to send via Resend API');
    } else {
      console.log('Test email sent successfully via Resend!', data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testResend();
