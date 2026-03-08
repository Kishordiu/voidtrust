import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoTDevice, DeviceStatus } from '@/lib/mock-data';
import { StatusBadge } from './StatusBadge';
import { CheckCircle, XCircle, Unlock, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface DeviceTableProps {
  devices: IoTDevice[];
  onStatusChange: (id: string, status: DeviceStatus) => void;
}

export function DeviceTable({ devices, onStatusChange }: DeviceTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleUnlock = (device: IoTDevice) => {
    onStatusChange(device.id, 'active');
    toast.success(`Device ${device.name} unlocked and re-provisioned`);
  };

  const handleLock = (device: IoTDevice) => {
    onStatusChange(device.id, 'locked');
    toast.warning(`Device ${device.name} locked by admin`);
  };

  const timeAgo = (date: Date) => {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Eye className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-mono font-semibold text-foreground">Device Registry</h2>
        <span className="text-xs font-mono text-muted-foreground ml-auto">{devices.length} devices</span>
      </div>

      {/* Header */}
      <div className="hidden md:grid grid-cols-[1fr_120px_1fr_100px_80px_100px_80px] gap-2 px-4 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border">
        <span>Device</span>
        <span>Status</span>
        <span>Firmware</span>
        <span>Trust</span>
        <span>Keys</span>
        <span>Last Seen</span>
        <span>Actions</span>
      </div>

      {/* Rows */}
      {devices.map((device) => (
        <div key={device.id}>
          <div
            className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr_100px_80px_100px_80px] gap-2 px-4 py-3 border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer items-center"
            onClick={() => setExpandedId(expandedId === device.id ? null : device.id)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${device.status === 'active' ? 'bg-success animate-pulse-glow' : device.status === 'suspicious' ? 'bg-suspicious' : device.status === 'compromised' ? 'bg-compromised animate-pulse-glow' : 'bg-locked'}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{device.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{device.id}</p>
              </div>
              <span className="md:hidden ml-auto">
                {expandedId === device.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </span>
            </div>
            <div className="hidden md:block"><StatusBadge status={device.status} /></div>
            <div className="hidden md:flex items-center gap-1.5">
              {device.firmwareValid ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <XCircle className="w-3.5 h-3.5 text-compromised" />}
              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[160px]">{device.firmwareHash.slice(0, 16)}…</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${device.trustScore > 70 ? 'bg-success' : device.trustScore > 30 ? 'bg-suspicious' : 'bg-compromised'}`}
                    style={{ width: `${device.trustScore}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{device.trustScore}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span className={`text-xs font-mono ${device.keyLocked ? 'text-compromised' : 'text-success'}`}>
                {device.keyLocked ? '🔒 Locked' : '🔓 Open'}
              </span>
            </div>
            <div className="hidden md:block">
              <span className="text-xs font-mono text-muted-foreground">{timeAgo(device.lastSeen)}</span>
            </div>
            <div className="hidden md:flex gap-1" onClick={(e) => e.stopPropagation()}>
              {(device.status === 'locked' || device.status === 'compromised') && (
                <button
                  onClick={() => handleUnlock(device)}
                  className="p-1.5 rounded bg-success/10 hover:bg-success/20 text-success transition-colors"
                  title="Unlock & Re-provision"
                >
                  <Unlock className="w-3.5 h-3.5" />
                </button>
              )}
              {device.status === 'active' && (
                <button
                  onClick={() => handleLock(device)}
                  className="p-1.5 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                  title="Lock Device"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile expanded details */}
          <AnimatePresence>
            {expandedId === device.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden md:hidden bg-secondary/20 border-b border-border"
              >
                <div className="p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between"><StatusBadge status={device.status} /></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">IP:</span><span>{device.ipAddress}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Location:</span><span>{device.location}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Trust:</span><span>{device.trustScore}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Keys:</span><span className={device.keyLocked ? 'text-compromised' : 'text-success'}>{device.keyLocked ? 'Locked' : 'Open'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last Seen:</span><span>{timeAgo(device.lastSeen)}</span></div>
                  <div className="flex gap-2 pt-2">
                    {(device.status === 'locked' || device.status === 'compromised') && (
                      <button onClick={() => handleUnlock(device)} className="flex-1 py-2 rounded bg-success/10 text-success text-center">Unlock</button>
                    )}
                    {device.status === 'active' && (
                      <button onClick={() => handleLock(device)} className="flex-1 py-2 rounded bg-destructive/10 text-destructive text-center">Lock</button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
