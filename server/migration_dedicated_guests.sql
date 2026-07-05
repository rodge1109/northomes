-- SQL Migration Script: Dedicated Guest Profile Table
-- Run this to create the hotel_guests table and link it to hotel_reservations

-- 1. Create the hotel_guests table
CREATE TABLE IF NOT EXISTS hotel_guests (
    id               SERIAL PRIMARY KEY,
    title            TEXT DEFAULT '',
    full_name        TEXT NOT NULL,
    middle_name      TEXT DEFAULT '',
    gender           TEXT DEFAULT '',
    date_of_birth    DATE,
    nationality      TEXT DEFAULT '',
    country          TEXT DEFAULT '',
    address          TEXT DEFAULT '',
    city             TEXT DEFAULT '',
    email            TEXT DEFAULT '',
    phone_number     TEXT DEFAULT '',
    id_type          TEXT DEFAULT '',
    id_number        TEXT DEFAULT '',
    purpose_of_visit TEXT DEFAULT '',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotel_guests_email ON hotel_guests(email);
CREATE INDEX IF NOT EXISTS idx_hotel_guests_phone ON hotel_guests(phone_number);
CREATE INDEX IF NOT EXISTS idx_hotel_guests_name ON hotel_guests(full_name);

-- 3. Add guest_id column to hotel_reservations table
ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS guest_id INTEGER REFERENCES hotel_guests(id);
