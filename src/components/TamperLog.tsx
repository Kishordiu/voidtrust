import { motion } from 'framer-motion';
import { TamperEvent, getSeverityColor, getSeverityBg } from '@/lib/mock-data';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TamperLogProps {
  events: TamperEvent[];
  onAcknowledge: (id: string) => void;
}

const typeLabels: Record<TamperEvent['type'], string> = {
  case_open: 'CASE OPEN',
  vibration: 'VIBRATION',
  light_anomaly: 'LIGHT',
  firmware_mismatch: 'FW MISMATCH',
  auth_failure: 'AUTH FAIL',
  key_lock: 'KEY LOCK',
};

export function TamperLog({ events, onAcknowledge }: TamperLogProps) {
  const handleAck = (evt: TamperEvent) => {
    onAcknowledge(evt.id);
    toast.info(`Alert ${evt.id} acknowledged`);
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-compromised" />
        <h2 className="text-sm font-mono font-semibold text-foreground">Tamper Event Log</h2>
        <span className="text-xs font-mono text-compromised ml-auto">
          {events.filter(e => !e.acknowledged).length} unacknowledged
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {events.map((evt, i) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center gap-2 ${!evt.acknowledged ? 'bg-compromised/5' : ''}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getSeverityBg(evt.severity)} ${getSeverityColor(evt.severity)} uppercase`}>
                {evt.severity}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                {typeLabels[evt.type]}
              </span>
              <span className="text-xs font-mono text-accent truncate">{evt.deviceName}</span>
            </div>
            <p className="text-xs text-muted-foreground flex-[2] min-w-0 truncate" title={evt.details}>
              {evt.details}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-muted-foreground">{formatTime(evt.timestamp)}</span>
              {!evt.acknowledged ? (
                <button
                  onClick={() => handleAck(evt)}
                  className="text-[10px] font-mono px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  ACK
                </button>
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-success" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
