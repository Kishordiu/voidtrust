import { useState, useCallback } from 'react';
import { SystemHeader } from '@/components/SystemHeader';
import { StatsCards } from '@/components/StatsCards';
import { DeviceTable } from '@/components/DeviceTable';
import { TamperLog } from '@/components/TamperLog';
import { EnrollmentPanel } from '@/components/EnrollmentPanel';
import { mockDevices, mockTamperEvents, IoTDevice, TamperEvent, DeviceStatus } from '@/lib/mock-data';

/**
 * Main dashboard for the Autonomous Zero-Trust Self-Defending IoT System.
 * Displays real-time device states, tamper alerts, and admin controls.
 * Uses mock data — in production, would use Supabase real-time subscriptions.
 */
const Index = () => {
  const [devices, setDevices] = useState<IoTDevice[]>(mockDevices);
  const [events, setEvents] = useState<TamperEvent[]>(mockTamperEvents);

  const handleStatusChange = useCallback((id: string, newStatus: DeviceStatus) => {
    setDevices(prev => prev.map(d =>
      d.id === id
        ? { ...d, status: newStatus, keyLocked: newStatus === 'locked', trustScore: newStatus === 'active' ? 85 : newStatus === 'locked' ? 0 : d.trustScore }
        : d
    ));
  }, []);

  const handleAcknowledge = useCallback((eventId: string) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, acknowledged: true } : e
    ));
  }, []);

  return (
    <div className="min-h-screen bg-background grid-cyber scanline">
      <SystemHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats overview */}
        <StatsCards devices={devices} />

        {/* Device registry table */}
        <DeviceTable devices={devices} onStatusChange={handleStatusChange} />

        {/* Bottom row: tamper log + enrollment */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <TamperLog events={events} onAcknowledge={handleAcknowledge} />
          <EnrollmentPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;
