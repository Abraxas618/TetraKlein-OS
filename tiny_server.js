const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const { execSync } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Access denied HTML screen
const securityErrorPage = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Access Denied</title>
<style>
body { background:#000; color:#f00; font-family:monospace; display:flex; align-items:center; justify-content:center; height:100vh; }
.terminal { border:2px solid #f00; padding:30px; text-align:center; box-shadow:0 0 12px #f00; }
.blink { animation: blink 1s step-end infinite; }
@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
</style></head>
<body><div class="terminal"><h1>ACCESS DENIED</h1><p>SECURITY VIOLATION DETECTED</p><p>LOCALHOST CONNECTIONS ONLY</p><p class="blink">INCIDENT LOGGED</p></div></body></html>`;

// Middleware: security headers and gzip
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

app.use(compression());

// 🔐 Allowlist for bridge/NAT IPs
app.use((req, res, next) => {
  const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const ip = rawIP.replace(/^::ffff:/, '');

  const trusted = [
    '127.0.0.1',
    '::1',
    'localhost',
    '10.0.2.100'  // <- Allow WSL2 / Podman NAT bridge
  ];

  if (!trusted.includes(ip)) {
    console.error(`🚫 Unauthorized IP: ${rawIP} normalized → ${ip}`);
    return res.status(403).contentType('text/html').send(securityErrorPage);
  }

  next();
});

// Prevent path traversal
app.use((req, res, next) => {
  const sanitized = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
  if (sanitized !== req.path) {
    console.warn(`🚨 Path traversal attempt: ${req.path}`);
    return res.status(403).contentType('text/html').send(securityErrorPage);
  }
  next();
});

// Static file handling
app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'deny',
  index: false,
  etag: false,
  lastModified: false
}));

app.use(express.json());

// Terminal commands (POST /command)
app.post('/command', (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Command required' });

  try {
    const output = processCommand(command);
    res.json({ response: output });
  } catch (err) {
    console.error(`Command error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'operational' });
});

// Main UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Mesh check
function isYggdrasilRunning() {
  try {
    execSync('pgrep yggdrasil', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Terminal command processor
function processCommand(input) {
  const [cmd, ...args] = input.trim().split(' ');
  const arg = args.join(' ');

  const commands = {
    help: () => ({
      type: 'help',
      message: `Available commands:\nhelp\nlogin\nstatus\ntime\nping\nmeshstatus\nvault\necho [text]\nadmin\nclear`
    }),
    login: () => ({
      type: 'login',
      message: 'SECURE LOGIN SEQUENCE INITIATED\nEnter password:'
    }),
    status: () => ({
      type: 'status',
      message: 'SYSTEM STATUS: OPERATIONAL\nSECURITY: MAXIMUM\nCONNECTION: ENCRYPTED'
    }),
    time: () => ({
      type: 'time',
      message: new Date().toLocaleString()
    }),
    ping: () => ({
      type: 'ping',
      message: 'PONG!'
    }),
    meshstatus: () => ({
      type: 'meshstatus',
      message: isYggdrasilRunning() ? 'YGGDRASIL: ACTIVE' : 'MESH MODE: SIMULATION (MOCK)'
    }),
    clear: () => ({
      type: 'clear',
      message: ''
    }),
    echo: () => ({
      type: 'echo',
      message: arg
    }),
    admin: () => ({
      type: 'admin',
      message: 'Redirecting to Admin UI...',
      redirect: '/admin'
    }),
    vault: () => {
      try {
        const vaultDir = '/app/vault';
        if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
        const files = fs.readdirSync(vaultDir);
        return {
          type: 'vault',
          message: files.length ? `Vault Files:\n${files.join('\n')}` : 'Vault is empty.'
        };
      } catch (err) {
        return { type: 'error', message: `Vault error: ${err.message}` };
      }
    }
  };

  return commands[cmd] ? commands[cmd]() : {
    type: 'error',
    message: 'Unknown command. Type "help" for a list.'
  };
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down.');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received.');
  process.exit(0);
});
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

// Boot message
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🛰️ TetraKlein-OS live on http://127.0.0.1:${PORT}`);
});
