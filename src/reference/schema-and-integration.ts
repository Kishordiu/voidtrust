/**
 * ============================================================
 * REFERENCE — Supabase Database Schema (Step 4)
 * ============================================================
 * SQL schema for the Zero-Trust IoT system.
 * Run this in the Supabase SQL editor or as a migration.
 */

export const SUPABASE_SCHEMA = `
-- ==================== DEVICES TABLE ====================
-- Stores all registered IoT devices with their security state
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,                          -- Device UUID (e.g., 'dev-001-alpha')
  name TEXT NOT NULL,                            -- Human-readable device name
  public_key TEXT NOT NULL,                      -- Device's public key from secure element
  trust_status TEXT NOT NULL DEFAULT 'active'    -- 'active' | 'suspicious' | 'compromised' | 'locked'
    CHECK (trust_status IN ('active', 'suspicious', 'compromised', 'locked')),
  firmware_hash TEXT NOT NULL,                   -- SHA-256 hash of current firmware
  firmware_valid BOOLEAN DEFAULT true,           -- Server-verified firmware integrity
  key_locked BOOLEAN DEFAULT false,              -- Whether secure element keys are locked
  ip_address TEXT,                               -- Last known IP address
  location TEXT,                                 -- Physical location description
  trust_score INTEGER DEFAULT 100                -- 0-100 trust score
    CHECK (trust_score >= 0 AND trust_score <= 100),
  last_seen TIMESTAMPTZ DEFAULT now(),           -- Last health report timestamp
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== TAMPER EVENTS TABLE ====================
-- Logs all tamper detection events from devices
CREATE TABLE IF NOT EXISTS tamper_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  type TEXT NOT NULL                              -- Event type
    CHECK (type IN ('case_open', 'vibration', 'light_anomaly', 
                    'firmware_mismatch', 'auth_failure', 'key_lock')),
  severity TEXT NOT NULL DEFAULT 'medium'         -- Event severity
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details TEXT,                                   -- Human-readable description
  acknowledged BOOLEAN DEFAULT false,             -- Admin has reviewed this event
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== INDEXES ====================
CREATE INDEX idx_devices_status ON devices(trust_status);
CREATE INDEX idx_devices_last_seen ON devices(last_seen DESC);
CREATE INDEX idx_tamper_device ON tamper_events(device_id);
CREATE INDEX idx_tamper_severity ON tamper_events(severity);
CREATE INDEX idx_tamper_unacked ON tamper_events(acknowledged) WHERE acknowledged = false;

-- ==================== REAL-TIME ====================
-- Enable real-time subscriptions for the dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE devices;
ALTER PUBLICATION supabase_realtime ADD TABLE tamper_events;

-- ==================== ROW LEVEL SECURITY ====================
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tamper_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all devices and events
CREATE POLICY "Authenticated users can view devices"
  ON devices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view tamper events"
  ON tamper_events FOR SELECT TO authenticated USING (true);

-- Only service role can insert/update (from edge functions / server)
CREATE POLICY "Service role can manage devices"
  ON devices FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage tamper events"
  ON tamper_events FOR ALL TO service_role USING (true);

-- ==================== SAMPLE DATA ====================
-- Insert sample devices for demo
INSERT INTO devices (id, name, public_key, trust_status, firmware_hash, firmware_valid, key_locked, ip_address, location, trust_score) VALUES
  ('dev-001-alpha', 'Sensor-Gateway-Alpha', '04:a1:b2:c3:d4:e5:f6:07:08:09:0a:0b:0c:0d:0e:0f', 'active', 'a3f2c8e1d4b5a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', true, false, '192.168.1.101', 'Building A — Floor 2', 98),
  ('dev-002-bravo', 'Temp-Monitor-Bravo', '04:f1:e2:d3:c4:b5:a6:97:88:79:6a:5b:4c:3d:2e:1f', 'active', 'a3f2c8e1d4b5a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', true, false, '192.168.1.102', 'Building A — Floor 3', 95),
  ('dev-003-charlie', 'Access-Controller-C', '04:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff', 'suspicious', 'b4e3d9f2a1c0b7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2', false, false, '192.168.1.103', 'Building B — Lobby', 42),
  ('dev-004-delta', 'Env-Sensor-Delta', '04:aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88', 'compromised', 'ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00', false, true, '192.168.1.104', 'Building C — Server Room', 5),
  ('dev-005-echo', 'Motion-Detect-Echo', '04:de:ad:be:ef:ca:fe:ba:be:12:34:56:78:9a:bc:de', 'locked', 'a3f2c8e1d4b5a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', true, true, '192.168.1.105', 'Building A — Perimeter', 0),
  ('dev-006-foxtrot', 'Humidity-Sensor-F', '04:01:23:45:67:89:ab:cd:ef:fe:dc:ba:98:76:54:32', 'active', 'a3f2c8e1d4b5a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', true, false, '192.168.1.106', 'Building B — Floor 1', 99);
`;

/**
 * ============================================================
 * INTEGRATION INSTRUCTIONS (Step 6)
 * ============================================================
 * 
 * 1. SUPABASE SETUP
 *    - Create a Supabase project or enable Lovable Cloud
 *    - Run the SQL schema above in the SQL editor
 *    - Enable real-time for both tables
 * 
 * 2. NODE.JS SERVER
 *    - Copy the server code from node-server.ts
 *    - Install deps: npm install express @supabase/supabase-js
 *    - Set env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY
 *    - Run: node server.js
 * 
 * 3. ESP32 DEVICE
 *    - Flash esp32-device.ino to each ESP32
 *    - Update WiFi credentials and SERVER_URL
 *    - Connect tamper sensors (or run without for simulation)
 *    - Device auto-authenticates on boot
 * 
 * 4. ESP32 ADMIN MODULE
 *    - Flash esp32-admin.ino to admin ESP32
 *    - Enroll admin fingerprints using Adafruit library
 *    - Admin scans finger → server opens enrollment window
 * 
 * 5. WEB DASHBOARD (this app)
 *    - Already running! Uses mock data by default
 *    - To connect to live data: replace mock imports with
 *      Supabase real-time subscriptions
 * 
 * TEST CASES:
 *   ✓ Device sends health → dashboard updates status
 *   ✓ Case-open triggered → device locks keys → server gets alert → dashboard shows critical
 *   ✓ Firmware mismatch → device marked suspicious
 *   ✓ Admin fingerprint → enrollment window opens → new device registers
 *   ✓ Admin clicks Unlock → device re-provisioned to active
 *   ✓ 3 auth failures → device marked suspicious
 */

export const INTEGRATION_INSTRUCTIONS = "See comments above";
