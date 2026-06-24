-- SQL Migration Script: Prefix Hotel Tables with 'hotel_'
-- Run this script in the Supabase SQL editor to rename your database tables.

ALTER TABLE IF EXISTS reservations RENAME TO hotel_reservations;
ALTER TABLE IF EXISTS rooms RENAME TO hotel_rooms;
ALTER TABLE IF EXISTS room_types RENAME TO hotel_room_types;
ALTER TABLE IF EXISTS folio_items RENAME TO hotel_folio_items;
ALTER TABLE IF EXISTS folio_payments RENAME TO hotel_folio_payments;
ALTER TABLE IF EXISTS rate_codes RENAME TO hotel_rate_codes;
ALTER TABLE IF EXISTS rate_code_prices RENAME TO hotel_rate_code_prices;
