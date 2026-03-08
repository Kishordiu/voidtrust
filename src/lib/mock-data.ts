/**
 * Mock data simulating IoT devices in a Zero-Trust Self-Defending system.
 * In production, this data would come from Supabase real-time subscriptions.
 */

export type DeviceStatus = 'active' | 'suspicious' | 'compromised' | 'locked';

export interface IoTDevice {
  id: string;
  name: string;
  publicKey: string;
  status: DeviceStatus;
  firmwareHash: string;
  firmwareValid: boolean;
  lastSeen: Date;
  keyLocked: boolean;
  ipAddress: string;
  location: string;
  trustScore: number; // 0-100
}

export interface TamperEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'case_open' | 'vibration' | 'light_anomaly' | 'firmware_mismatch' | 'auth_failure' | 'key_lock';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: string;
  acknowledged: boolean;
}

// Sample firmware hash for "valid" firmware
const VALID_FIRMWARE_HASH = 'a3f2c8e1d4b5a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1';

export const mockDevices: IoTDevice[] = [
  {
    id: 'dev-001-alpha',
    name: 'Sensor-Gateway-Alpha',
    publicKey: '04:a1:b2:c3:d4:e5:f6:07:08:09:0a:0b:0c:0d:0e:0f',
    status: 'active',
    firmwareHash: VALID_FIRMWARE_HASH,
    firmwareValid: true,
    lastSeen: new Date(Date.now() - 12000),
    keyLocked: false,
    ipAddress: '192.168.1.101',
    location: 'Building A — Floor 2',
    trustScore: 98,
  },
  {
    id: 'dev-002-bravo',
    name: 'Temp-Monitor-Bravo',
    publicKey: '04:f1:e2:d3:c4:b5:a6:97:88:79:6a:5b:4c:3d:2e:1f',
    status: 'active',
    firmwareHash: VALID_FIRMWARE_HASH,
    firmwareValid: true,
    lastSeen: new Date(Date.now() - 30000),
    keyLocked: false,
    ipAddress: '192.168.1.102',
    location: 'Building A — Floor 3',
    trustScore: 95,
  },
  {
    id: 'dev-003-charlie',
    name: 'Access-Controller-C',
    publicKey: '04:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff',
    status: 'suspicious',
    firmwareHash: 'b4e3d9f2a1c0b7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2',
    firmwareValid: false,
    lastSeen: new Date(Date.now() - 180000),
    keyLocked: false,
    ipAddress: '192.168.1.103',
    location: 'Building B — Lobby',
    trustScore: 42,
  },
  {
    id: 'dev-004-delta',
    name: 'Env-Sensor-Delta',
    publicKey: '04:aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88',
    status: 'compromised',
    firmwareHash: 'ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00',
    firmwareValid: false,
    lastSeen: new Date(Date.now() - 600000),
    keyLocked: true,
    ipAddress: '192.168.1.104',
    location: 'Building C — Server Room',
    trustScore: 5,
  },
  {
    id: 'dev-005-echo',
    name: 'Motion-Detect-Echo',
    publicKey: '04:de:ad:be:ef:ca:fe:ba:be:12:34:56:78:9a:bc:de',
    status: 'locked',
    firmwareHash: VALID_FIRMWARE_HASH,
    firmwareValid: true,
    lastSeen: new Date(Date.now() - 3600000),
    keyLocked: true,
    ipAddress: '192.168.1.105',
    location: 'Building A — Perimeter',
    trustScore: 0,
  },
  {
    id: 'dev-006-foxtrot',
    name: 'Humidity-Sensor-F',
    publicKey: '04:01:23:45:67:89:ab:cd:ef:fe:dc:ba:98:76:54:32',
    status: 'active',
    firmwareHash: VALID_FIRMWARE_HASH,
    firmwareValid: true,
    lastSeen: new Date(Date.now() - 5000),
    keyLocked: false,
    ipAddress: '192.168.1.106',
    location: 'Building B — Floor 1',
    trustScore: 99,
  },
];

export const mockTamperEvents: TamperEvent[] = [
  {
    id: 'evt-001',
    deviceId: 'dev-004-delta',
    deviceName: 'Env-Sensor-Delta',
    type: 'case_open',
    severity: 'critical',
    timestamp: new Date(Date.now() - 600000),
    details: 'Physical case-open microswitch triggered. Device enclosure breach detected.',
    acknowledged: false,
  },
  {
    id: 'evt-002',
    deviceId: 'dev-004-delta',
    deviceName: 'Env-Sensor-Delta',
    type: 'key_lock',
    severity: 'critical',
    timestamp: new Date(Date.now() - 595000),
    details: 'Cryptographic keys locked in secure element. Device entered restricted mode.',
    acknowledged: false,
  },
  {
    id: 'evt-003',
    deviceId: 'dev-003-charlie',
    deviceName: 'Access-Controller-C',
    type: 'firmware_mismatch',
    severity: 'high',
    timestamp: new Date(Date.now() - 180000),
    details: 'Firmware SHA-256 hash mismatch. Expected: a3f2c8...b1, Got: b4e3d9...e2',
    acknowledged: false,
  },
  {
    id: 'evt-004',
    deviceId: 'dev-003-charlie',
    deviceName: 'Access-Controller-C',
    type: 'auth_failure',
    severity: 'medium',
    timestamp: new Date(Date.now() - 170000),
    details: 'Challenge-response authentication failed 3 consecutive times.',
    acknowledged: false,
  },
  {
    id: 'evt-005',
    deviceId: 'dev-005-echo',
    deviceName: 'Motion-Detect-Echo',
    type: 'vibration',
    severity: 'high',
    timestamp: new Date(Date.now() - 3600000),
    details: 'Excessive vibration detected (>2g for 5 seconds). Possible physical tampering.',
    acknowledged: true,
  },
  {
    id: 'evt-006',
    deviceId: 'dev-005-echo',
    deviceName: 'Motion-Detect-Echo',
    type: 'key_lock',
    severity: 'critical',
    timestamp: new Date(Date.now() - 3595000),
    details: 'Auto-lockdown triggered after tamper detection. Admin re-provisioning required.',
    acknowledged: true,
  },
  {
    id: 'evt-007',
    deviceId: 'dev-001-alpha',
    deviceName: 'Sensor-Gateway-Alpha',
    type: 'light_anomaly',
    severity: 'low',
    timestamp: new Date(Date.now() - 86400000),
    details: 'Light sensor detected brief anomaly (200ms). Likely environmental — no action taken.',
    acknowledged: true,
  },
];

/** Helper to get status color class */
export function getStatusColor(status: DeviceStatus): string {
  switch (status) {
    case 'active': return 'text-success';
    case 'suspicious': return 'text-suspicious';
    case 'compromised': return 'text-compromised';
    case 'locked': return 'text-locked';
  }
}

export function getStatusBg(status: DeviceStatus): string {
  switch (status) {
    case 'active': return 'bg-success/10 border-success/30';
    case 'suspicious': return 'bg-suspicious/10 border-suspicious/30';
    case 'compromised': return 'bg-compromised/10 border-compromised/30';
    case 'locked': return 'bg-locked/10 border-locked/30';
  }
}

export function getSeverityColor(severity: TamperEvent['severity']): string {
  switch (severity) {
    case 'low': return 'text-muted-foreground';
    case 'medium': return 'text-suspicious';
    case 'high': return 'text-compromised';
    case 'critical': return 'text-compromised';
  }
}

export function getSeverityBg(severity: TamperEvent['severity']): string {
  switch (severity) {
    case 'low': return 'bg-muted border-muted-foreground/20';
    case 'medium': return 'bg-suspicious/10 border-suspicious/30';
    case 'high': return 'bg-compromised/10 border-compromised/30';
    case 'critical': return 'bg-compromised/20 border-compromised/50';
  }
}
