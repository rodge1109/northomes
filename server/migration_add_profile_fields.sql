-- SQL Migration Script: Add Expanded Profile Fields to hotel_guests Table
-- Replicates all fields in the guest profile creation form mock-up

ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS issuing_country TEXT DEFAULT '';

ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS telephone TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS address_line_1 TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS address_line_2 TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS province_state TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS zip_postal_code TEXT DEFAULT '';

ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS preferred_room_type TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS preferred_floor TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS bed_type TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS smoking_preference TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS pillow_type TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS language TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS special_requests_notes TEXT DEFAULT '';

ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS vip_status TEXT DEFAULT 'Standard';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS source TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS market_segment TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS referred_by TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '';
ALTER TABLE hotel_guests ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Create index for first_name and last_name search
CREATE INDEX IF NOT EXISTS idx_hotel_guests_first_name ON hotel_guests(first_name);
CREATE INDEX IF NOT EXISTS idx_hotel_guests_last_name ON hotel_guests(last_name);
