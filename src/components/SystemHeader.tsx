import { Shield, Terminal } from 'lucide-react';

export function SystemHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold text-gradient-cyber">ZERO-TRUST IoT</h1>
            <p className="text-[10px] font-mono text-muted-foreground">Autonomous Self-Defending System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary text-[10px] font-mono text-muted-foreground">
            <Terminal className="w-3 h-3" />
            PROTOTYPE v0.1
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-success/10 border border-success/30">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
            <span className="text-[10px] font-mono text-success">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
