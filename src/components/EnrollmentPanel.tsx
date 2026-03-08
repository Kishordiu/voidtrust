import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Radio, Timer, Plus } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Simulates the admin enrollment window that would be triggered
 * by physical biometric/NFC authentication on the ESP32 admin module.
 */
export function EnrollmentPanel() {
  const [windowOpen, setWindowOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const openWindow = () => {
    setWindowOpen(true);
    setCountdown(60);
    toast.success('Enrollment window opened — 60s remaining');

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setWindowOpen(false);
          toast.info('Enrollment window closed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const simulateEnroll = () => {
    toast.success('New device DEV-007-GOLF registered successfully!');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Fingerprint className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-mono font-semibold text-foreground">Secure Enrollment</h2>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        In production, an admin physically authenticates via fingerprint/NFC on the ESP32 module to open the enrollment window.
      </p>

      {!windowOpen ? (
        <button
          onClick={openWindow}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary font-mono text-sm hover:bg-primary/20 transition-colors glow-primary"
        >
          <Fingerprint className="w-4 h-4" />
          Simulate Admin Auth & Open Window
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-success animate-pulse-glow" />
              <span className="text-xs font-mono text-success">ENROLLMENT WINDOW ACTIVE</span>
            </div>
            <div className="flex items-center gap-1 text-success">
              <Timer className="w-3 h-3" />
              <span className="text-sm font-mono font-bold">{countdown}s</span>
            </div>
          </div>

          <button
            onClick={simulateEnroll}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent/10 border border-accent/30 text-accent font-mono text-sm hover:bg-accent/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Simulate New Device Registration
          </button>
        </motion.div>
      )}
    </div>
  );
}
