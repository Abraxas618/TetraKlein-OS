
# 🚀 TetraKlein Deployment Manifest

This document provides instructions for launching TetraKlein sovereign nodes.

---

## Requirements

- Docker installed (version >= 24)
- Python 3.11+ for local runs (optional)
- Node.js (optional for Mesh Node testing)

---

## Sovereign Node Launch (Docker)

```bash
cd Docker/
docker build -t tetraklein-node .
docker run --rm tetraklein-node
```

This will autonomously bootstrap:

- Golden Ratio Entropy Initialization
- PQCrypto Engines Activation
- Sovereign Ledger Genesis Formation
- ZK Poseidon Circuit Preparation

---

## Mesh Node Launch (Optional Test)

```bash
cd Mesh/
npm install
npm run dev
```

This will spawn a sovereign mesh node ready to interface with Ledger and ZK layers.

---

## Deployment Notes

- All cryptography is post-quantum safe.
- No decoy or placeholder systems exist.
- TetraKlein is fully sovereign and decentralized.

