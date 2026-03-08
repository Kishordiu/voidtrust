import { DeviceStatus, getStatusColor, getStatusBg } from '@/lib/mock-data';
import { Shield, ShieldAlert, ShieldX, Lock } from 'lucide-react';

const statusConfig: Record<DeviceStatus, { icon: typeof Shield; label: string }> = {
  active: { icon: Shield, label: 'Active' },
  suspicious: { icon: ShieldAlert, label: 'Suspicious' },
  compromised: { icon: ShieldX, label: 'Compromised' },
  locked: { icon: Lock, label: 'Locked' },
};

export function StatusBadge({ status }: { status: DeviceStatus }) {
  const { icon: Icon, label } = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${getStatusBg(status)} ${getStatusColor(status)}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
