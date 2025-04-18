# Sovereign Field Operations Manual — Tactical Edition

---

## 🛡 1. Mission Objective

Deploy a fully sovereign, cryptographically hardened operating environment 
capable of executing sensitive operations in hostile territory, leaving no 
forensic trace upon device extraction or shutdown.

---

## 📦 2. System Design Overview

| Feature | Status |
|:--------|:-------|
| RAM-Only Live Boot | ✅ Enabled |
| Zero Local Disk Writes | ✅ Enforced |
| Internal-Only Webstack (localhost) | ✅ Active |
| No Default Network Trust (Zero-Trust) | ✅ Configured |
| Voluntary Persistence (Explicit Only) | ✅ Optional |
| Quantum-Resilient Randomization | ✅ Integrated |
| Airgap Enforced | ✅ Default |
| Sovereign Certificates | ✅ Active |

---

## 🚀 3. Operational Procedure

### 3.1 Preparing the Sovereign USB

- Flash the Sovereign ISO onto a high-quality, high-speed USB 3.0+ device.
- Verify SHA3-512 checksum before field use.
- Set BIOS to **disable boot from internal disk**.
- Force **USB-first boot** in boot order settings.

---

### 3.2 Booting in Hostile Environment

- Insert USB device discreetly into target system.
- Power on and select USB Boot manually if necessary.
- Once LiveOS is loaded:
  - Confirm **localhost services only** are running.
  - Check **network interfaces are disabled or spoofed** if not needed.
  - Validate Sovereign Ledger Service status.
  
---

### 3.3 Conducting Mission Operations

- Perform cryptographic tasks strictly over internal loopback addresses (`127.0.0.1`).
- Encrypt all outputs internally; avoid external storage unless absolutely necessary.
- Regularly monitor entropy daemon for sufficient randomness levels.
- When session is complete, **prepare for extraction**.

---

### 3.4 Emergency Extraction Procedure

| Condition | Response |
|:----------|:---------|
| Imminent threat, no shutdown possible | Yank USB forcibly |
| Normal mission complete | Graceful shutdown preferred (click shutdown button) |

Result in both cases:
- RAM contents wiped automatically.
- Volatile session keys destroyed irreversibly.
- No local disk activity remains recoverable.

---

## 🧬 4. System Internal Services (Summary)

| Service | Purpose |
|:--------|:--------|
| GREG (Entropy) | Supplies cryptographic randomness |
| TKEv1-Q | Post-quantum key exchange for internal systems |
| Sovereign Mesh Node | Internal encrypted P2P comms (optional) |
| zkSNARK Proof Engine | Identityless proof-of-validity subsystem |
| Ledger Service (HBB) | Sovereign transaction and voting record storage |
| Sovereign Certificate Authority (Internal) | Local HTTPS trust, no external dependency |

---

## 🔥 5. Critical Doctrines for Survivability

- **Never trust external Wi-Fi or Ethernet without a portable router under control.**
- **Never leave SovereignOS running unattended.**
- **Never save persistent files unless encrypted twice (at-rest key and envelope key).**
- **Physically destroy compromised USBs if extraction is impossible.**

---

## 🛰 6. Recommended Hardware

- USB 3.0+ certified drives with wear-leveling.
- x86_64 architecture laptops preferred (minimum 4GB RAM).
- Optionally use full-metal (non-TPM) BIOS systems for deeper trust.

---

## 🛡 7. Field Maxim

> **"When the USB leaves the port, the Nation leaves no shadow."**

---

# End of Document
