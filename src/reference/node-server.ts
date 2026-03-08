/**
 * ============================================================
 * REFERENCE CODE — Node.js Server / API (Step 3)
 * ============================================================
 * Express.js server handling device registration, authentication,
 * tamper alerts, and admin operations.
 * 
 * In production, deploy as Supabase Edge Functions or standalone Node.js server.
 * 
 * Endpoints:
 *   POST /api/register          - Register new device (during enrollment window)
 *   GET  /api/auth/challenge    - Get authentication challenge
 *   POST /api/auth/verify       - Verify challenge-response signature
 *   POST /api/health            - Receive device health reports
 *   POST /api/tamper-alert      - Receive tamper event alerts
 *   POST /api/enrollment/open   - Open enrollment window (admin-only)
 *   PUT  /api/devices/:id/unlock - Admin unlock a device
 *   GET  /api/devices            - List all devices
 */

/*
const express = require('express');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// In-memory state (use Redis in production)
let enrollmentWindowOpen = false;
let enrollmentWindowExpiry = 0;
const pendingChallenges = new Map(); // deviceId -> { challenge, expiry }

// ==================== DEVICE REGISTRATION ====================
// POST /api/register
// Only works when enrollment window is open (admin-authenticated)
app.post('/api/register', async (req, res) => {
  if (!enrollmentWindowOpen || Date.now() > enrollmentWindowExpiry) {
    return res.status(403).json({ error: 'Enrollment window is closed' });
  }
  
  const { deviceId, publicKey, firmwareHash } = req.body;
  
  // Validate input
  if (!deviceId || !publicKey || !firmwareHash) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Store device in Supabase
  const { data, error } = await supabase
    .from('devices')
    .insert({
      id: deviceId,
      public_key: publicKey,
      firmware_hash: firmwareHash,
      trust_status: 'active',
      key_locked: false,
      last_seen: new Date().toISOString(),
    });
  
  if (error) {
    console.error('[REG] Error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
  
  console.log(`[REG] Device ${deviceId} registered successfully`);
  res.json({ status: 'registered', deviceId });
});

// ==================== CHALLENGE-RESPONSE AUTH ====================
// GET /api/auth/challenge?deviceId=xxx
app.get('/api/auth/challenge', (req, res) => {
  const { deviceId } = req.query;
  
  // Generate random 32-byte challenge
  const challenge = crypto.randomBytes(32).toString('hex');
  
  // Store with 30-second expiry
  pendingChallenges.set(deviceId, {
    challenge,
    expiry: Date.now() + 30000,
  });
  
  res.json({ challenge });
});

// POST /api/auth/verify
app.post('/api/auth/verify', async (req, res) => {
  const { deviceId, challenge, signature } = req.body;
  
  const pending = pendingChallenges.get(deviceId);
  if (!pending || pending.challenge !== challenge || Date.now() > pending.expiry) {
    // Log auth failure
    await logTamperEvent(deviceId, 'auth_failure', 'medium',
      'Challenge-response verification failed');
    return res.status(401).json({ error: 'Authentication failed' });
  }
  
  // In production: verify ECDSA signature against stored public key
  // For prototype: accept any non-empty signature
  pendingChallenges.delete(deviceId);
  
  // Update last seen
  await supabase
    .from('devices')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', deviceId);
  
  res.json({ status: 'authenticated' });
});

// ==================== HEALTH MONITORING ====================
// POST /api/health
app.post('/api/health', async (req, res) => {
  const { deviceId, firmwareHash, firmwareValid, keysLocked, restrictedMode } = req.body;
  
  // Determine trust status based on health data
  let trustStatus = 'active';
  if (restrictedMode || keysLocked) trustStatus = 'compromised';
  else if (!firmwareValid) trustStatus = 'suspicious';
  
  await supabase
    .from('devices')
    .update({
      firmware_hash: firmwareHash,
      trust_status: trustStatus,
      key_locked: keysLocked,
      last_seen: new Date().toISOString(),
    })
    .eq('id', deviceId);
  
  // If firmware mismatch detected server-side
  if (!firmwareValid) {
    await logTamperEvent(deviceId, 'firmware_mismatch', 'high',
      `Firmware hash mismatch: ${firmwareHash}`);
  }
  
  res.json({ status: 'ok' });
});

// ==================== TAMPER ALERTS ====================
// POST /api/tamper-alert
app.post('/api/tamper-alert', async (req, res) => {
  const { deviceId, type, details, keysLocked } = req.body;
  
  const severity = (type === 'case_open' || type === 'key_lock') ? 'critical' :
                   (type === 'vibration' || type === 'firmware_mismatch') ? 'high' :
                   (type === 'auth_failure') ? 'medium' : 'low';
  
  await logTamperEvent(deviceId, type, severity, details);
  
  // Auto-update device status
  if (severity === 'critical') {
    await supabase
      .from('devices')
      .update({ trust_status: 'compromised', key_locked: keysLocked })
      .eq('id', deviceId);
  }
  
  console.log(`[TAMPER] ${severity.toUpperCase()} alert from ${deviceId}: ${type}`);
  res.json({ status: 'received' });
});

// ==================== ADMIN OPERATIONS ====================
// POST /api/enrollment/open
app.post('/api/enrollment/open', (req, res) => {
  const { duration = 60, adminVerified } = req.body;
  
  if (!adminVerified) {
    return res.status(403).json({ error: 'Admin verification required' });
  }
  
  enrollmentWindowOpen = true;
  enrollmentWindowExpiry = Date.now() + (duration * 1000);
  
  setTimeout(() => {
    enrollmentWindowOpen = false;
    console.log('[ENROLL] Window closed');
  }, duration * 1000);
  
  console.log(`[ENROLL] Window opened for ${duration}s`);
  res.json({ status: 'open', expiresIn: duration });
});

// PUT /api/devices/:id/unlock
app.put('/api/devices/:id/unlock', async (req, res) => {
  const { id } = req.params;
  
  await supabase
    .from('devices')
    .update({
      trust_status: 'active',
      key_locked: false,
    })
    .eq('id', id);
  
  console.log(`[ADMIN] Device ${id} unlocked and re-provisioned`);
  res.json({ status: 'unlocked' });
});

// GET /api/devices
app.get('/api/devices', async (req, res) => {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .order('last_seen', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ==================== HELPERS ====================
async function logTamperEvent(deviceId, type, severity, details) {
  // Get device name
  const { data: device } = await supabase
    .from('devices')
    .select('name')
    .eq('id', deviceId)
    .single();
  
  await supabase
    .from('tamper_events')
    .insert({
      device_id: deviceId,
      device_name: device?.name || deviceId,
      type,
      severity,
      details,
      acknowledged: false,
    });
}

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[SERVER] Zero-Trust IoT API running on port ${PORT}`);
  console.log('[SERVER] Endpoints:');
  console.log('  POST /api/register');
  console.log('  GET  /api/auth/challenge');
  console.log('  POST /api/auth/verify');
  console.log('  POST /api/health');
  console.log('  POST /api/tamper-alert');
  console.log('  POST /api/enrollment/open');
  console.log('  PUT  /api/devices/:id/unlock');
  console.log('  GET  /api/devices');
});
*/

export const NODE_SERVER_CODE = "See comments above for complete Node.js server code";
