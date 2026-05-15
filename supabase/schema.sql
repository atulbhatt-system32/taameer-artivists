-- DATABASE SCHEMA FOR KUMAON FEST 2026
-- Copy and paste these scripts into the Supabase SQL Editor

-- 1. REGISTRATIONS TABLE
-- Stores attendee details and payment status
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT NOT NULL,
  whatsapp_no TEXT NOT NULL,
  contact_no TEXT NOT NULL,
  email TEXT NOT NULL,
  pass_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  address TEXT,
  will_play_dandiya TEXT DEFAULT 'No',
  instagram_handle TEXT, -- Used as GROUP_ID
  payment_id TEXT,
  order_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  checked_in_at TIMESTAMP WITH TIME ZONE,
  agreed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. EVENT CONFIGURATION TABLE
-- Stores global settings like Early Bird toggle
CREATE TABLE IF NOT EXISTS event_config (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. EVENT PRICING TABLE
-- Stores ticket tiers and their respective prices
CREATE TABLE IF NOT EXISTS event_pricing (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  early_bird_price INTEGER NOT NULL,
  regular_price INTEGER NOT NULL,
  description TEXT,
  features TEXT[],
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INITIAL CONFIG DATA
INSERT INTO event_config (key, value) 
VALUES ('early_bird_active', 'true')
ON CONFLICT (key) DO NOTHING;

-- INITIAL PRICING DATA
INSERT INTO event_pricing (id, name, early_bird_price, regular_price, description, features, popular)
VALUES 
  ('Student Pass', 'Student Pass', 249, 349, 'Valid Student ID required at gate', ARRAY['All sessions access', 'Student ID verification', 'Food court access'], false),
  ('Regular Pass', 'Regular Pass', 349, 399, 'General admission for the carnival', ARRAY['All sessions access', 'Priority seating', 'Food court access'], true),
  ('Premium Pass', 'Premium Pass', 549, 699, 'Closer to the stage access + Goodies', ARRAY['Tote Bag', 'Separate space for the event', 'Artist Meet & Greet'], false),
  ('Fanpit', 'Fanpit', 1999, 2999, 'Front row experience', ARRAY['A VIP sitting area', 'Tables & chairs to enjoy event', 'Front row access'], false),
  ('Group of 4', 'Group of 4', 6999, 9999, 'Best value for a group of friends', ARRAY['Entry for 4 people', 'Reserved group area', 'Exclusive Lounge access'], false)
ON CONFLICT (id) DO NOTHING;

-- 4. ROW LEVEL SECURITY POLICIES
-- These policies allow the application to read/write data via the anon key.
-- Without these, Supabase blocks all operations by default.

-- Registrations: Allow insert (booking), select (verification), update (check-in)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert" ON registrations;
CREATE POLICY "Allow public insert" ON registrations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read" ON registrations;
CREATE POLICY "Allow public read" ON registrations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public update" ON registrations;
CREATE POLICY "Allow public update" ON registrations FOR UPDATE USING (true);

-- Event Config: Allow read (for frontend to fetch toggle states)
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read config" ON event_config;
CREATE POLICY "Allow public read config" ON event_config FOR SELECT USING (true);

-- Event Pricing: Allow read (for frontend to fetch tiers)
ALTER TABLE event_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read pricing" ON event_pricing;
CREATE POLICY "Allow public read pricing" ON event_pricing FOR SELECT USING (true);

-- 4. ENABLE REALTIME (Optional)
-- Run this if you want the dashboard to update instantly
-- ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
