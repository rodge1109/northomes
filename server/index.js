const express = require('express');
const cors = require('cors');
const pool = require('./db');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload endpoint
app.post('/api/upload', upload.array('photos', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ success: true, urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload files.' });
  }
});

// Simple in-memory session store (for demo - use Redis in production)
const sessions = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Base URL for the frontend (change this in production)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Semaphore SMS API configuration
const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY || '';
const SEMAPHORE_SENDER_NAME = process.env.SEMAPHORE_SENDER_NAME || 'CLINIC';

// Function to send SMS via Semaphore
const sendSMS = async (phoneNumber, message) => {
  if (!SEMAPHORE_API_KEY) {
    console.log('SMS not sent - SEMAPHORE_API_KEY not configured');
    return false;
  }

  try {
    // Format phone number for Philippines (remove leading 0, add 63)
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '63' + formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith('63')) {
      formattedNumber = '63' + formattedNumber;
    }

    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: SEMAPHORE_API_KEY,
        number: formattedNumber,
        message: message,
        sendername: SEMAPHORE_SENDER_NAME
      })
    });

    const data = await response.json();
    console.log('SMS sent to:', formattedNumber, data);
    return true;
  } catch (error) {
    console.error('SMS error:', error);
    return false;
  }
};

// Function to send confirmation email
const sendConfirmationEmail = async (appointment) => {
  const cancelUrl = `${FRONTEND_URL}?page=my-appointment&token=${appointment.cancel_token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: appointment.email,
    subject: 'Appointment Confirmation - HealthCare Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1c1917; padding: 20px; text-align: center;">
          <h1 style="color: #E4FE7B; margin: 0;">HealthCare Clinic</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #1c1917;">Appointment Confirmed!</h2>
          <p>Dear <strong>${appointment.full_name}</strong>,</p>
          <p>Your appointment has been successfully booked. Here are your details:</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${appointment.service_type}</p>
            <p><strong>Date:</strong> ${appointment.preferred_date}</p>
            <p><strong>Time:</strong> ${appointment.preferred_time}</p>
            <p><strong>Reference ID:</strong> #${appointment.id}</p>
          </div>

          <p style="color: #666;">Please arrive 10 minutes before your scheduled time.</p>

          <div style="margin: 25px 0; text-align: center;">
            <a href="${cancelUrl}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Cancel Appointment
            </a>
            <p style="color: #888; font-size: 12px; margin-top: 10px;">
              Or manage your appointment at: <a href="${cancelUrl}" style="color: #1c1917;">${FRONTEND_URL}?page=my-appointment</a>
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              HealthCare Clinic<br>
              Cantecson, Gairan, Bogo City, Cebu<br>
              Phone: +63 912 345 6789
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', appointment.email);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ─── Hotel Reservations ───────────────────────────────────────────────────────

const sendHotelConfirmationEmail = async (reservation) => {
  let settings = {};
  try {
    const result = await pool.query('SELECT key, value FROM hotel_settings');
    result.rows.forEach(r => settings[r.key] = r.value);
  } catch (err) { console.error('Error fetching settings', err); }

  const subject = settings.email_booking_subject || 'Booking Confirmation - Northomes Pensionne';
  const rawBody = settings.email_booking_body || `<h2 style="color: #1E3932;">Booking Confirmed!</h2><p>Dear <strong>{{full_name}}</strong>,</p><p>Your reservation has been successfully confirmed.</p>`;
  
  const body = rawBody
    .replace(/\{\{full_name\}\}/g, reservation.full_name || '')
    .replace(/\{\{room_type\}\}/g, reservation.room_type || '')
    .replace(/\{\{check_in_date\}\}/g, reservation.check_in_date || '')
    .replace(/\{\{check_out_date\}\}/g, reservation.check_out_date || '')
    .replace(/\{\{number_of_guests\}\}/g, reservation.number_of_guests || '')
    .replace(/\{\{id\}\}/g, reservation.id || '');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reservation.email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1E3932; padding: 20px; text-align: center;">
          <h1 style="color: #CBA258; margin: 0;">${settings.hotel_name || 'Northomes Pensionne'}</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          ${body}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              ${settings.hotel_name || 'Northomes Pensionne'}<br>
              Phone: ${settings.hotel_phone || '+63 912 345 6789'}<br>
              Email: ${settings.hotel_email || 'info@northomespensione.com'}
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Hotel confirmation email sent to:', reservation.email);
    return true;
  } catch (error) {
    console.error('Error sending hotel confirmation email:', error);
    return false;
  }
};

// Ensure the reservations table exists
const initReservationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_reservations (
      id            SERIAL PRIMARY KEY,
      full_name     TEXT NOT NULL,
      phone_number  TEXT NOT NULL,
      email         TEXT NOT NULL,
      room_type     TEXT NOT NULL,
      check_in_date DATE NOT NULL,
      check_out_date DATE NOT NULL,
      number_of_guests INTEGER NOT NULL DEFAULT 1,
      special_requests TEXT DEFAULT '',
      status        TEXT NOT NULL DEFAULT 'pending',
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
initReservationsTable().catch(err => console.error('Failed to init reservations table:', err));

// ─── Front Desk columns (safe, additive migrations) ───────────────────────────
const initFrontDeskColumns = async () => {
  const migrations = [
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS room_number TEXT`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMP`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT false`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS payment_collected BOOLEAN DEFAULT false`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS front_desk_notes TEXT DEFAULT ''`,
    // Guest profile extended fields
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS title TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS middle_name TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS date_of_birth DATE`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS country TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS city TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS id_type TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS id_number TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS purpose_of_visit TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS eta TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT ''`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2) DEFAULT 0`,
    `ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false`,
  ];
  for (const sql of migrations) await pool.query(sql);
  console.log('Front desk columns ready.');
};
initFrontDeskColumns().catch(err => console.error('Front desk column migration failed:', err));

// ─── Folio Tables ──────────────────────────────────────────────────────────────
const initFolioTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_folio_items (
      id             SERIAL PRIMARY KEY,
      reservation_id INTEGER NOT NULL,
      charge_type    TEXT NOT NULL,
      description    TEXT NOT NULL DEFAULT '',
      quantity       INTEGER NOT NULL DEFAULT 1,
      unit_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
      amount         NUMERIC(10,2) NOT NULL,
      posted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      voided         BOOLEAN NOT NULL DEFAULT false,
      void_reason    TEXT DEFAULT ''
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_folio_payments (
      id             SERIAL PRIMARY KEY,
      reservation_id INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      amount         NUMERIC(10,2) NOT NULL,
      reference      TEXT DEFAULT '',
      posted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      voided         BOOLEAN NOT NULL DEFAULT false
    )
  `);
  console.log('Folio tables ready.');
};
initFolioTables().catch(err => console.error('Folio table init failed:', err));

const initNightAuditTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_night_audit_logs (
      audit_date DATE PRIMARY KEY,
      run_by TEXT,
      total_charges_posted INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};
initNightAuditTable().catch(err => console.error('Night audit table init failed:', err));

const initGuestCheckinColumn = async () => {
  await pool.query(`ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS guest_arrived_at TIMESTAMP`);
  console.log('Guest arrived column ready.');
};
initGuestCheckinColumn().catch(err => console.error('Guest checkin column migration failed:', err));

// Initialize queue_settings table for queue system
const initQueueSettings = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS queue_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  // Seed default settings
  await pool.query(`
    INSERT INTO queue_settings (key, value) VALUES
      ('marquee_text', 'Welcome to our service queue system'),
      ('display_template', 'template1')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `);
  console.log('Queue settings table ready.');
};
initQueueSettings().catch(err => console.error('Queue settings table init failed:', err));

// Ensure rooms table exists and auto-discover from existing reservations
const initRoomsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_rooms (
      room_number TEXT PRIMARY KEY,
      room_type   TEXT NOT NULL DEFAULT '',
      floor       INTEGER NOT NULL DEFAULT 1,
      hk_status   TEXT NOT NULL DEFAULT 'clean',
      notes       TEXT DEFAULT '',
      active      BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // (removed: no longer auto-seed rooms from hotel_reservations)
  
  // Create sample rooms if none exist
  const check = await pool.query('SELECT COUNT(*) FROM hotel_rooms');
  if (parseInt(check.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO hotel_rooms (room_number, room_type, floor) VALUES
        ('101', 'Standard Room', 1), ('102', 'Standard Room', 1), ('103', 'Standard Room', 1), ('104', 'Standard Room', 1), ('105', 'Standard Room', 1),
        ('201', 'Deluxe Room', 2), ('202', 'Deluxe Room', 2), ('203', 'Deluxe Room', 2), ('204', 'Deluxe Room', 2),
        ('301', 'Suite', 3), ('302', 'Suite', 3),
        ('401', 'Family Room', 4), ('402', 'Family Room', 4), ('403', 'Family Room', 4),
        ('501', 'Presidential Suite', 5)
      ON CONFLICT (room_number) DO NOTHING
    `);
    console.log('Sample rooms created for testing.');
  }
  console.log('Rooms table ready.');
};
initRoomsTable().catch(err => console.error('Rooms table init failed:', err));

// Ensure room_types table exists and seed defaults
const initRoomTypesTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_room_types (
      id              SERIAL PRIMARY KEY,
      name            TEXT NOT NULL UNIQUE,
      description     TEXT DEFAULT '',
      total_rooms     INTEGER NOT NULL DEFAULT 1,
      price_per_night NUMERIC(10,2) NOT NULL DEFAULT 0,
      max_guests      INTEGER NOT NULL DEFAULT 2,
      amenities       TEXT DEFAULT '',
      floor           INTEGER NOT NULL DEFAULT 1,
      area            TEXT DEFAULT '',
      active          BOOLEAN NOT NULL DEFAULT true,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Migrate existing tables that may not have these columns yet
  await pool.query(`ALTER TABLE hotel_room_types ADD COLUMN IF NOT EXISTS floor INTEGER NOT NULL DEFAULT 1`);
  await pool.query(`ALTER TABLE hotel_room_types ADD COLUMN IF NOT EXISTS area  TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE hotel_room_types ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`);
  const { rows } = await pool.query('SELECT COUNT(*) FROM hotel_room_types');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO hotel_room_types (name, description, total_rooms, price_per_night, max_guests, amenities) VALUES
        ('Standard Room',      '1 Queen Bed · City or Garden View',            5, 2500,  2, 'Free Wi-Fi, Air Conditioning, TV'),
        ('Deluxe Room',        '1 King Bed · City or Garden View',             4, 4500,  2, 'Free Wi-Fi, Air Conditioning, TV, Mini Bar'),
        ('Suite',              'Separate living area · Premium Amenities',     2, 9000,  3, 'Free Wi-Fi, Air Conditioning, TV, Mini Bar, Jacuzzi'),
        ('Family Room',        '2 Queen Beds · Spacious · City View',         3, 6500,  4, 'Free Wi-Fi, Air Conditioning, TV, Kitchenette'),
        ('Presidential Suite', 'Full Floor · Butler Service · Premium Views', 1, 25000, 6, 'All amenities, Butler Service, Private Pool')
    `);
    console.log('Room types seeded with defaults.');
  }
};
initRoomTypesTable().catch(err => console.error('Failed to init room_types table:', err));

// POST /api/reservations — create a new hotel reservation
app.post('/api/reservations', async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !email || !roomType || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.'
      });
    }

    // Ensure check-out is after check-in
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date.'
      });
    }

    // 1. Exact duplicate — same guest email booking the same room type on the same check-in date
    const exactDupe = await pool.query(
      `SELECT id FROM hotel_reservations
       WHERE email = $1
         AND room_type = $2
         AND check_in_date = $3
         AND status != 'cancelled'`,
      [email, roomType, checkInDate]
    );

    if (exactDupe.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `You already have a reservation for a ${roomType} room starting on ${checkInDate}. Please check your existing booking or choose different dates.`
      });
    }

    // 2. Room inventory check — count overlapping bookings vs total rooms of this type
    const roomTypeInfo = await pool.query(
      'SELECT total_rooms FROM hotel_room_types WHERE name = $1 AND active = true',
      [roomType]
    );
    const totalRooms = roomTypeInfo.rows.length > 0 ? roomTypeInfo.rows[0].total_rooms : 1;

    const overlapCount = await pool.query(
      `SELECT COUNT(*) as count FROM hotel_reservations
       WHERE room_type = $1
         AND status NOT IN ('cancelled', 'checked_out', 'no_show')
         AND check_in_date < $3
         AND check_out_date > $2`,
      [roomType, checkInDate, checkOutDate]
    );

    if (parseInt(overlapCount.rows[0].count) >= totalRooms) {
      return res.status(409).json({
        success: false,
        message: `Sorry, all ${roomType}s are fully booked during those dates. Please choose different dates or a different room type.`
      });
    }

    // Insert the reservation
    const result = await pool.query(
      `INSERT INTO hotel_reservations
         (full_name, phone_number, email, room_type, check_in_date, check_out_date, number_of_guests, special_requests)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [fullName, phoneNumber, email, roomType, checkInDate, checkOutDate, numberOfGuests || 1, specialRequests || '']
    );

    const reservation = result.rows[0];

    // SMS confirmation (fire-and-forget)
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    const smsMessage = `Hi ${reservation.full_name}, your hotel reservation is confirmed! Room: ${reservation.room_type}, Check-in: ${reservation.check_in_date}, Check-out: ${reservation.check_out_date} (${nights} night${nights !== 1 ? 's' : ''}). Ref#${reservation.id}`;
    sendSMS(reservation.phone_number, smsMessage).catch(err => console.error('SMS error:', err));
    
    // Email confirmation (fire-and-forget)
    sendHotelConfirmationEmail(reservation).catch(err => console.error('Email error:', err));

    res.status(201).json({
      success: true,
      message: `Reservation confirmed! Your ${roomType} room is booked from ${checkInDate} to ${checkOutDate}.`,
      reservation
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation. Please try again.'
    });
  }
});

// GET /api/reservations — list all reservations (admin)
app.get('/api/reservations', async (req, res) => {
  try {
    const { query, startDate, endDate, status } = req.query;
    
    let sql = 'SELECT * FROM hotel_reservations WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (query) {
      sql += ` AND (full_name ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR phone_number ILIKE $${paramIdx})`;
      params.push(`%${query}%`);
      paramIdx++;
    }
    if (startDate) {
      sql += ` AND check_in_date >= $${paramIdx}`;
      params.push(startDate);
      paramIdx++;
    }
    if (endDate) {
      sql += ` AND check_in_date <= $${paramIdx}`;
      params.push(endDate);
      paramIdx++;
    }
    if (status && status !== 'all') {
      sql += ` AND status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await pool.query(sql, params);
    res.json({ success: true, reservations: result.rows });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reservations.' });
  }
});

// GET /api/room-types — list all active room types (public)
app.get('/api/room-types', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hotel_room_types WHERE active = true ORDER BY price_per_night ASC'
    );
    res.json({ success: true, roomTypes: result.rows });
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch room types.' });
  }
});

// GET /api/room-types/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
app.get('/api/room-types/availability', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'checkIn and checkOut are required.' });
    }

    const roomTypes = await pool.query(
      'SELECT * FROM hotel_room_types WHERE active = true ORDER BY price_per_night ASC'
    );

    const availability = await Promise.all(
      roomTypes.rows.map(async (rt) => {
        const booked = await pool.query(
          `SELECT COUNT(*) as count FROM hotel_reservations
           WHERE room_type = $1
             AND status NOT IN ('cancelled', 'checked_out', 'no_show')
             AND check_in_date < $3
             AND check_out_date > $2`,
          [rt.name, checkIn, checkOut]
        );
        const bookedCount = parseInt(booked.rows[0].count);
        return { ...rt, booked: bookedCount, available: Math.max(0, rt.total_rooms - bookedCount) };
      })
    );

    res.json({ success: true, availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch availability.' });
  }
});

// ── Admin room type CRUD ──────────────────────────────────────────────────────

app.get('/api/admin/room-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hotel_room_types ORDER BY price_per_night ASC');
    res.json({ success: true, roomTypes: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch room types.' });
  }
});

app.post('/api/admin/room-types', async (req, res) => {
  try {
    const { name, description, totalRooms, pricePerNight, maxGuests, amenities, floor, area, images } = req.body;
    if (!name || !totalRooms || !pricePerNight) {
      return res.status(400).json({ success: false, message: 'name, totalRooms, and pricePerNight are required.' });
    }
    const imageArray = Array.isArray(images) ? images : [];
    const result = await pool.query(
      `INSERT INTO hotel_room_types (name, description, total_rooms, price_per_night, max_guests, amenities, floor, area, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, description || '', totalRooms, pricePerNight, maxGuests || 2, amenities || '', floor || 1, area || '', JSON.stringify(imageArray)]
    );
    res.status(201).json({ success: true, roomType: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'A room type with that name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to add room type.' });
  }
});

app.put('/api/admin/room-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, totalRooms, pricePerNight, maxGuests, amenities, floor, area, active, images } = req.body;
    
    let query, params;
    if (images !== undefined) {
      const imageArray = Array.isArray(images) ? images : [];
      query = `UPDATE hotel_room_types SET
         name            = COALESCE($1, name),
         description     = COALESCE($2, description),
         total_rooms     = COALESCE($3, total_rooms),
         price_per_night = COALESCE($4, price_per_night),
         max_guests      = COALESCE($5, max_guests),
         amenities       = COALESCE($6, amenities),
         floor           = COALESCE($7, floor),
         area            = COALESCE($8, area),
         active          = COALESCE($9, active),
         images          = COALESCE($10, images)
       WHERE id = $11 RETURNING *`;
      params = [name, description, totalRooms, pricePerNight, maxGuests, amenities, floor, area, active, JSON.stringify(imageArray), id];
    } else {
      query = `UPDATE hotel_room_types SET
         name            = COALESCE($1, name),
         description     = COALESCE($2, description),
         total_rooms     = COALESCE($3, total_rooms),
         price_per_night = COALESCE($4, price_per_night),
         max_guests      = COALESCE($5, max_guests),
         amenities       = COALESCE($6, amenities),
         floor           = COALESCE($7, floor),
         area            = COALESCE($8, area),
         active          = COALESCE($9, active)
       WHERE id = $10 RETURNING *`;
      params = [name, description, totalRooms, pricePerNight, maxGuests, amenities, floor, area, active, id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room type not found.' });
    }
    res.json({ success: true, roomType: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update room type.' });
  }
});

app.delete('/api/admin/room-types/:id', async (req, res) => {
  try {
    await pool.query('UPDATE hotel_room_types SET active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Room type deactivated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to deactivate room type.' });
  }
});

// ── Hotel Settings (key-value store) ──────────────────────────────────────────
const initHotelSettingsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `);
  const defaults = {
    hotel_name: 'Grand Hotel',
    hotel_address: '123 Main Street, City',
    hotel_phone: '+63 912 345 6789',
    hotel_email: 'info@grandhotel.com',
    hotel_website: 'www.grandhotel.com',
    check_in_time: '14:00',
    check_out_time: '12:00',
    currency: 'PHP',
    min_stay_nights: '1',
    max_stay_nights: '30',
    advance_booking_days: '365',
    cancellation_policy: 'Free cancellation up to 24 hours before check-in.',
    deposit_required: 'false',
    deposit_percentage: '50',
    sms_sender_name: 'HOTEL',
    email_sender_name: 'Grand Hotel',
    email_booking_subject: 'Booking Confirmation - Northomes Pensionne',
    email_booking_body: `<h2 style="color: #1E3932;">Booking Confirmed!</h2>
<p>Dear <strong>{{full_name}}</strong>,</p>
<p>Your reservation has been successfully confirmed. Here are your details:</p>
<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p><strong>Room Type:</strong> {{room_type}}</p>
  <p><strong>Check-in Date:</strong> {{check_in_date}}</p>
  <p><strong>Check-out Date:</strong> {{check_out_date}}</p>
  <p><strong>Guests:</strong> {{number_of_guests}}</p>
  <p><strong>Reference ID:</strong> #{{id}}</p>
</div>`,
    email_reminder_subject: 'Upcoming Check-in Reminder - Northomes Pensionne',
    email_reminder_body: `<h2 style="color: #1E3932;">We're excited to see you soon!</h2>
<p>Dear <strong>{{full_name}}</strong>,</p>
<p>This is a friendly reminder that your check-in date is coming up tomorrow.</p>
<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p><strong>Room Type:</strong> {{room_type}}</p>
  <p><strong>Check-in Date:</strong> {{check_in_date}}</p>
  <p><strong>Guests:</strong> {{number_of_guests}}</p>
</div>
<p style="color: #666;">Please remember to bring a valid ID for check-in.</p>`
  };
  for (const [key, value] of Object.entries(defaults)) {
    await pool.query(
      `INSERT INTO hotel_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }
};
initHotelSettingsTable().catch(err => console.error('Failed to init hotel_settings table:', err));

app.get('/api/hotel-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM hotel_settings ORDER BY key');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

app.put('/api/hotel-settings', async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings payload.' });
    }
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO hotel_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, String(value)]
      );
    }
    res.json({ success: true, message: 'Settings saved.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
});

app.post('/api/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'Missing "to" email address.' });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Test Email - Northomes Pensionne',
      text: 'This is a test email from the Northomes Pensionne system to verify that the email settings are working correctly.'
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send test email.' });
  }
});

// ─── Front Desk Endpoints ────────────────────────────────────────────────────

// GET /api/front-desk/arrivals?date=YYYY-MM-DD
app.get('/api/front-desk/arrivals', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const arrivals = await pool.query(
      `SELECT *, guest_arrived_at FROM hotel_reservations
       WHERE check_in_date = $1
         AND status IN ('pending', 'confirmed', 'arrived')
       ORDER BY guest_arrived_at ASC NULLS LAST, created_at ASC`,
      [date]
    );
    const statsRes = await pool.query(
      `SELECT status, COUNT(*) as count FROM hotel_reservations
       WHERE check_in_date = $1
         AND status IN ('pending','confirmed','checked_in','no_show')
       GROUP BY status`,
      [date]
    );
    const stats = { total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 };
    statsRes.rows.forEach(r => {
      const n = parseInt(r.count);
      stats.total += n;
      if (r.status === 'checked_in') stats.checkedIn += n;
      if (r.status === 'pending')    stats.pending   += n;
      if (r.status === 'confirmed')  stats.confirmed += n;
      if (r.status === 'no_show')    stats.noShow    += n;
    });
    res.json({ success: true, arrivals: arrivals.rows, date, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch arrivals.' });
  }
});

// GET /api/front-desk/in-house
app.get('/api/front-desk/in-house', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM hotel_reservations WHERE status = 'checked_in' ORDER BY checked_in_at ASC`
    );
    res.json({ success: true, guests: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch in-house guests.' });
  }
});

// GET /api/front-desk/search?q=
app.get('/api/front-desk/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ success: true, reservations: [] });
    const term = `%${q}%`;
    const result = await pool.query(
      `SELECT * FROM hotel_reservations
       WHERE full_name    ILIKE $1
          OR email        ILIKE $1
          OR phone_number ILIKE $1
          OR CAST(id AS TEXT) ILIKE $1
       ORDER BY check_in_date DESC
       LIMIT 50`,
      [term]
    );
    res.json({ success: true, reservations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Search failed.' });
  }
});

// GET /api/admin/guests — unique guests with aggregate stats (grouped by email)
app.get('/api/admin/guests', async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    let query, params;
    if (search) {
      query = `
        SELECT
          email,
          MAX(full_name)     AS full_name,
          MAX(phone_number)  AS phone_number,
          COUNT(*)           AS total_bookings,
          MAX(check_in_date) AS last_stay,
          MIN(created_at)    AS first_booking,
          MAX(room_type)     AS fav_room
        FROM hotel_reservations
        WHERE email ILIKE $1 OR full_name ILIKE $1 OR phone_number ILIKE $1
        GROUP BY email
        ORDER BY last_stay DESC NULLS LAST
        LIMIT 200`;
      params = [search];
    } else {
      query = `
        SELECT
          email,
          MAX(full_name)     AS full_name,
          MAX(phone_number)  AS phone_number,
          COUNT(*)           AS total_bookings,
          MAX(check_in_date) AS last_stay,
          MIN(created_at)    AS first_booking,
          MAX(room_type)     AS fav_room
        FROM hotel_reservations
        GROUP BY email
        ORDER BY last_stay DESC NULLS LAST
        LIMIT 200`;
      params = [];
    }
    const result = await pool.query(query, params);
    res.json({ success: true, guests: result.rows });
  } catch (err) {
    console.error('GET /api/admin/guests error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/guests/history?email= — all reservations for a specific guest
app.get('/api/admin/guests/history', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: 'email required' });
    const result = await pool.query(
      `SELECT id, room_type, room_number, check_in_date, check_out_date,
              number_of_guests, status, special_requests,
              checked_in_at, checked_out_at, front_desk_notes, created_at
       FROM hotel_reservations
       WHERE email = $1
       ORDER BY check_in_date DESC`,
      [email]
    );
    res.json({ success: true, history: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch guest history.' });
  }
});

// ─── Folio Endpoints ──────────────────────────────────────────────────────────

// GET /api/folio/:reservationId — fetch full folio with totals
app.get('/api/folio/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const [resResult, itemsResult, paymentsResult] = await Promise.all([
      pool.query('SELECT * FROM hotel_reservations WHERE id = $1', [reservationId]),
      pool.query('SELECT * FROM hotel_folio_items WHERE reservation_id = $1 ORDER BY posted_at ASC', [reservationId]),
      pool.query('SELECT * FROM hotel_folio_payments WHERE reservation_id = $1 ORDER BY posted_at ASC', [reservationId]),
    ]);
    if (resResult.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    const charges = itemsResult.rows
      .filter(i => !i.voided)
      .reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const payments = paymentsResult.rows
      .filter(p => !p.voided)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    res.json({
      success: true,
      reservation: resResult.rows[0],
      items: itemsResult.rows,
      payments: paymentsResult.rows,
      totals: { charges, payments, balance: charges - payments },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch folio.' });
  }
});

// POST /api/folio/:reservationId/charge — post a charge
app.post('/api/folio/:reservationId/charge', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { charge_type, description, quantity, unit_price } = req.body;
    if (!charge_type || !unit_price)
      return res.status(400).json({ success: false, message: 'charge_type and unit_price are required.' });
    const qty = parseInt(quantity) || 1;
    const price = parseFloat(unit_price);
    const amount = qty * price;
    const result = await pool.query(
      `INSERT INTO hotel_folio_items (reservation_id, charge_type, description, quantity, unit_price, amount)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [reservationId, charge_type, description || '', qty, price, amount]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to post charge.' });
  }
});

// POST /api/folio/:reservationId/payment — record a payment
app.post('/api/folio/:reservationId/payment', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { payment_method, amount, reference } = req.body;
    if (!payment_method || !amount)
      return res.status(400).json({ success: false, message: 'payment_method and amount are required.' });
    const result = await pool.query(
      `INSERT INTO hotel_folio_payments (reservation_id, payment_method, amount, reference)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [reservationId, payment_method, parseFloat(amount), reference || '']
    );
    res.json({ success: true, payment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to record payment.' });
  }
});

// PATCH /api/folio/charge/:itemId/void — void a charge
app.patch('/api/folio/charge/:itemId/void', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { void_reason } = req.body;
    await pool.query(
      `UPDATE hotel_folio_items SET voided = true, void_reason = $1 WHERE id = $2`,
      [void_reason || '', itemId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to void charge.' });
  }
});

// PATCH /api/folio/payment/:paymentId/void — void a payment
app.patch('/api/folio/payment/:paymentId/void', async (req, res) => {
  try {
    const { paymentId } = req.params;
    await pool.query(`UPDATE hotel_folio_payments SET voided = true WHERE id = $1`, [paymentId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to void payment.' });
  }
});

// POST /api/folio/:reservationId/email — email folio to guest
app.post('/api/folio/:reservationId/email', async (req, res) => {
  try {
    const { reservationId } = req.params;

    // Fetch reservation
    const resResult = await pool.query(`SELECT * FROM hotel_reservations WHERE id = $1`, [reservationId]);
    if (!resResult.rows.length) return res.status(404).json({ success: false, message: 'Reservation not found.' });
    const reservation = resResult.rows[0];

    if (!reservation.email) return res.status(400).json({ success: false, message: 'Guest has no email on file.' });

    // Fetch charges
    const itemsResult = await pool.query(
      `SELECT * FROM hotel_folio_items WHERE reservation_id = $1 ORDER BY posted_at ASC`,
      [reservationId]
    );
    const items = itemsResult.rows;

    // Fetch payments
    const paymentsResult = await pool.query(
      `SELECT * FROM hotel_folio_payments WHERE reservation_id = $1 ORDER BY posted_at ASC`,
      [reservationId]
    );
    const payments = paymentsResult.rows;

    // Compute totals
    const totalCharges = items.filter(i => !i.voided).reduce((s, i) => s + parseFloat(i.amount), 0);
    const totalPaid = payments.filter(p => !p.voided).reduce((s, p) => s + parseFloat(p.amount), 0);
    const balance = totalCharges - totalPaid;

    // Fetch hotel name from settings
    const settingRes = await pool.query(`SELECT value FROM hotel_settings WHERE key = 'hotel_name'`);
    const hotelName = settingRes.rows[0]?.value || 'Hotel';

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtAmt = (n) => `₱${parseFloat(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const nights = Math.round((new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) / 86400000);

    const chargeRows = items.map(i => `
      <tr style="${i.voided ? 'opacity:0.4;text-decoration:line-through;' : ''}">
        <td style="padding:6px 8px;">${i.charge_type}</td>
        <td style="padding:6px 8px;">${i.description || '—'}</td>
        <td style="padding:6px 8px;text-align:center;">${i.quantity}</td>
        <td style="padding:6px 8px;text-align:right;">${fmtAmt(i.unit_price)}</td>
        <td style="padding:6px 8px;text-align:right;">${i.voided ? '<span style="color:#ef4444">VOID</span>' : fmtAmt(i.amount)}</td>
      </tr>`).join('');

    const paymentRows = payments.map(p => `
      <tr style="${p.voided ? 'opacity:0.4;text-decoration:line-through;' : ''}">
        <td style="padding:6px 8px;">${p.payment_method}</td>
        <td style="padding:6px 8px;">${p.reference || '—'}</td>
        <td style="padding:6px 8px;text-align:right;">${p.voided ? '<span style="color:#ef4444">VOID</span>' : fmtAmt(p.amount)}</td>
        <td style="padding:6px 8px;color:#888;font-size:12px;">${fmt(p.posted_at)}</td>
      </tr>`).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#222;">
        <h2 style="margin:0 0 4px;">${hotelName}</h2>
        <p style="margin:0 0 20px;color:#666;font-size:13px;">Guest Folio</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:4px 0;color:#666;width:140px;">Guest</td><td style="padding:4px 0;font-weight:bold;">${reservation.full_name}</td></tr>
          <tr><td style="padding:4px 0;color:#666;">Room</td><td style="padding:4px 0;">${reservation.room_number || '—'} &middot; ${reservation.room_type}</td></tr>
          <tr><td style="padding:4px 0;color:#666;">Check-in</td><td style="padding:4px 0;">${fmt(reservation.check_in_date)}</td></tr>
          <tr><td style="padding:4px 0;color:#666;">Check-out</td><td style="padding:4px 0;">${fmt(reservation.check_out_date)}</td></tr>
          <tr><td style="padding:4px 0;color:#666;">Nights</td><td style="padding:4px 0;">${nights}</td></tr>
        </table>

        <h3 style="margin:0 0 8px;border-bottom:1px solid #ddd;padding-bottom:6px;">Charges</h3>
        ${items.length === 0 ? '<p style="color:#999;font-size:13px;">No charges posted.</p>' : `
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="background:#f5f5f5;">
            <th style="padding:6px 8px;text-align:left;">Type</th>
            <th style="padding:6px 8px;text-align:left;">Description</th>
            <th style="padding:6px 8px;text-align:center;">Qty</th>
            <th style="padding:6px 8px;text-align:right;">Unit Price</th>
            <th style="padding:6px 8px;text-align:right;">Amount</th>
          </tr></thead>
          <tbody>${chargeRows}</tbody>
          <tfoot><tr style="background:#eff6ff;font-weight:bold;">
            <td colspan="4" style="padding:8px;text-align:right;">Total Charges</td>
            <td style="padding:8px;text-align:right;">${fmtAmt(totalCharges)}</td>
          </tr></tfoot>
        </table>`}

        <h3 style="margin:20px 0 8px;border-bottom:1px solid #ddd;padding-bottom:6px;">Payments</h3>
        ${payments.length === 0 ? '<p style="color:#999;font-size:13px;">No payments recorded.</p>' : `
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="background:#f5f5f5;">
            <th style="padding:6px 8px;text-align:left;">Method</th>
            <th style="padding:6px 8px;text-align:left;">Reference</th>
            <th style="padding:6px 8px;text-align:right;">Amount</th>
            <th style="padding:6px 8px;text-align:left;">Date</th>
          </tr></thead>
          <tbody>${paymentRows}</tbody>
          <tfoot><tr style="background:#f0fdf4;font-weight:bold;">
            <td colspan="2" style="padding:8px;text-align:right;">Total Paid</td>
            <td style="padding:8px;text-align:right;">${fmtAmt(totalPaid)}</td>
            <td></td>
          </tr></tfoot>
        </table>`}

        <div style="margin-top:20px;padding:16px;border-radius:8px;background:${balance > 0 ? '#fef3c7' : '#f0fdf4'};text-align:right;">
          <span style="font-size:16px;font-weight:bold;color:${balance > 0 ? '#b45309' : '#15803d'};">
            ${balance > 0 ? `Balance Due: ${fmtAmt(balance)}` : 'Folio Settled ✓'}
          </span>
        </div>

        <p style="margin-top:24px;color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">
          This is an official folio from ${hotelName}. For questions, please contact the front desk.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: reservation.email,
      subject: `Your Folio — ${hotelName}`,
      html,
    });

    res.json({ success: true, message: `Folio sent to ${reservation.email}` });
  } catch (err) {
    console.error('Folio email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send folio email.' });
  }
});

// POST /api/front-desk/walkin — create reservation + immediately check in (walk-in guest)
app.post('/api/front-desk/walkin', async (req, res) => {
  try {
    const {
      full_name, email, phone, room_type,
      check_in_date, check_out_date, number_of_guests,
      room_number, payment_collected, special_requests, notes, rate_code,
      title, middle_name, gender, birth_date, nationality, country,
      address, city, id_type, id_number, purpose, eta,
      payment_method, deposit_amount,
    } = req.body;
    if (!full_name || !room_type || !check_in_date || !check_out_date || !room_number) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    // 1. Room-type inventory check — prevent overbooking
    const rtInfo = await pool.query(
      'SELECT total_rooms FROM hotel_room_types WHERE name = $1 AND active = true',
      [room_type]
    );
    const totalRooms = rtInfo.rows.length > 0 ? parseInt(rtInfo.rows[0].total_rooms) : 999;
    const overlap = await pool.query(
      `SELECT COUNT(*) as count FROM hotel_reservations
       WHERE room_type = $1
         AND status NOT IN ('cancelled', 'checked_out', 'no_show')
         AND check_in_date < $2
         AND check_out_date > $3`,
      [room_type, check_out_date, check_in_date]
    );
    if (parseInt(overlap.rows[0].count) >= totalRooms) {
      return res.status(409).json({
        success: false,
        message: `No ${room_type} rooms available for those dates (${overlap.rows[0].count}/${totalRooms} occupied). Choose a different room type or dates.`
      });
    }

    // 2. Room-number conflict check — prevent double-assigning same physical room
    const roomConflict = await pool.query(
      `SELECT id, full_name, check_in_date, check_out_date FROM hotel_reservations
       WHERE room_number = $1
         AND status NOT IN ('cancelled', 'checked_out', 'no_show')
         AND check_in_date < $2
         AND check_out_date > $3`,
      [room_number, check_out_date, check_in_date]
    );
    if (roomConflict.rows.length > 0) {
      const c = roomConflict.rows[0];
      return res.status(409).json({
        success: false,
        message: `Room ${room_number} is already booked from ${c.check_in_date.toISOString().slice(0,10)} to ${c.check_out_date.toISOString().slice(0,10)} (${c.full_name}).`
      });
    }
    const checkInDate = new Date(check_in_date + 'T00:00:00');
    const isToday = checkInDate.toDateString() === new Date().toDateString();
    const isFuture = checkInDate > new Date();
    const initialStatus = (isToday || !isFuture) ? 'checked_in' : 'confirmed';
    const result = await pool.query(
      `INSERT INTO hotel_reservations
         (full_name, email, phone_number, room_type, check_in_date, check_out_date,
          number_of_guests, room_number, payment_collected, special_requests,
          front_desk_notes, rate_code, status, checked_in_at, guest_arrived_at,
          title, middle_name, gender, date_of_birth, nationality, country,
          address, city, id_type, id_number, purpose_of_visit, eta,
          payment_method, deposit_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$27,
               CASE WHEN $27='checked_in' THEN NOW() ELSE NULL END,
               CASE WHEN $27='checked_in' THEN NOW() ELSE NULL END,
               $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
       RETURNING *`,
      [
        full_name, email || '', phone || '', room_type,
        check_in_date, check_out_date, number_of_guests || 1,
        room_number, payment_collected || false,
        special_requests || '', notes || '', rate_code || '',
        title || '', middle_name || '', gender || '',
        birth_date || null, nationality || '', country || '',
        address || '', city || '', id_type || '', id_number || '',
        purpose || '', eta || '', payment_method || '', deposit_amount || 0,
        initialStatus,
      ]
    );
    // Auto-upsert room record
    await pool.query(
      `INSERT INTO hotel_rooms (room_number, room_type) VALUES ($1,$2) ON CONFLICT (room_number) DO NOTHING`,
      [room_number, room_type || '']
    );
    res.json({ success: true, reservation: result.rows[0] });
  } catch (err) {
    console.error('Walk-in error:', err);
    res.status(500).json({ success: false, message: 'Walk-in check-in failed.' });
  }
});

// PATCH /api/reservations/:id/profile — update guest profile fields
app.patch('/api/reservations/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, full_name, middle_name, gender, date_of_birth,
      nationality, country, address, city,
      email, phone_number,
      id_type, id_number,
      purpose_of_visit, eta,
      payment_method, deposit_amount,
      special_requests, front_desk_notes,
    } = req.body;
    const result = await pool.query(
      `UPDATE hotel_reservations SET
         title = COALESCE($1, title),
         full_name = COALESCE($2, full_name),
         middle_name = COALESCE($3, middle_name),
         gender = COALESCE($4, gender),
         date_of_birth = $5,
         nationality = COALESCE($6, nationality),
         country = COALESCE($7, country),
         address = COALESCE($8, address),
         city = COALESCE($9, city),
         email = COALESCE($10, email),
         phone_number = COALESCE($11, phone_number),
         id_type = COALESCE($12, id_type),
         id_number = COALESCE($13, id_number),
         purpose_of_visit = COALESCE($14, purpose_of_visit),
         eta = COALESCE($15, eta),
         payment_method = COALESCE($16, payment_method),
         deposit_amount = COALESCE($17, deposit_amount),
         special_requests = COALESCE($18, special_requests),
         front_desk_notes = COALESCE($19, front_desk_notes)
       WHERE id = $20
       RETURNING *`,
      [
        title, full_name, middle_name, gender,
        date_of_birth || null,
        nationality, country, address, city,
        email, phone_number,
        id_type, id_number,
        purpose_of_visit, eta,
        payment_method, deposit_amount != null ? deposit_amount : null,
        special_requests, front_desk_notes,
        id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Reservation not found.' });
    res.json({ success: true, reservation: result.rows[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update guest profile.' });
  }
});

// GET /api/front-desk/tape-chart?from=YYYY-MM-DD
app.get('/api/front-desk/tape-chart', async (req, res) => {
  try {
    const from = req.query.from || new Date().toISOString().slice(0, 10);
    const toDate = new Date(from + 'T00:00:00');
    toDate.setDate(toDate.getDate() + 31); // +1 buffer day
    const to = toDate.toISOString().slice(0, 10);
    const [roomsRes, resvRes] = await Promise.all([
      pool.query(`
        SELECT room_number, room_type, floor FROM hotel_rooms WHERE active = true
        UNION
        SELECT DISTINCT room_number, room_type, NULL::integer as floor FROM hotel_reservations
          WHERE status NOT IN ('cancelled', 'no_show', 'checked_out')
            AND room_number IS NOT NULL AND room_number <> ''
            AND check_out_date >= CURRENT_DATE
            AND room_number NOT IN (SELECT room_number FROM hotel_rooms WHERE active = true)
        ORDER BY room_type, room_number
      `),
      pool.query(
        `SELECT id, full_name, room_number, room_type, check_in_date, check_out_date,
                checked_out_at, status, rate_code, number_of_guests
         FROM hotel_reservations
         WHERE status NOT IN ('cancelled', 'no_show')
           AND check_in_date < $1
           AND check_out_date > $2
         ORDER BY check_in_date`,
        [to, from]
      ),
    ]);
    let rooms = roomsRes.rows;
    let typeView = false;
    // Fallback: no individual rooms configured → show room_types as rows
    if (rooms.length === 0) {
      const rtRes = await pool.query(
        `SELECT name as room_type, total_rooms FROM hotel_room_types WHERE active = true ORDER BY name`
      );
      rooms = rtRes.rows.map(rt => ({
        room_number: rt.room_type,
        room_type:   rt.room_type,
        floor:       null,
        type_row:    true,
        total_rooms: rt.total_rooms,
      }));
      typeView = true;
    }
    res.json({ success: true, rooms, reservations: resvRes.rows, typeView });
  } catch (err) {
    console.error('Tape chart error:', err);
    res.status(500).json({ success: false, message: 'Failed to load tape chart.' });
  }
});

// ─── Rooms endpoints ──────────────────────────────────────────────────────────

// GET /api/rooms — all active rooms with computed occupancy status
app.get('/api/rooms', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*,
        CASE
          WHEN r.hk_status = 'out_of_order' THEN 'out_of_order'
          WHEN res.status = 'checked_in' AND res.check_out_date::date = CURRENT_DATE THEN 'due_out'
          WHEN res.status = 'checked_in' THEN 'occupied'
          WHEN res.status IN ('pending','confirmed') AND res.check_in_date::date = CURRENT_DATE THEN 'arriving'
          WHEN r.hk_status = 'dirty' THEN 'dirty'
          WHEN r.hk_status = 'inspected' THEN 'inspected'
          ELSE 'available'
        END as computed_status,
        res.id as reservation_id, res.full_name as guest_name,
        res.check_in_date, res.check_out_date, res.number_of_guests,
        res.status as reservation_status
      FROM hotel_rooms r
      LEFT JOIN hotel_reservations res ON res.room_number = r.room_number
        AND res.status IN ('checked_in','pending','confirmed')
        AND res.check_out_date >= CURRENT_DATE
      WHERE r.active = true
      ORDER BY r.floor ASC, r.room_number ASC
    `);
    res.json({ success: true, rooms: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms.' });
  }
});

// POST /api/rooms — add a room manually
app.post('/api/rooms', async (req, res) => {
  try {
    const { room_number, room_type, floor } = req.body;
    if (!room_number) return res.status(400).json({ success: false, message: 'room_number required.' });
    const result = await pool.query(
      `INSERT INTO hotel_rooms (room_number, room_type, floor)
       VALUES ($1, $2, $3)
       ON CONFLICT (room_number) DO UPDATE SET room_type=$2, floor=$3, active=true
       RETURNING *`,
      [room_number.trim(), room_type || '', parseInt(floor) || 1]
    );
    res.json({ success: true, room: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add room.' });
  }
});

// PUT /api/rooms/:roomNumber/hk-status — update housekeeping status
app.put('/api/rooms/:roomNumber/hk-status', async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { status, notes } = req.body;
    const valid = ['clean', 'dirty', 'inspected', 'out_of_order'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
    const result = await pool.query(
      `UPDATE hotel_rooms SET hk_status=$1${notes !== undefined ? ', notes=$3' : ''} WHERE room_number=$2 RETURNING *`,
      notes !== undefined ? [status, roomNumber, notes] : [status, roomNumber]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Room not found.' });
    res.json({ success: true, room: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update HK status.' });
  }
});

// DELETE /api/rooms/:roomNumber — soft delete
app.delete('/api/rooms/:roomNumber', async (req, res) => {
  try {
    await pool.query(`UPDATE hotel_rooms SET active=false WHERE room_number=$1`, [req.params.roomNumber]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to remove room.' });
  }
});

// POST /api/reservations/:id/checkin
app.post('/api/reservations/:id/checkin', async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, idVerified, paymentCollected, notes } = req.body;
    const existing = await pool.query('SELECT * FROM hotel_reservations WHERE id = $1', [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    if (['checked_in', 'checked_out'].includes(existing.rows[0].status))
      return res.status(409).json({ success: false, message: `Guest is already ${existing.rows[0].status.replace('_', ' ')}.` });
    // Check for room-level date conflict (exclude this reservation)
    if (roomNumber) {
      const res_ = existing.rows[0];
      const roomConflict = await pool.query(
        `SELECT id, full_name, check_in_date, check_out_date FROM hotel_reservations
         WHERE room_number = $1
           AND id != $2
           AND status NOT IN ('cancelled', 'checked_out', 'no_show')
           AND check_in_date < $3
           AND check_out_date > $4`,
        [roomNumber, id, res_.check_out_date, res_.check_in_date]
      );
      if (roomConflict.rows.length > 0) {
        const c = roomConflict.rows[0];
        return res.status(409).json({
          success: false,
          message: `Room ${roomNumber} conflicts with an existing booking for ${c.full_name} (${c.check_in_date.toISOString().slice(0,10)} – ${c.check_out_date.toISOString().slice(0,10)}).`
        });
      }
    }
    const result = await pool.query(
      `UPDATE hotel_reservations SET
         status            = 'checked_in',
         checked_in_at     = NOW(),
         room_number       = $1,
         id_verified       = $2,
         payment_collected = $3,
         front_desk_notes  = $4
       WHERE id = $5
       RETURNING *`,
      [roomNumber || null, idVerified || false, paymentCollected || false, notes || '', id]
    );
    // Auto-upsert room record
    if (roomNumber) {
      await pool.query(
        `INSERT INTO hotel_rooms (room_number, room_type) VALUES ($1,$2) ON CONFLICT (room_number) DO NOTHING`,
        [roomNumber, existing.rows[0].room_type || '']
      );
    }
    res.json({ success: true, reservation: result.rows[0], message: 'Check-in complete.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Check-in failed.' });
  }
});

// POST /api/reservations/:id/transfer — room transfer or upgrade for checked-in guest
app.post('/api/reservations/:id/transfer', async (req, res) => {
  try {
    const { id } = req.params;
    const { newRoomNumber, newRoomType } = req.body;
    if (!newRoomNumber) return res.status(400).json({ success: false, message: 'newRoomNumber is required.' });

    const existing = await pool.query('SELECT * FROM hotel_reservations WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, message: 'Reservation not found.' });
    if (existing.rows[0].status !== 'checked_in') return res.status(409).json({ success: false, message: 'Guest is not currently checked in.' });

    const oldRoom = existing.rows[0].room_number;
    const { check_in_date, check_out_date } = existing.rows[0];

    // Conflict check on new room (exclude this reservation)
    const conflict = await pool.query(
      `SELECT id, full_name FROM hotel_reservations
       WHERE room_number = $1 AND id != $2
         AND status NOT IN ('cancelled', 'checked_out', 'no_show')
         AND check_in_date < $3 AND check_out_date > $4`,
      [newRoomNumber, id, check_out_date, check_in_date]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ success: false, message: `Room ${newRoomNumber} is already occupied by ${conflict.rows[0].full_name}.` });
    }

    // Update reservation
    const roomType = newRoomType || existing.rows[0].room_type;
    const result = await pool.query(
      `UPDATE hotel_reservations SET room_number = $1, room_type = $2 WHERE id = $3 RETURNING *`,
      [newRoomNumber, roomType, id]
    );

    // Mark old room dirty, upsert new room
    if (oldRoom && oldRoom !== newRoomNumber) {
      await pool.query(`UPDATE hotel_rooms SET hk_status = 'dirty' WHERE room_number = $1`, [oldRoom]);
    }
    await pool.query(
      `INSERT INTO hotel_rooms (room_number, room_type) VALUES ($1, $2) ON CONFLICT (room_number) DO NOTHING`,
      [newRoomNumber, roomType]
    );

    res.json({ success: true, reservation: result.rows[0], message: `Guest transferred to Room ${newRoomNumber}.` });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ success: false, message: 'Transfer failed.' });
  }
});

// POST /api/reservations/:id/checkout
app.post('/api/reservations/:id/checkout', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM hotel_reservations WHERE id = $1', [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    if (existing.rows[0].status !== 'checked_in')
      return res.status(409).json({ success: false, message: 'Guest is not currently checked in.' });
    const result = await pool.query(
      `UPDATE hotel_reservations SET status = 'checked_out', checked_out_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    // Auto-mark room as dirty after checkout
    if (existing.rows[0].room_number) {
      await pool.query(`UPDATE hotel_rooms SET hk_status='dirty' WHERE room_number=$1`, [existing.rows[0].room_number]);
    }
    res.json({ success: true, reservation: result.rows[0], message: 'Check-out complete.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Check-out failed.' });
  }
});

// PATCH /api/reservations/:id/status
app.patch('/api/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'no_show'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    const result = await pool.query(
      'UPDATE hotel_reservations SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    res.json({ success: true, reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Status update failed.' });
  }
});

// POST /api/checkin/lookup — guest self check-in: find reservation
app.post('/api/checkin/lookup', async (req, res) => {
  try {
    const { confirmationId, email, lastName } = req.body;
    let result;
    if (confirmationId) {
      result = await pool.query(
        `SELECT id, full_name, email, room_type, check_in_date, check_out_date,
                number_of_guests, special_requests, status, guest_arrived_at
           FROM hotel_reservations
          WHERE id = $1 AND status IN ('pending','confirmed')`,
        [parseInt(confirmationId, 10)]
      );
    } else if (email && lastName) {
      result = await pool.query(
        `SELECT id, full_name, email, room_type, check_in_date, check_out_date,
                number_of_guests, special_requests, status, guest_arrived_at
           FROM hotel_reservations
          WHERE LOWER(email) = LOWER($1)
            AND full_name ILIKE $2
            AND status IN ('pending','confirmed')
          ORDER BY check_in_date ASC LIMIT 1`,
        [email, `%${lastName}%`]
      );
    } else {
      return res.status(400).json({ error: 'Provide confirmationId or email + lastName' });
    }
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Reservation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// POST /api/checkin/arrive — guest marks themselves as arrived
app.post('/api/checkin/arrive', async (req, res) => {
  try {
    const { id } = req.body;
    const result = await pool.query(
      `UPDATE hotel_reservations
          SET guest_arrived_at = NOW()
        WHERE id = $1 AND status IN ('pending','confirmed')
        RETURNING id, full_name, room_type, check_in_date, check_out_date, status, guest_arrived_at`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Reservation not found or already processed' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Arrive update failed' });
  }
});

// ─── Rate Codes ───────────────────────────────────────────────────────────────
const initRateCodesTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_rate_codes (
      id          SERIAL PRIMARY KEY,
      code        TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_active   BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_rate_code_prices (
      id              SERIAL PRIMARY KEY,
      rate_code_id    INTEGER NOT NULL REFERENCES hotel_rate_codes(id) ON DELETE CASCADE,
      room_type_id    INTEGER NOT NULL REFERENCES hotel_room_types(id) ON DELETE CASCADE,
      price_per_night NUMERIC(10,2) NOT NULL,
      UNIQUE(rate_code_id, room_type_id)
    )
  `);
  await pool.query(`ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS rate_code TEXT DEFAULT ''`);
  await pool.query(`
    INSERT INTO hotel_rate_codes (code, name, description) VALUES
      ('RACK', 'Rack Rate',        'Full published rate'),
      ('CORP', 'Corporate Rate',   'Discounted rate for corporate clients'),
      ('GOV',  'Government Rate',  'Rate for government employees'),
      ('WALK', 'Walk-In Rate',     'Rate applied for walk-in guests'),
      ('PKG',  'Package Rate',     'Bundled package rate including extras')
    ON CONFLICT (code) DO NOTHING
  `);
  console.log('Rate codes tables ready.');
};
initRateCodesTables().catch(err => console.error('Rate codes init failed:', err));

// GET /api/rate-codes — active rate codes with prices per room type
app.get('/api/rate-codes', async (req, res) => {
  try {
    const codes = await pool.query(
      `SELECT rc.*, json_agg(json_build_object('room_type_id', rcp.room_type_id, 'price_per_night', rcp.price_per_night)) FILTER (WHERE rcp.id IS NOT NULL) as prices
       FROM hotel_rate_codes rc
       LEFT JOIN hotel_rate_code_prices rcp ON rc.id = rcp.rate_code_id
       WHERE rc.is_active = true
       GROUP BY rc.id ORDER BY rc.code`
    );
    res.json({ success: true, rateCodes: codes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch rate codes.' });
  }
});

// GET /api/admin/rate-codes — all rate codes with prices
app.get('/api/admin/rate-codes', async (req, res) => {
  try {
    const codes = await pool.query(
      `SELECT rc.*, json_agg(json_build_object('room_type_id', rcp.room_type_id, 'room_type_name', rt.name, 'price_per_night', rcp.price_per_night)) FILTER (WHERE rcp.id IS NOT NULL) as prices
       FROM hotel_rate_codes rc
       LEFT JOIN hotel_rate_code_prices rcp ON rc.id = rcp.rate_code_id
       LEFT JOIN hotel_room_types rt ON rcp.room_type_id = rt.id
       GROUP BY rc.id ORDER BY rc.code`
    );
    res.json({ success: true, rateCodes: codes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch rate codes.' });
  }
});

// POST /api/admin/rate-codes — create rate code
app.post('/api/admin/rate-codes', async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) return res.status(400).json({ success: false, message: 'Code and name required.' });
    const result = await pool.query(
      `INSERT INTO hotel_rate_codes (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [code.toUpperCase().trim(), name.trim(), description || '']
    );
    res.json({ success: true, rateCode: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Rate code already exists.' });
    res.status(500).json({ success: false, message: 'Failed to create rate code.' });
  }
});

// PUT /api/admin/rate-codes/:id — update rate code
app.put('/api/admin/rate-codes/:id', async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    const result = await pool.query(
      `UPDATE hotel_rate_codes SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *`,
      [name, description, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Rate code not found.' });
    res.json({ success: true, rateCode: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update rate code.' });
  }
});

// PUT /api/admin/rate-codes/:id/prices — upsert prices per room type
app.put('/api/admin/rate-codes/:id/prices', async (req, res) => {
  try {
    const { prices } = req.body; // [{ room_type_id, price_per_night }]
    if (!Array.isArray(prices)) return res.status(400).json({ success: false, message: 'prices must be an array.' });
    for (const p of prices) {
      if (p.price_per_night === null || p.price_per_night === '') {
        await pool.query(`DELETE FROM hotel_rate_code_prices WHERE rate_code_id = $1 AND room_type_id = $2`, [req.params.id, p.room_type_id]);
      } else {
        await pool.query(
          `INSERT INTO hotel_rate_code_prices (rate_code_id, room_type_id, price_per_night) VALUES ($1,$2,$3)
           ON CONFLICT (rate_code_id, room_type_id) DO UPDATE SET price_per_night = $3`,
          [req.params.id, p.room_type_id, p.price_per_night]
        );
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to save prices.' });
  }
});

// ─── End Hotel Reservations ───────────────────────────────────────────────────

// Create a new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      serviceType,
      preferredDate,
      preferredTime,
      notes
    } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !email || !serviceType || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Check for overlapping appointments (same date and time)
    const overlapCheck = await pool.query(
      `SELECT * FROM appointments
       WHERE preferred_date = $1
       AND preferred_time = $2
       AND status != 'cancelled'`,
      [preferredDate, preferredTime]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Sorry, the time slot ${preferredTime} on ${preferredDate} is already booked. Please choose a different time.`
      });
    }

    // Generate a unique cancel token
    const cancelToken = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Insert into database
    const query = `
      INSERT INTO appointments (full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, cancel_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [fullName, phoneNumber, email, serviceType, preferredDate, preferredTime, notes || '', cancelToken];
    const result = await pool.query(query, values);

    // Send confirmation email and SMS (don't wait for it, don't fail if it fails)
    const appointment = result.rows[0];
    sendConfirmationEmail(appointment).catch(err => console.error('Email error:', err));

    // Send SMS confirmation
    const smsMessage = `Hi ${appointment.full_name}, your appointment at HealthCare Clinic is confirmed for ${appointment.preferred_date} at ${appointment.preferred_time}. Ref#${appointment.id}`;
    sendSMS(appointment.phone_number, smsMessage).catch(err => console.error('SMS error:', err));

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! A confirmation email has been sent.',
      appointment: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment. Please try again.'
    });
  }
});

// Get available time slots for a specific date
app.get('/api/available-slots', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Check if date is blocked (holiday/closed)
    const blockedCheck = await pool.query(
      'SELECT * FROM blocked_dates WHERE blocked_date = $1',
      [date]
    );

    if (blockedCheck.rows.length > 0) {
      return res.json({
        success: true,
        date,
        availableSlots: [],
        bookedSlots: [],
        blocked: true,
        blockReason: blockedCheck.rows[0].reason
      });
    }

    // All possible time slots
    const allSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM',
      '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    // Get booked slots for the date
    const bookedResult = await pool.query(
      `SELECT preferred_time FROM appointments
       WHERE preferred_date = $1
       AND status != 'cancelled'`,
      [date]
    );

    const bookedSlots = bookedResult.rows.map(row => row.preferred_time);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      date,
      availableSlots,
      bookedSlots,
      blocked: false
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots'
    });
  }
});

// Get all appointments (for admin purposes)
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      appointments: result.rows
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Search appointments with filters (must be before /:id route)
app.get('/api/appointments/search', async (req, res) => {
  try {
    const { query, startDate, endDate, status } = req.query;

    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (query) {
      sql += ` AND (
        LOWER(full_name) LIKE LOWER($${paramIndex}) OR
        phone_number LIKE $${paramIndex} OR
        LOWER(email) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (startDate) {
      sql += ` AND preferred_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND preferred_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ' ORDER BY preferred_date DESC, preferred_time DESC';

    const result = await pool.query(sql, params);

    res.json({
      success: true,
      appointments: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// Get a single appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

// Update appointment status
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

// ==================== ADMIN AUTHENTICATION ====================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check against environment variables (simple approach)
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin123';

    if (username === adminUser && password === adminPass) {
      // Generate simple session token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessions.set(token, { username, loginTime: new Date() });

      res.json({
        success: true,
        message: 'Login successful',
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Verify admin token
app.get('/api/admin/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token && sessions.has(token)) {
    res.json({ success: true, valid: true });
  } else {
    res.status(401).json({ success: false, valid: false });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    sessions.delete(token);
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

// ==================== PATIENT SELF-SERVICE ====================

// Look up appointment by email and reference ID
app.post('/api/patient/lookup', async (req, res) => {
  try {
    const { email, referenceId } = req.body;

    if (!email || !referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Email and Reference ID are required'
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, status, cancel_token, created_at
       FROM appointments
       WHERE LOWER(email) = LOWER($1) AND id = $2`,
      [email, referenceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your email and reference ID.'
      });
    }

    res.json({
      success: true,
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to look up appointment'
    });
  }
});

// Get appointment by cancel token (for email link)
app.get('/api/patient/appointment/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT id, full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, status, cancel_token, created_at
       FROM appointments
       WHERE cancel_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or link has expired'
      });
    }

    res.json({
      success: true,
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Token lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

// Patient cancels their own appointment
app.post('/api/patient/cancel', async (req, res) => {
  try {
    const { cancelToken, reason } = req.body;

    if (!cancelToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cancellation request'
      });
    }

    // Get the appointment
    const appointment = await pool.query(
      'SELECT * FROM appointments WHERE cancel_token = $1',
      [cancelToken]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const apt = appointment.rows[0];

    // Check if already cancelled
    if (apt.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has already been cancelled'
      });
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(apt.preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past appointments'
      });
    }

    // Cancel the appointment
    await pool.query(
      `UPDATE appointments
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP, cancellation_reason = $1
       WHERE cancel_token = $2`,
      [reason || 'Cancelled by patient', cancelToken]
    );

    // Send cancellation confirmation email
    sendCancellationEmail(apt).catch(err => console.error('Cancellation email error:', err));

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
});

// Function to send cancellation confirmation email
const sendCancellationEmail = async (appointment) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: appointment.email,
    subject: 'Appointment Cancelled - HealthCare Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1c1917; padding: 20px; text-align: center;">
          <h1 style="color: #E4FE7B; margin: 0;">HealthCare Clinic</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Dear <strong>${appointment.full_name}</strong>,</p>
          <p>Your appointment has been successfully cancelled. Here were the details:</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; opacity: 0.7;">
            <p style="text-decoration: line-through;"><strong>Service:</strong> ${appointment.service_type}</p>
            <p style="text-decoration: line-through;"><strong>Date:</strong> ${appointment.preferred_date}</p>
            <p style="text-decoration: line-through;"><strong>Time:</strong> ${appointment.preferred_time}</p>
            <p><strong>Reference ID:</strong> #${appointment.id}</p>
          </div>

          <p style="color: #666;">If you didn't request this cancellation or need to book a new appointment, please visit our website or contact us.</p>

          <div style="margin: 25px 0; text-align: center;">
            <a href="${FRONTEND_URL}" style="display: inline-block; padding: 12px 24px; background: #E4FE7B; color: #1c1917; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Book New Appointment
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              HealthCare Clinic<br>
              Cantecson, Gairan, Bogo City, Cebu<br>
              Phone: +63 912 345 6789
            </p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log('Cancellation email sent to:', appointment.email);
};

// ==================== SEARCH & FILTER ====================
// (Moved to before /api/appointments/:id route)

// ==================== RESCHEDULE APPOINTMENT ====================

// Reschedule an appointment
app.put('/api/appointments/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredDate, preferredTime } = req.body;

    if (!preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'New date and time are required'
      });
    }

    // Check if the new slot is available
    const overlapCheck = await pool.query(
      `SELECT * FROM appointments
       WHERE preferred_date = $1
       AND preferred_time = $2
       AND status != 'cancelled'
       AND id != $3`,
      [preferredDate, preferredTime, id]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'The selected time slot is not available'
      });
    }

    // Get the old appointment details for email
    const oldAppointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (oldAppointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update the appointment
    const result = await pool.query(
      `UPDATE appointments
       SET preferred_date = $1, preferred_time = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [preferredDate, preferredTime, id]
    );

    // Send reschedule confirmation email
    const appointment = result.rows[0];
    sendRescheduleEmail(appointment, oldAppointment.rows[0]).catch(err =>
      console.error('Reschedule email error:', err)
    );

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Reschedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment'
    });
  }
});

// Function to send reschedule email
const sendRescheduleEmail = async (newAppointment, oldAppointment) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: newAppointment.email,
    subject: 'Appointment Rescheduled - HealthCare Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1c1917; padding: 20px; text-align: center;">
          <h1 style="color: #E4FE7B; margin: 0;">HealthCare Clinic</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #1c1917;">Appointment Rescheduled</h2>
          <p>Dear <strong>${newAppointment.full_name}</strong>,</p>
          <p>Your appointment has been rescheduled. Here are your new details:</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${newAppointment.service_type}</p>
            <p><strong>New Date:</strong> ${newAppointment.preferred_date}</p>
            <p><strong>New Time:</strong> ${newAppointment.preferred_time}</p>
            <p style="color: #888; text-decoration: line-through;">
              Previous: ${oldAppointment.preferred_date} at ${oldAppointment.preferred_time}
            </p>
            <p><strong>Reference ID:</strong> #${newAppointment.id}</p>
          </div>

          <p style="color: #666;">Please arrive 10 minutes before your scheduled time.</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              HealthCare Clinic<br>
              Cantecson, Gairan, Bogo City, Cebu<br>
              Phone: +63 912 345 6789
            </p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log('Reschedule email sent to:', newAppointment.email);
};

// ==================== REMINDER EMAILS ====================

// Function to send reminder email
const sendReminderEmail = async (appointment) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: appointment.email,
    subject: 'Appointment Reminder - Tomorrow at HealthCare Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1c1917; padding: 20px; text-align: center;">
          <h1 style="color: #E4FE7B; margin: 0;">HealthCare Clinic</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #1c1917;">Appointment Reminder</h2>
          <p>Dear <strong>${appointment.full_name}</strong>,</p>
          <p>This is a friendly reminder that you have an appointment <strong>tomorrow</strong>.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${appointment.service_type}</p>
            <p><strong>Date:</strong> ${appointment.preferred_date}</p>
            <p><strong>Time:</strong> ${appointment.preferred_time}</p>
            <p><strong>Reference ID:</strong> #${appointment.id}</p>
          </div>

          <p style="color: #666;">Please arrive 10 minutes before your scheduled time.</p>
          <p style="color: #666;">If you need to cancel or reschedule, please contact us as soon as possible.</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              HealthCare Clinic<br>
              Cantecson, Gairan, Bogo City, Cebu<br>
              Phone: +63 912 345 6789
            </p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log('Reminder email sent to:', appointment.email);
};

// Check and send reminder emails (runs every hour)
const checkAndSendReminders = async () => {
  try {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find appointments for tomorrow that haven't been reminded
    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE preferred_date = $1
       AND status IN ('pending', 'confirmed')
       AND (reminder_sent IS NULL OR reminder_sent = false)`,
      [tomorrowStr]
    );

    for (const appointment of result.rows) {
      try {
        await sendReminderEmail(appointment);
        // Mark as reminded
        await pool.query(
          'UPDATE appointments SET reminder_sent = true WHERE id = $1',
          [appointment.id]
        );
      } catch (err) {
        console.error(`Failed to send reminder to ${appointment.email}:`, err);
      }
    }

    if (result.rows.length > 0) {
      console.log(`Sent ${result.rows.length} reminder emails`);
    }
  } catch (error) {
    console.error('Reminder check error:', error);
  }
};

// Run reminder check every hour
setInterval(checkAndSendReminders, 60 * 60 * 1000);

// Also run once on server start
setTimeout(checkAndSendReminders, 5000);

const sendHotelReminderEmail = async (reservation) => {
  let settings = {};
  try {
    const result = await pool.query('SELECT key, value FROM hotel_settings');
    result.rows.forEach(r => settings[r.key] = r.value);
  } catch (err) { console.error('Error fetching settings', err); }

  const subject = settings.email_reminder_subject || 'Upcoming Check-in Reminder - Northomes Pensionne';
  const rawBody = settings.email_reminder_body || `<h2 style="color: #1E3932;">We're excited to see you soon!</h2><p>Dear <strong>{{full_name}}</strong>,</p><p>This is a friendly reminder that your check-in date is coming up tomorrow.</p>`;
  
  const body = rawBody
    .replace(/\{\{full_name\}\}/g, reservation.full_name || '')
    .replace(/\{\{room_type\}\}/g, reservation.room_type || '')
    .replace(/\{\{check_in_date\}\}/g, reservation.check_in_date || '')
    .replace(/\{\{check_out_date\}\}/g, reservation.check_out_date || '')
    .replace(/\{\{number_of_guests\}\}/g, reservation.number_of_guests || '')
    .replace(/\{\{id\}\}/g, reservation.id || '');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reservation.email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1E3932; padding: 20px; text-align: center;">
          <h1 style="color: #CBA258; margin: 0;">${settings.hotel_name || 'Northomes Pensionne'}</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          ${body}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              ${settings.hotel_name || 'Northomes Pensionne'}<br>
              Phone: ${settings.hotel_phone || '+63 912 345 6789'}<br>
              Email: ${settings.hotel_email || 'info@northomespensione.com'}
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Hotel reminder email sent to:', reservation.email);
  } catch (err) {
    console.error('Error sending hotel reminder email:', err);
  }
};

// Check and send hotel reminder emails (runs every hour)
const checkAndSendHotelReminders = async () => {
  try {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find reservations for tomorrow that haven't been reminded
    const result = await pool.query(
      `SELECT * FROM hotel_reservations
       WHERE check_in_date = $1
       AND status IN ('pending', 'confirmed')
       AND (reminder_sent IS NULL OR reminder_sent = false)`,
      [tomorrowStr]
    );

    for (const reservation of result.rows) {
      try {
        await sendHotelReminderEmail(reservation);
        // Mark as reminded
        await pool.query(
          'UPDATE hotel_reservations SET reminder_sent = true WHERE id = $1',
          [reservation.id]
        );
      } catch (err) {
        console.error('Failed to process reminder for reservation', reservation.id, err);
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendHotelReminders job:', error);
  }
};

setInterval(checkAndSendHotelReminders, 60 * 60 * 1000);
setTimeout(checkAndSendHotelReminders, 10000);

// ==================== BLOCKED DATES / HOLIDAYS ====================

// Get all blocked dates
app.get('/api/blocked-dates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM blocked_dates ORDER BY blocked_date ASC'
    );
    res.json({ success: true, blockedDates: result.rows });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blocked dates' });
  }
});

// Add a blocked date
app.post('/api/blocked-dates', async (req, res) => {
  try {
    const { blockedDate, reason } = req.body;

    if (!blockedDate) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const result = await pool.query(
      'INSERT INTO blocked_dates (blocked_date, reason) VALUES ($1, $2) RETURNING *',
      [blockedDate, reason || 'Holiday/Clinic Closed']
    );

    res.status(201).json({ success: true, blockedDate: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'This date is already blocked' });
    }
    console.error('Error adding blocked date:', error);
    res.status(500).json({ success: false, message: 'Failed to add blocked date' });
  }
});

// Delete a blocked date
app.delete('/api/blocked-dates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blocked_dates WHERE id = $1', [id]);
    res.json({ success: true, message: 'Blocked date removed' });
  } catch (error) {
    console.error('Error deleting blocked date:', error);
    res.status(500).json({ success: false, message: 'Failed to delete blocked date' });
  }
});

// ==================== DOCTORS MANAGEMENT ====================

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM doctors ORDER BY name ASC'
    );
    res.json({ success: true, doctors: result.rows });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
});

// Add a doctor
app.post('/api/doctors', async (req, res) => {
  try {
    const { name, specialization, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Doctor name is required' });
    }

    const result = await pool.query(
      'INSERT INTO doctors (name, specialization, color) VALUES ($1, $2, $3) RETURNING *',
      [name, specialization || 'General Practice', color || '#3B82F6']
    );

    res.status(201).json({ success: true, doctor: result.rows[0] });
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({ success: false, message: 'Failed to add doctor' });
  }
});

// Update a doctor
app.put('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, color, active } = req.body;

    const result = await pool.query(
      `UPDATE doctors SET name = COALESCE($1, name), specialization = COALESCE($2, specialization),
       color = COALESCE($3, color), active = COALESCE($4, active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [name, specialization, color, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, doctor: result.rows[0] });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ success: false, message: 'Failed to update doctor' });
  }
});

// Delete a doctor
app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ success: false, message: 'Failed to delete doctor' });
  }
});

// ==================== SERVICES WITH DURATION ====================

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE active = true ORDER BY name ASC'
    );
    res.json({ success: true, services: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Add a service
app.post('/api/services', async (req, res) => {
  try {
    const { name, duration, price, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Service name is required' });
    }

    const result = await pool.query(
      'INSERT INTO services (name, duration, price, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, duration || 30, price || 0, description || '']
    );

    res.status(201).json({ success: true, service: result.rows[0] });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ success: false, message: 'Failed to add service' });
  }
});

// Update a service
app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price, description, active } = req.body;

    const result = await pool.query(
      `UPDATE services SET name = COALESCE($1, name), duration = COALESCE($2, duration),
       price = COALESCE($3, price), description = COALESCE($4, description),
       active = COALESCE($5, active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [name, duration, price, description, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, service: result.rows[0] });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

// Delete a service
app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE services SET active = false WHERE id = $1', [id]);
    res.json({ success: true, message: 'Service deactivated' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

// ==================== REPORTS & ANALYTICS ====================

// Get appointment statistics
app.get('/api/reports/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE preferred_date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE preferred_date >= $1';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE preferred_date <= $1';
      params.push(endDate);
    }

    // Total appointments by status
    const statusStats = await pool.query(
      `SELECT status, COUNT(*) as count FROM appointments ${dateFilter} GROUP BY status`,
      params
    );

    // Appointments by service type
    const serviceStats = await pool.query(
      `SELECT service_type, COUNT(*) as count FROM appointments ${dateFilter} GROUP BY service_type ORDER BY count DESC`,
      params
    );

    // Daily appointment count (last 30 days)
    const dailyStats = await pool.query(
      `SELECT preferred_date as date, COUNT(*) as count
       FROM appointments
       WHERE preferred_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY preferred_date
       ORDER BY preferred_date ASC`
    );

    // Peak hours
    const hourlyStats = await pool.query(
      `SELECT preferred_time as time, COUNT(*) as count
       FROM appointments ${dateFilter}
       GROUP BY preferred_time
       ORDER BY count DESC`,
      params
    );

    // Total counts
    const totals = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed
       FROM appointments ${dateFilter}`,
      params
    );

    res.json({
      success: true,
      stats: {
        totals: totals.rows[0],
        byStatus: statusStats.rows,
        byService: serviceStats.rows,
        daily: dailyStats.rows,
        hourly: hourlyStats.rows
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ==================== HOTEL MANAGEMENT & FINANCIAL REPORTS ====================

// GET /api/reports/hotel/management — reservation stats + room type performance
app.get('/api/reports/hotel/management', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const p = [];
    let where = '';
    if (startDate) { p.push(startDate); where += ` AND check_in_date >= $${p.length}::date`; }
    if (endDate)   { p.push(endDate);   where += ` AND check_in_date <= $${p.length}::date`; }

    const [summaryRes, roomTypeRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'confirmed')    as confirmed,
          COUNT(*) FILTER (WHERE status = 'checked_in')  as checked_in,
          COUNT(*) FILTER (WHERE status = 'checked_out') as checked_out,
          COUNT(*) FILTER (WHERE status = 'cancelled')   as cancelled,
          COUNT(*) FILTER (WHERE status = 'no_show')     as no_show,
          COUNT(DISTINCT email) as unique_guests
        FROM hotel_reservations WHERE 1=1 ${where}
      `, p),
      pool.query(`
        SELECT room_type,
          COUNT(*) as total_bookings,
          COUNT(*) FILTER (WHERE status NOT IN ('cancelled','no_show')) as valid_bookings,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancellations
        FROM hotel_reservations WHERE 1=1 ${where}
        GROUP BY room_type ORDER BY valid_bookings DESC
      `, p),
    ]);

    res.json({ success: true, summary: summaryRes.rows[0], byRoomType: roomTypeRes.rows });
  } catch (err) {
    console.error('Hotel management report error:', err);
    res.status(500).json({ success: false, message: 'Failed to load management report.' });
  }
});

// GET /api/reports/hotel/financial?startDate=&endDate= — financial summary + payment methods + room revenue + outstanding list
app.get('/api/reports/hotel/financial', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const fp = [];
    let folioWhere = ' WHERE voided=false';
    if (startDate) { fp.push(startDate); folioWhere += ` AND posted_at::date >= $${fp.length}::date`; }
    if (endDate)   { fp.push(endDate);   folioWhere += ` AND posted_at::date <= $${fp.length}::date`; }

    const rp = [];
    let resWhere = '1=1';
    if (startDate) { rp.push(startDate); resWhere += ` AND r.check_in_date >= $${rp.length}::date`; }
    if (endDate)   { rp.push(endDate);   resWhere += ` AND r.check_in_date <= $${rp.length}::date`; }

    const [chargesRes, paymentsRes, methodsRes, roomRevRes, outListRes] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(amount),0) as total, COUNT(*) as count FROM hotel_folio_items${folioWhere}`, fp),
      pool.query(`SELECT COALESCE(SUM(amount),0) as total, COUNT(*) as count FROM hotel_folio_payments${folioWhere}`, fp),
      pool.query(`
        SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount),0) as total
        FROM hotel_folio_payments${folioWhere}
        GROUP BY payment_method ORDER BY total DESC
      `, fp),
      pool.query(`
        SELECT r.room_type,
          COUNT(DISTINCT r.id) as bookings,
          COALESCE(SUM(fi.charged),0) as charged,
          COALESCE(SUM(fp2.paid),0) as paid
        FROM hotel_reservations r
        LEFT JOIN (SELECT reservation_id, SUM(amount) as charged FROM hotel_folio_items WHERE voided=false GROUP BY reservation_id) fi ON fi.reservation_id = r.id
        LEFT JOIN (SELECT reservation_id, SUM(amount) as paid   FROM hotel_folio_payments WHERE voided=false GROUP BY reservation_id) fp2 ON fp2.reservation_id = r.id
        WHERE ${resWhere}
        GROUP BY r.room_type ORDER BY charged DESC
      `, rp),
      pool.query(`
        SELECT r.id, r.full_name, r.room_number, r.room_type, r.status,
               r.check_in_date, r.check_out_date,
               COALESCE(fi.charged,0) as charged,
               COALESCE(fp2.paid,0)   as paid,
               COALESCE(fi.charged,0) - COALESCE(fp2.paid,0) as balance
        FROM hotel_reservations r
        LEFT JOIN (SELECT reservation_id, SUM(amount) as charged FROM hotel_folio_items WHERE voided=false GROUP BY reservation_id) fi ON fi.reservation_id = r.id
        LEFT JOIN (SELECT reservation_id, SUM(amount) as paid   FROM hotel_folio_payments WHERE voided=false GROUP BY reservation_id) fp2 ON fp2.reservation_id = r.id
        WHERE COALESCE(fi.charged,0) - COALESCE(fp2.paid,0) > 0
        ORDER BY balance DESC LIMIT 25
      `),
    ]);

    const totalCharged   = parseFloat(chargesRes.rows[0].total);
    const totalCollected = parseFloat(paymentsRes.rows[0].total);

    res.json({
      success: true,
      summary: {
        totalCharged,
        totalCollected,
        totalOutstanding: totalCharged - totalCollected,
        chargeCount:  parseInt(chargesRes.rows[0].count),
        paymentCount: parseInt(paymentsRes.rows[0].count),
        collectionRate: totalCharged > 0 ? Math.round((totalCollected / totalCharged) * 100) : 100,
      },
      byPaymentMethod: methodsRes.rows,
      byRoomType:      roomRevRes.rows,
      outstandingList: outListRes.rows,
    });
  } catch (err) {
    console.error('Hotel financial report error:', err);
    res.status(500).json({ success: false, message: 'Failed to load financial report.' });
  }
});

// GET /api/reports/hotel/daily?startDate=&endDate= — daily revenue breakdown
app.get('/api/reports/hotel/daily', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const p = [];
    let where = ' WHERE voided=false';
    if (startDate) { p.push(startDate); where += ` AND posted_at::date >= $${p.length}::date`; }
    if (endDate)   { p.push(endDate);   where += ` AND posted_at::date <= $${p.length}::date`; }

    const [chargesRes, paymentsRes] = await Promise.all([
      pool.query(`SELECT posted_at::date as date, SUM(amount) as charged FROM hotel_folio_items${where} GROUP BY posted_at::date`, p),
      pool.query(`SELECT posted_at::date as date, SUM(amount) as paid    FROM hotel_folio_payments${where} GROUP BY posted_at::date`, p),
    ]);

    const map = {};
    chargesRes.rows.forEach(r => { map[r.date] = { date: r.date, charged: parseFloat(r.charged), paid: 0 }; });
    paymentsRes.rows.forEach(r => {
      if (map[r.date]) map[r.date].paid = parseFloat(r.paid);
      else map[r.date] = { date: r.date, charged: 0, paid: parseFloat(r.paid) };
    });
    const rows = Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
    rows.forEach(r => { r.balance = parseFloat((r.charged - r.paid).toFixed(2)); });

    res.json({ success: true, daily: rows });
  } catch (err) {
    console.error('Hotel daily report error:', err);
    res.status(500).json({ success: false, message: 'Failed to load daily revenue.' });
  }
});

// GET /api/reports/hotel/monthly?year= — monthly revenue breakdown
app.get('/api/reports/hotel/monthly', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const [chargesRes, paymentsRes, bookingsRes] = await Promise.all([
      pool.query(`SELECT TO_CHAR(posted_at,'MM') as month, SUM(amount) as charged
                  FROM hotel_folio_items WHERE voided=false AND EXTRACT(year FROM posted_at)=$1
                  GROUP BY month ORDER BY month`, [year]),
      pool.query(`SELECT TO_CHAR(posted_at,'MM') as month, SUM(amount) as paid
                  FROM hotel_folio_payments WHERE voided=false AND EXTRACT(year FROM posted_at)=$1
                  GROUP BY month ORDER BY month`, [year]),
      pool.query(`SELECT TO_CHAR(check_in_date,'MM') as month, COUNT(*) as bookings
                  FROM hotel_reservations WHERE EXTRACT(year FROM check_in_date)=$1
                    AND status NOT IN ('cancelled','no_show')
                  GROUP BY month ORDER BY month`, [year]),
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const map = {};
    MONTHS.forEach((name, i) => { const m = String(i+1).padStart(2,'0'); map[m] = { month: name, charged: 0, paid: 0, bookings: 0 }; });
    chargesRes.rows.forEach(r => { if (map[r.month]) map[r.month].charged  = parseFloat(r.charged); });
    paymentsRes.rows.forEach(r => { if (map[r.month]) map[r.month].paid     = parseFloat(r.paid); });
    bookingsRes.rows.forEach(r => { if (map[r.month]) map[r.month].bookings = parseInt(r.bookings); });

    const monthly = Object.values(map);
    monthly.forEach(r => { r.balance = parseFloat((r.charged - r.paid).toFixed(2)); });

    res.json({ success: true, monthly, year });
  } catch (err) {
    console.error('Hotel monthly report error:', err);
    res.status(500).json({ success: false, message: 'Failed to load monthly revenue.' });
  }
});

// ==================== EXPORT TO CSV ====================

// Export appointments to CSV
app.get('/api/export/appointments', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND preferred_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND preferred_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
    }

    sql += ' ORDER BY preferred_date DESC, preferred_time DESC';

    const result = await pool.query(sql, params);

    // Convert to CSV
    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Service', 'Date', 'Time', 'Status', 'Notes', 'Created At'];
    const csvRows = [headers.join(',')];

    result.rows.forEach(row => {
      const values = [
        row.id,
        `"${row.full_name}"`,
        row.phone_number,
        row.email,
        `"${row.service_type}"`,
        row.preferred_date,
        row.preferred_time,
        row.status,
        `"${(row.notes || '').replace(/"/g, '""')}"`,
        row.created_at
      ];
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=appointments_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

// ==================== CALENDAR DATA ====================

// Get appointments for calendar view
app.get('/api/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const appointments = await pool.query(
      `SELECT id, full_name, service_type, preferred_date, preferred_time, status
       FROM appointments
       WHERE preferred_date >= $1 AND preferred_date <= $2
       ORDER BY preferred_date, preferred_time`,
      [startDate, endDate]
    );

    const blockedDates = await pool.query(
      `SELECT blocked_date, reason FROM blocked_dates
       WHERE blocked_date >= $1 AND blocked_date <= $2`,
      [startDate, endDate]
    );

    res.json({
      success: true,
      appointments: appointments.rows,
      blockedDates: blockedDates.rows
    });
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar data' });
  }
});

// ==================== SEND SMS NOTIFICATION ====================

// Send SMS reminder manually
app.post('/api/send-sms', async (req, res) => {
  try {
    const { appointmentId, message } = req.body;

    const appointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [appointmentId]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const apt = appointment.rows[0];
    const smsMessage = message || `Hi ${apt.full_name}, reminder: Your appointment at HealthCare Clinic is on ${apt.preferred_date} at ${apt.preferred_time}. Ref#${apt.id}`;

    const sent = await sendSMS(apt.phone_number, smsMessage);

    if (sent) {
      res.json({ success: true, message: 'SMS sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send SMS. Check API key configuration.' });
    }
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send SMS' });
  }
});

// ==================== QUEUE SYSTEM ENDPOINTS ====================

// Get active transaction types
app.get('/api/queue/transaction-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM queue_transaction_types WHERE active = true ORDER BY name');
    res.json({ success: true, types: result.rows });
  } catch (error) {
    console.error('Error fetching transaction types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transaction types' });
  }
});

// Create a queue ticket
app.post('/api/queue/tickets', async (req, res) => {
  try {
    const { customerName, cellphoneNumber, transactionType, isPriority, priorityType } = req.body;

    // Get prefix for this transaction type
    const typeResult = await pool.query(
      'SELECT prefix FROM queue_transaction_types WHERE name = $1 AND active = true',
      [transactionType]
    );
    const prefix = typeResult.rows.length > 0 ? typeResult.rows[0].prefix : 'GN';

    // Get next number for this transaction type today
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM queue_tickets WHERE transaction_type = $1 AND queue_date = CURRENT_DATE",
      [transactionType]
    );
    const nextNum = parseInt(countResult.rows[0].count) + 1;
    const ticketNumber = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    // Get queue position (how many waiting ahead)
    const posResult = await pool.query(
      "SELECT COUNT(*) as count FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE"
    );
    const position = parseInt(posResult.rows[0].count) + 1;

    const result = await pool.query(
      `INSERT INTO queue_tickets (ticket_number, customer_name, cellphone_number, transaction_type, status, queue_date, is_priority, priority_type)
       VALUES ($1, $2, $3, $4, 'waiting', CURRENT_DATE, $5, $6) RETURNING *`,
      [ticketNumber, customerName, cellphoneNumber, transactionType, isPriority || false, priorityType || null]
    );

    res.json({ success: true, ticket: result.rows[0], position });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

// Get queue display data (public)
app.get('/api/queue/display', async (req, res) => {
  try {
    const serving = await pool.query(
      "SELECT * FROM queue_tickets WHERE status = 'serving' AND queue_date = CURRENT_DATE ORDER BY called_at DESC"
    );
    const waiting = await pool.query(
      "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE ORDER BY is_priority DESC, created_at ASC"
    );

    // Calculate average serving time from today's completed tickets
    const avgResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (completed_at - called_at))) as avg_seconds
       FROM queue_tickets
       WHERE status = 'completed' AND queue_date = CURRENT_DATE
       AND completed_at IS NOT NULL AND called_at IS NOT NULL`
    );
    const avgServingTime = Math.round(avgResult.rows[0].avg_seconds) || 300; // default 5 min

    // Add estimated wait time to each waiting ticket based on position
    const waitingWithEstimates = waiting.rows.map((ticket, index) => ({
      ...ticket,
      estimatedWait: (index + 1) * avgServingTime
    }));

    res.json({ success: true, serving: serving.rows, waiting: waitingWithEstimates, avgServingTime });
  } catch (error) {
    console.error('Error fetching display data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch display data' });
  }
});

// Get all teller windows
app.get('/api/queue/tellers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*,
        COALESCE(
          json_agg(json_build_object('id', tt.id, 'name', tt.name, 'prefix', tt.prefix))
          FILTER (WHERE tt.id IS NOT NULL), '[]'
        ) as assigned_types
      FROM queue_tellers t
      LEFT JOIN queue_window_transactions wt ON t.id = wt.teller_id
      LEFT JOIN queue_transaction_types tt ON wt.transaction_type_id = tt.id AND tt.active = true
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.window_name
    `);
    res.json({ success: true, tellers: result.rows });
  } catch (error) {
    console.error('Error fetching tellers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tellers' });
  }
});

// Get current ticket for a teller window
app.get('/api/queue/teller/:windowName/current', async (req, res) => {
  try {
    const { windowName } = req.params;
    const result = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'serving' AND queue_date = CURRENT_DATE LIMIT 1",
      [windowName]
    );
    const skipped = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'skipped' AND queue_date = CURRENT_DATE ORDER BY called_at DESC",
      [windowName]
    );
    const completedCount = await pool.query(
      "SELECT COUNT(*) as count FROM queue_tickets WHERE teller_window = $1 AND status = 'completed' AND queue_date = CURRENT_DATE",
      [windowName]
    );
    // Get assigned transaction types for this window
    const assignedTypes = await pool.query(
      `SELECT tt.name FROM queue_window_transactions wt
       JOIN queue_tellers t ON wt.teller_id = t.id
       JOIN queue_transaction_types tt ON wt.transaction_type_id = tt.id
       WHERE t.window_name = $1 AND t.is_active = true AND tt.active = true`,
      [windowName]
    );
    const typeNames = assignedTypes.rows.map(r => r.name);

    // Filter waiting tickets by assigned types if any
    let waitingTickets;
    if (typeNames.length > 0) {
      waitingTickets = await pool.query(
        "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE AND transaction_type = ANY($1::text[]) ORDER BY is_priority DESC, created_at ASC",
        [typeNames]
      );
    } else {
      waitingTickets = await pool.query(
        "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE ORDER BY is_priority DESC, created_at ASC"
      );
    }
    // Average serving time for this window today
    const avgServing = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (completed_at - called_at))) as avg_seconds
       FROM queue_tickets
       WHERE teller_window = $1 AND status = 'completed' AND queue_date = CURRENT_DATE
       AND completed_at IS NOT NULL AND called_at IS NOT NULL`,
      [windowName]
    );

    res.json({
      success: true,
      current: result.rows[0] || null,
      skipped: skipped.rows,
      completedCount: parseInt(completedCount.rows[0].count),
      waitingCount: waitingTickets.rows.length,
      waitingTickets: waitingTickets.rows,
      assignedTypes: typeNames,
      avgServingTime: Math.round(avgServing.rows[0].avg_seconds) || 0
    });
  } catch (error) {
    console.error('Error fetching teller current:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch current ticket' });
  }
});

// Teller calls next ticket
app.post('/api/queue/teller/next', async (req, res) => {
  try {
    const { windowName, tellerName } = req.body;

    // Check if teller already has a serving ticket
    const existing = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'serving' AND queue_date = CURRENT_DATE",
      [windowName]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Please complete or skip the current ticket first' });
    }

    // Get assigned transaction types for this window
    const assignedTypes = await pool.query(
      `SELECT tt.name FROM queue_window_transactions wt
       JOIN queue_tellers t ON wt.teller_id = t.id
       JOIN queue_transaction_types tt ON wt.transaction_type_id = tt.id
       WHERE t.window_name = $1 AND t.is_active = true AND tt.active = true`,
      [windowName]
    );
    const typeNames = assignedTypes.rows.map(r => r.name);

    // Get next waiting ticket (Priority first, then FIFO), filtered by assigned types if any
    let next;
    if (typeNames.length > 0) {
      next = await pool.query(
        "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE AND transaction_type = ANY($1::text[]) ORDER BY is_priority DESC, created_at ASC LIMIT 1",
        [typeNames]
      );
    } else {
      next = await pool.query(
        "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE ORDER BY is_priority DESC, created_at ASC LIMIT 1"
      );
    }

    if (next.rows.length === 0) {
      return res.json({ success: false, message: typeNames.length > 0 ? 'No matching tickets waiting for this window' : 'No tickets waiting in queue' });
    }

    const ticket = next.rows[0];
    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'serving', teller_window = $1, teller_name = $2, called_at = NOW() WHERE id = $3 RETURNING *",
      [windowName, tellerName || null, ticket.id]
    );

    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error calling next ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to call next ticket' });
  }
});

// Complete a ticket
app.patch('/api/queue/tickets/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'completed', completed_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error completing ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to complete ticket' });
  }
});

// Skip a ticket
app.patch('/api/queue/tickets/:id/skip', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'skipped' WHERE id = $1 RETURNING *",
      [id]
    );
    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error skipping ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to skip ticket' });
  }
});

// Recall a skipped ticket
app.patch('/api/queue/tickets/:id/recall', async (req, res) => {
  try {
    const { id } = req.params;
    const { windowName, tellerName } = req.body;

    // Check if teller already serving
    const existing = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'serving' AND queue_date = CURRENT_DATE",
      [windowName]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Please complete or skip the current ticket first' });
    }

    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'serving', teller_window = $1, teller_name = $2, called_at = NOW() WHERE id = $3 AND status = 'skipped' RETURNING *",
      [windowName, tellerName || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found or not skipped' });
    }
    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error recalling ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to recall ticket' });
  }
});

// Transfer a ticket to another teller window
app.patch('/api/queue/tickets/:id/transfer', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetWindow } = req.body;

    if (!targetWindow) {
      return res.status(400).json({ success: false, message: 'Target window is required' });
    }

    // Check if target window already has a serving ticket
    const existing = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'serving' AND queue_date = CURRENT_DATE",
      [targetWindow]
    );

    if (existing.rows.length > 0) {
      // Target window is busy — put ticket back to waiting, it will be next in line
      const result = await pool.query(
        "UPDATE queue_tickets SET status = 'waiting', teller_window = NULL, called_at = NULL WHERE id = $1 AND status = 'serving' RETURNING *",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Ticket not found or not currently being served' });
      }
      res.json({ success: true, ticket: result.rows[0], message: `Ticket transferred. ${targetWindow} is busy, ticket is back in the waiting queue.` });
    } else {
      // Target window is free — assign directly
      const result = await pool.query(
        "UPDATE queue_tickets SET status = 'serving', teller_window = $1, called_at = NOW() WHERE id = $2 AND status = 'serving' RETURNING *",
        [targetWindow, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Ticket not found or not currently being served' });
      }
      res.json({ success: true, ticket: result.rows[0], message: `Ticket transferred to ${targetWindow} and is now being served.` });
    }
  } catch (error) {
    console.error('Error transferring ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to transfer ticket' });
  }
});

// Get all today's tickets (admin)
app.get('/api/queue/tickets', async (req, res) => {
  try {
    const tickets = await pool.query(
      "SELECT * FROM queue_tickets WHERE queue_date = CURRENT_DATE ORDER BY created_at ASC"
    );
    const stats = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'waiting') as waiting,
        COUNT(*) FILTER (WHERE status = 'serving') as serving,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
        COUNT(*) as total
       FROM queue_tickets WHERE queue_date = CURRENT_DATE`
    );
    res.json({ success: true, tickets: tickets.rows, stats: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching queue tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// Reset today's queue (admin)
app.post('/api/queue/reset', async (req, res) => {
  try {
    await pool.query("DELETE FROM queue_tickets WHERE queue_date = CURRENT_DATE");
    res.json({ success: true, message: 'Queue has been reset' });
  } catch (error) {
    console.error('Error resetting queue:', error);
    res.status(500).json({ success: false, message: 'Failed to reset queue' });
  }
});

// Add transaction type (admin)
app.post('/api/queue/transaction-types', async (req, res) => {
  try {
    const { name, prefix } = req.body;
    const result = await pool.query(
      'INSERT INTO queue_transaction_types (name, prefix) VALUES ($1, $2) RETURNING *',
      [name, prefix.toUpperCase()]
    );
    res.json({ success: true, type: result.rows[0] });
  } catch (error) {
    console.error('Error adding transaction type:', error);
    res.status(500).json({ success: false, message: 'Failed to add transaction type' });
  }
});

// Delete transaction type (admin)
app.delete('/api/queue/transaction-types/:id', async (req, res) => {
  try {
    await pool.query('UPDATE queue_transaction_types SET active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Transaction type removed' });
  } catch (error) {
    console.error('Error deleting transaction type:', error);
    res.status(500).json({ success: false, message: 'Failed to delete transaction type' });
  }
});

// Add teller window (admin)
app.post('/api/queue/tellers', async (req, res) => {
  try {
    const { windowName } = req.body;
    const result = await pool.query(
      'INSERT INTO queue_tellers (window_name) VALUES ($1) RETURNING *',
      [windowName]
    );
    res.json({ success: true, teller: result.rows[0] });
  } catch (error) {
    console.error('Error adding teller:', error);
    res.status(500).json({ success: false, message: 'Failed to add teller window' });
  }
});

// Delete teller window (admin)
app.delete('/api/queue/tellers/:id', async (req, res) => {
  try {
    await pool.query('UPDATE queue_tellers SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Teller window removed' });
  } catch (error) {
    console.error('Error deleting teller:', error);
    res.status(500).json({ success: false, message: 'Failed to delete teller window' });
  }
});

// Get marquee text
app.get('/api/queue/marquee', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM queue_settings WHERE key = 'marquee_text'");
    res.json({ success: true, text: result.rows[0]?.value || '' });
  } catch (error) {
    console.error('Error fetching marquee:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch marquee text' });
  }
});

// Get default queue display template
app.get('/api/queue/display-template', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM queue_settings WHERE key = 'display_template'");
    const template = result.rows[0]?.value || 'template1';
    res.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching display template:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch display template' });
  }
});

// Update marquee text
// Update window-transaction assignments
app.put('/api/queue/window-transactions/:tellerId', async (req, res) => {
  try {
    const { tellerId } = req.params;
    const { transactionTypeIds } = req.body;

    // Delete existing assignments
    await pool.query('DELETE FROM queue_window_transactions WHERE teller_id = $1', [tellerId]);

    // Insert new assignments
    if (transactionTypeIds && transactionTypeIds.length > 0) {
      const values = transactionTypeIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await pool.query(
        `INSERT INTO queue_window_transactions (teller_id, transaction_type_id) VALUES ${values}`,
        [tellerId, ...transactionTypeIds]
      );
    }

    res.json({ success: true, message: 'Window assignments updated' });
  } catch (error) {
    console.error('Error updating window assignments:', error);
    res.status(500).json({ success: false, message: 'Failed to update assignments' });
  }
});

app.put('/api/queue/marquee', async (req, res) => {
  try {
    const { text } = req.body;
    await pool.query(
      "INSERT INTO queue_settings (key, value) VALUES ('marquee_text', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [text]
    );
    res.json({ success: true, message: 'Marquee text updated' });
  } catch (error) {
    console.error('Error updating marquee:', error);
    res.status(500).json({ success: false, message: 'Failed to update marquee text' });
  }
});

// Update default queue display template
app.put('/api/queue/display-template', async (req, res) => {
  try {
    const { template } = req.body;
    const allowed = ['template1', 'template2', 'template3', 'template4', 'template5', 'template6'];
    if (!allowed.includes(template)) {
      return res.status(400).json({ success: false, message: 'Invalid template value' });
    }

    await pool.query(
      "INSERT INTO queue_settings (key, value) VALUES ('display_template', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [template]
    );
    res.json({ success: true, message: 'Display template updated' });
  } catch (error) {
    console.error('Error updating display template:', error);
    res.status(500).json({ success: false, message: 'Failed to update display template' });
  }
});

// Queue Reports
app.get('/api/queue/reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Summary stats
    const summary = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
        COUNT(*) FILTER (WHERE is_priority = true) as priority_count,
        AVG(EXTRACT(EPOCH FROM (called_at - created_at))) FILTER (WHERE called_at IS NOT NULL) as avg_wait_time,
        AVG(EXTRACT(EPOCH FROM (completed_at - called_at))) FILTER (WHERE completed_at IS NOT NULL AND called_at IS NOT NULL) as avg_serving_time
      FROM queue_tickets
      WHERE queue_date >= $1 AND queue_date <= $2`,
      [start, end]
    );

    // Peak hour
    const peakHour = await pool.query(
      `SELECT EXTRACT(HOUR FROM created_at)::int as hour, COUNT(*) as count
       FROM queue_tickets
       WHERE queue_date >= $1 AND queue_date <= $2
       GROUP BY hour ORDER BY count DESC LIMIT 1`,
      [start, end]
    );

    // By transaction type
    const byType = await pool.query(
      `SELECT transaction_type as type, COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (called_at - created_at))) FILTER (WHERE called_at IS NOT NULL) as avg_wait
       FROM queue_tickets
       WHERE queue_date >= $1 AND queue_date <= $2
       GROUP BY transaction_type ORDER BY count DESC`,
      [start, end]
    );

    // By day
    const byDay = await pool.query(
      `SELECT queue_date as date, COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM queue_tickets
       WHERE queue_date >= $1 AND queue_date <= $2
       GROUP BY queue_date ORDER BY queue_date`,
      [start, end]
    );

    // By hour
    const byHour = await pool.query(
      `SELECT EXTRACT(HOUR FROM created_at)::int as hour, COUNT(*) as count
       FROM queue_tickets
       WHERE queue_date >= $1 AND queue_date <= $2
       GROUP BY hour ORDER BY hour`,
      [start, end]
    );

    const s = summary.rows[0];
    res.json({
      success: true,
      summary: {
        totalTickets: parseInt(s.total),
        completed: parseInt(s.completed),
        skipped: parseInt(s.skipped),
        priorityCount: parseInt(s.priority_count),
        avgWaitTime: Math.round(s.avg_wait_time) || 0,
        avgServingTime: Math.round(s.avg_serving_time) || 0,
        peakHour: peakHour.rows[0]?.hour ?? null
      },
      byTransactionType: byType.rows.map(r => ({
        type: r.type,
        count: parseInt(r.count),
        avgWait: Math.round(r.avg_wait) || 0
      })),
      byDay: byDay.rows.map(r => ({
        date: r.date,
        total: parseInt(r.total),
        completed: parseInt(r.completed)
      })),
      byHour: byHour.rows.map(r => ({
        hour: parseInt(r.hour),
        count: parseInt(r.count)
      }))
    });
  } catch (error) {
    console.error('Error fetching queue reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

// Queue CSV Export
app.get('/api/export/queue-tickets', async (req, res) => {
  try {
    const { startDate, endDate, status, transactionType } = req.query;

    let sql = 'SELECT * FROM queue_tickets WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND queue_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      sql += ` AND queue_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (transactionType && transactionType !== 'all') {
      sql += ` AND transaction_type = $${paramIndex}`;
      params.push(transactionType);
    }

    sql += ' ORDER BY queue_date DESC, created_at DESC';

    const result = await pool.query(sql, params);

    const headers = ['Ticket #', 'Customer Name', 'Phone', 'Transaction Type', 'Status', 'Priority', 'Window', 'Teller', 'Date', 'Created At', 'Called At', 'Completed At', 'Wait Time (s)', 'Serving Time (s)'];
    const csvRows = [headers.join(',')];

    result.rows.forEach(row => {
      const waitTime = row.called_at && row.created_at ? Math.round((new Date(row.called_at) - new Date(row.created_at)) / 1000) : '';
      const servingTime = row.completed_at && row.called_at ? Math.round((new Date(row.completed_at) - new Date(row.called_at)) / 1000) : '';
      const values = [
        row.ticket_number,
        `"${(row.customer_name || '').replace(/"/g, '""')}"`,
        row.cellphone_number,
        `"${row.transaction_type}"`,
        row.status,
        row.is_priority ? (row.priority_type || 'Yes') : 'No',
        row.teller_window || '',
        `"${(row.teller_name || '').replace(/"/g, '""')}"`,
        row.queue_date,
        row.created_at,
        row.called_at || '',
        row.completed_at || '',
        waitTime,
        servingTime
      ];
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=queue_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Queue export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export queue data' });
  }
});

// POST /api/admin/night-audit - Run End of Day room rate posting
app.post('/api/admin/night-audit', async (req, res) => {
  try {
    // 1. Check if audit already run for today
    const checkAudit = await pool.query(`SELECT * FROM hotel_night_audit_logs WHERE audit_date = CURRENT_DATE`);
    if (checkAudit.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Night audit has already been run for today.' });
    }

    // 2. Fetch all checked-in reservations and determine their room rate
    const resResult = await pool.query(`
      SELECT res.id, res.room_type, res.rate_code, 
             rt.price_per_night as base_price,
             rcp.price_per_night as discounted_price
      FROM hotel_reservations res
      JOIN hotel_room_types rt ON rt.name = res.room_type
      LEFT JOIN hotel_rate_codes rc ON rc.code = res.rate_code
      LEFT JOIN hotel_rate_code_prices rcp ON rcp.rate_code_id = rc.id AND rcp.room_type_id = rt.id
      WHERE res.status = 'checked_in'
    `);

    const checkedInGuests = resResult.rows;
    let chargesPosted = 0;

    // 3. Post charges
    for (const guest of checkedInGuests) {
      const priceToCharge = guest.discounted_price !== null ? guest.discounted_price : guest.base_price;
      if (priceToCharge > 0) {
        await pool.query(`
          INSERT INTO hotel_folio_items (reservation_id, charge_type, description, quantity, unit_price, amount)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [guest.id, 'Room Rate', 'Daily Room Charge', 1, priceToCharge, priceToCharge]);
        chargesPosted++;
      }
    }

    // 4. Record audit completion
    await pool.query(`
      INSERT INTO hotel_night_audit_logs (audit_date, run_by, total_charges_posted)
      VALUES (CURRENT_DATE, 'Admin', $1)
    `, [chargesPosted]);

    res.json({ success: true, message: `Night audit complete. Posted ${chargesPosted} room charges.`, chargesPosted });
  } catch (err) {
    console.error('Night audit error:', err);
    res.status(500).json({ success: false, message: 'Failed to run night audit.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
