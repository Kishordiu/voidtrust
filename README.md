# VoidTrust

> **A zero-trust security architecture for connected devices.**

VoidTrust explores continuous cryptographic verification, device identity, tamper response and dynamic trust enforcement for IoT and cyber-physical systems.

## Core idea

Traditional IoT systems often treat a device as trusted after onboarding. VoidTrust explores the opposite model: **trust is continuously evaluated and can be revoked when device behaviour or physical state becomes suspicious.**

## Security model

```text
Device Identity
      ↓
Signed / authenticated request
      ↓
Verification + replay protection
      ↓
Trust-state evaluation
      ↓
Allow / restrict / lockdown
      ↓
Operator visibility
```

## Implemented concepts

- Per-device cryptographic authentication
- HMAC-SHA256 request verification
- Timestamp-based replay protection
- HTTPS transport
- Dynamic trust states
- Tamper-triggered compromise / lockdown concepts

## Hardware direction

The architecture is designed to accommodate secure boot, hardware-backed keys, secure elements and physical tamper sensors as the system evolves. These are documented design directions and should not be interpreted as hardware already present in every deployment.

## Stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router · Recharts · Vitest

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Status

**Zero-trust IoT security prototype — evolving toward hardware-backed enforcement.**

## Author

**K. Kishor Kumar** · [GitHub @Kishordiu](https://github.com/Kishordiu)

---

<p align="center">Secure by design. Verify continuously.</p>