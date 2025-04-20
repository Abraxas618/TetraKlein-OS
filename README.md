# TetraKlein-OS — Sovereign Field Terminal

## Mission Statement

TetraKlein-OS is a hybrid Cold War-era field operating system combining immersive roleplay terminal operations with a real sovereign encrypted mesh communications network.  
It is designed for sovereign field agents, operatives, and commanders operating in simulated or real contested environments.

---

## System Architecture

| Layer | Purpose | Reality Level |
|:------|:--------|:--------------|
| **Terminal Interface** (`/`) | Cold War-era visual terminal for psychological training and operational immersion | Roleplay Simulation ✅ |
| **Vault Directory** (`/vault/`) | Preloaded "classified" documents based on public domain conspiracy research (Pegasus, Montauk, Philadelphia Project, etc.) | Roleplay Simulation ✅ |
| **Yggdrasil Mesh Network** (daemon inside Podman) | Real encrypted IPv6 peer-to-peer communication network using public/private key cryptography | **Real Operational Mesh** ✅ |

---

## Terminal Interface (localhost:8080)

Upon deployment, the field agent accesses the Cold War Terminal via `http://127.0.0.1:8080`:
- Black background, green CRT text
- Flickering Cold War phosphor simulation
- Blinking command prompt `>>>`
- Commands include: `dir`, `cd`, `cat`, `login`, `purge`
- Vault contains simulated Top Secret reports for immersion

*Note: The Vault documents are purely for roleplay and training purposes. They are based on open-source speculative research and do not represent actual classified information.*

---

## Real Sovereign Mesh Network

Inside the same Podman container, a Yggdrasil daemon runs, creating a real encrypted Mesh:

- Autonomous IPv6 address generation
- Public/Private key secured communications
- Peer-to-peer connections without central authority
- Optional expansion into global decentralized sovereign networks

The mesh network is designed for **real-world encrypted field communications** — not roleplay.  
Field agents can link real TetraKlein-Mesh nodes in the field for secure sovereign data transfer.

---

## Deployment Summary

1. **Build Container:**
```bash
podman build -t tetraklein-os .
```

2. **Run Container:**
```bash
podman run --rm -p 8080:8080 tetraklein-os
```

3. **Access Terminal:**
```
http://127.0.0.1:8080
```

4. **Access Mesh Status (optional future upgrade):**
```
http://127.0.0.1:8080/admin
```

---

## Sovereign Security Features

- Podman RAM-only container operation
- No disk leaks unless manually saved
- Localhost-only web interface (no public exposure)
- Hardened minimal Node.js server
- Yggdrasil cryptographic peer-to-peer networking
- Optional vault file encryption upgrade for field real-world use

---

## Important Notices

- **Vault documents** are simulation-only for training purposes.
- **Mesh communications** are fully real and operational.
- **No centralized authority** controls the Mesh once launched.
- **No personal data** is stored unless field agents configure additional extensions.
- **Shutdown** of container destroys all RAM-resident operational data.

---

## Recommended Usage Scenarios

- Field agent Cold War training
- Encrypted sovereign communications
- Disaster recovery sovereign communications grid
- Operational immersion training for decentralized operators
- Cold War psychological operations simulation exercises

---

## Final Word

_"The Cold War never ended. It simply evolved."_

TetraKlein-OS is the sovereign field system for the next phase of decentralized human agency.

Operatives are encouraged to adapt, improvise, and secure the sovereignty of information at all costs.

> **Field Manual v1.4**  
> **Classified Sovereign Development — TetraKlein Command**


# TetraKlein-OS Terminal Interface

A stylized interactive terminal interface with a retro computer look and feel. This project provides a simulated terminal environment with basic command functionality.

## Features

- Modern CSS styling with retro terminal aesthetics
- Interactive command input and response
- Simulated file system navigation
- Command history navigation (up/down arrows)
- Responsive design for different screen sizes

## Usage

Simply open the `index.html` file in any modern web browser to start using the terminal interface. 

### Available Commands

- `help` - Display available commands
- `clear` - Clear the terminal screen
- `echo [text]` - Display text
- `ls` - List files and directories in the current location
- `cd [directory]` - Change directory
- `cat [file]` - Display file contents
- `pwd` - Print working directory

## Project Structure

```
TetraKlein-OS/
├── index.html         # Main HTML file
├── public/
│   ├── css/
│   │   └── terminal.css  # Terminal styling
│   └── js/
│       └── terminal.js   # Terminal functionality
└── README.md          # This file
```

## Customization

You can customize the terminal by modifying:
- `terminal.css` - Adjust colors, dimensions, and styling
- `terminal.js` - Add new commands or modify existing functionality

## License

MIT 
