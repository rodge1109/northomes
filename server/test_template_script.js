require('dotenv').config();

const resendApiKey = process.env.RESEND_API_KEY;
const emailUser = process.env.EMAIL_USER;
const toEmail = 'rodge.tonacao@gmail.com';
const fromAddress = `Northomes Pensione <${emailUser}>`;

const reservation = {
  full_name: 'John Doe',
  room_type: 'Deluxe Queen',
  check_in_date: '2026-08-01',
  check_out_date: '2026-08-03',
  number_of_guests: 2,
  id: 'RES-00123'
};

const subject = 'Booking Confirmation - Northomes Pensionne';
const rawBody = `<h2 style="color: #00754A;">Booking Confirmed!</h2>
<p>Dear <strong>{{full_name}}</strong>,</p>
<p>Your reservation has been successfully confirmed. Below are your booking details:</p>
<ul style="background: #ffffff; padding: 15px 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
  <li><strong>Room Type:</strong> {{room_type}}</li>
  <li><strong>Check-in:</strong> {{check_in_date}}</li>
  <li><strong>Check-out:</strong> {{check_out_date}}</li>
  <li><strong>Guests:</strong> {{number_of_guests}}</li>
  <li><strong>Reference ID:</strong> {{id}}</li>
</ul>
<h3 style="color: #c92a2a; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">CANCELLATION POLICY</h3>
<p style="font-size: 14px; color: #555;">
  <strong>Standard Cancellation:</strong> Cancellations made 48 hours or more before the check-in date will be processed without any penalty.<br><br>
  <strong>Late Cancellation:</strong> Cancellations made within 48 hours of your check-in date will be charged a cancellation fee equivalent to the first night's stay.<br><br>
  <strong>No-Show:</strong> Failure to arrive on the scheduled check-in date will result in a no-show charge equivalent to the full amount of the reservation.
</p>`;

const body = rawBody
  .replace(/\{\{full_name\}\}/g, reservation.full_name)
  .replace(/\{\{room_type\}\}/g, reservation.room_type)
  .replace(/\{\{check_in_date\}\}/g, reservation.check_in_date)
  .replace(/\{\{check_out_date\}\}/g, reservation.check_out_date)
  .replace(/\{\{number_of_guests\}\}/g, reservation.number_of_guests)
  .replace(/\{\{id\}\}/g, reservation.id);

const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #00754A; padding: 20px; text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0;">Northomes Pensionne</h1>
    </div>
    <div style="padding: 30px; background: #f5f5f5;">
      ${body}
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">
          Northomes Pensionne<br>
          Phone: +63 912 345 6789<br>
          Email: info@northomespensione.com
        </p>
      </div>
    </div>
  </div>
`;

async function sendTemplate() {
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
        subject: subject,
        html: html
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Template email failed:', data);
    } else {
      console.log('Template email sent successfully!', data);
    }
  } catch (err) {
    console.error(err);
  }
}

sendTemplate();
