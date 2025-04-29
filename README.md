# TetraKlein-OS Field Terminal

**CLASSIFICATION: TOP SECRET**

Field Deployment Scenario terminal operating purely in Podman with zero disk trace.
https://ipfs.io/ipfs/bafybeid5uvowt3fxk7idngfr4rcqdfdlywpkcpa4ddcadsf57bnwrry2ze
## Requirements

- Podman or Docker installed
- 64MB RAM minimum
- Secure environment

## Quick Deployment

### Linux/macOS
Run the deployment script to build and launch the TetraKlein-OS Field Terminal:

```bash
chmod +x deploy.sh
./deploy.sh
```

### Windows
Run the PowerShell deployment script:

```powershell
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

## Troubleshooting

If you encounter connection issues:

1. Check if port 8080 is already in use (the system will try port 3000 as fallback)
2. Verify that Podman/Docker is running
3. Check container logs:
   ```
   podman logs tetraklein-os
   ```
4. Try running in foreground mode for debugging:
   ```
   podman run --rm -it -p 127.0.0.1:8080:8080 -v "$(pwd)/vault:/app/vault:Z" tetraklein-os
   ```

## Access Points

- Terminal Interface: http://127.0.0.1:8080
- Admin Dashboard: http://127.0.0.1:8080/admin

## Security Features

- RAM-only operation — container destroys itself after stop
- Public-facing services bound to localhost only
- Hardened Node.js server with security headers
- No directory listing
- Yggdrasil mesh networking with auto-configuration
- Vault folder for classified file storage

## Architecture

- Alpine Linux base (minimal footprint)
- Node.js + Express
- No external frameworks (no React, Vite, or Webpack)
- Cold War style green-on-black CRT terminal UI
- Secure Top Secret Mesh Dashboard

## Important Notes

1. The container is configured to self-destruct when stopped
2. All data stored in the vault folder is mounted from the host
3. No data is persisted within the container after shutdown
4. Yggdrasil daemon runs as a background service

## Command Reference

Available terminal commands:
- `help`: Show help message
- `login`: Start login sequence
- `status`: Show system status
- `clear`: Clear terminal
- `meshstatus`: Show mesh network status
- `admin`: Access admin dashboard
- `time`: Show current time
- `vault`: List vault contents
- `ping`: Check connection status

## Mission Guidelines

1. Maintain secure communications
2. Destroy all evidence after mission completion
3. Keep all traffic localhost-bound
4. Use vault folder for classified storage

---

*DESTROY THIS DOCUMENT AFTER READING* 

# 🛡️ TetraKlein-OS — Flash-to-USB Field Deployment Manual

## Objective
Deploy TetraKlein-OS Secure Edition onto a USB 3.0+ device for sovereign RAM-only operation without leaving traces on any host machine.

---

## Requirements
- 1x USB 3.0 (minimum 4 GB; 8+ GB recommended)
- Linux system (or Windows with WSL2)
- Podman installed (or portable static Podman binary)
- TetraKlein-OS-Secure-Final.tar.gz archive

---

## Flashing Plan — Minimal Field Deployment

### Step 1: Format the USB
- Insert USB into system.
- Format USB to **ext4** (preferred) or **exFAT**.
- Label USB as `TETRAKLEIN-OPS` (optional).

Example for Linux:
```bash
sudo mkfs.ext4 /dev/sdX1
```

*Warning: Replace `sdX1` with your actual USB device path. Double check to avoid overwriting your hard drive.*

---

### Step 2: Mount USB and Prepare TetraKlein Files

```bash
mkdir /mnt/tetrausb
sudo mount /dev/sdX1 /mnt/tetrausb
```

Copy TetraKlein archive to USB:
```bash
cp TetraKlein-OS-Secure-Final.tar.gz /mnt/tetrausb/
```

Extract TetraKlein-OS directly on USB:
```bash
cd /mnt/tetrausb/
tar -xvzf TetraKlein-OS-Secure-Final.tar.gz
```

Grant execution permissions to deploy script:
```bash
chmod +x deploy.sh
```

Safely unmount USB after preparing:
```bash
sudo umount /mnt/tetrausb
```

---

### Step 3: Field Deployment

On any Linux host:

1. Insert TetraKlein USB.
2. Open terminal.
3. Mount if not auto-mounted.
4. Navigate to TetraKlein-OS directory:
```bash
cd /media/username/TETRAKLEIN-OPS/
```
5. Launch deploy script:
```bash
./deploy.sh
```

- Container will launch.
- Field Terminal accessible at `http://127.0.0.1:8080`
- Login required to access classified Vault and Commands.

---

## Optional Enhancements

- Copy a **portable Podman static binary** into USB for use on hosts without Podman installed.
- Encrypt the USB with **LUKS** for extra field security.
- Create an **autorun script** to auto-deploy TetraKlein Terminal when inserted into trusted systems.

---

## Security Notes

- RAM-only container operation.
- No hard disk writes unless manually ordered.
- Purge function wipes session data.
- Shutdown destroys RAM footprint.

TetraKlein-OS leaves no forensic trace unless persistence is deliberately enabled.

---

## Final Notes

> "The Cold War never ended. It evolved. The sovereign black sites of tomorrow are sovereign, mobile, and air-gapped."

Proceed under Sovereign Protocols.
