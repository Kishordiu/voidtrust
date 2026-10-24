![VOIDTRUST — bespoke brushed-metal project artwork](./assets/readme-metal-hero.svg)

# VOIDTRUST

**A zero-trust device-management concept expressed as a stateful operations dashboard.**

VoidTrust explores a security model in which a device’s state can change over time rather than remaining trusted simply because it was enrolled once. The current main dashboard explicitly uses mock device and tamper-event data; state changes are client-side interactions for demonstrating the workflow.

## Trust-state model

```text
Device record
     │
     ▼
Trust state shown in the UI
     │
     ├──► Review status
     ├──► Acknowledge a sample event
     └──► Demonstrate a state change
               │
               ▼
          Updated local UI state
```

## Interface modules

- **Stats and device table:** Present the sample device fleet and its state.
- **Tamper log:** Show illustrative events and their acknowledgement state.
- **Enrollment panel:** Provides a UI point for demonstrating device onboarding.
- **Trust-state vocabulary:** Gives the product a way to discuss active, locked, and other device states.

## Stack

React · TypeScript · Vite · Tailwind CSS · Framer Motion · Lucide

## Run locally

**Requirements:** Node.js and npm.

```bash
git clone https://github.com/Kishordiu/voidtrust.git
cd voidtrust
npm ci
npm run dev
```

Run the project's lint and test scripts with `npm run lint` and `npm test`.

## Security boundary

**The current dashboard uses mock data.** It does not provide production cryptographic identity, per-request authorization, remote device enforcement, private-key deletion, or a real tamper sensor just because those concepts appear in the interface. A production implementation would require a threat model, a secured backend, device-side identity and key storage, auditable event handling, and independent security testing.

---

<p align="center"><sub>DIU FOUNDRY · TRUST MODEL / SECURITY EXPERIENCE</sub></p>
