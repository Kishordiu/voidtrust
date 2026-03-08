import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldX, Lock, Activity, Fingerprint } from 'lucide-react';
import { IoTDevice } from '@/lib/mock-data';

interface StatsCardsProps {
  devices: IoTDevice[];
}

export function StatsCards({ devices }: StatsCardsProps) {
  const active = devices.filter(d => d.status === 'active').length;
  const suspicious = devices.filter(d => d.status === 'suspicious').length;
  const compromised = devices.filter(d => d.status === 'compromised').length;
  const locked = devices.filter(d => d.status === 'locked').length;
  const avgTrust = Math.round(devices.reduce((s, d) => s + d.trustScore, 0) / devices.length);
  const keysLocked = devices.filter(d => d.keyLocked).length;

  const cards = [
    { label: 'Active', value: active, icon: Shield, color: 'text-success', glow: 'glow-primary' },
    { label: 'Suspicious', value: suspicious, icon: ShieldAlert, color: 'text-suspicious', glow: 'glow-warning' },
    { label: 'Compromised', value: compromised, icon: ShieldX, color: 'text-compromised', glow: 'glow-danger' },
    { label: 'Locked', value: locked, icon: Lock, color: 'text-locked', glow: '' },
    { label: 'Avg Trust', value: `${avgTrust}%`, icon: Activity, color: avgTrust > 70 ? 'text-success' : 'text-suspicious', glow: '' },
    { label: 'Keys Locked', value: keysLocked, icon: Fingerprint, color: keysLocked > 0 ? 'text-compromised' : 'text-success', glow: keysLocked > 0 ? 'glow-danger' : '' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`bg-card border border-border rounded-lg p-4 ${card.glow}`}
        >
          <div className="flex items-center justify-between mb-2">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{card.label}</span>
          </div>
          <p className={`text-2xl font-mono font-bold ${card.color}`}>{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
