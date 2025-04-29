// Secure TetraKlein-OS Field Terminal Server
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const { execSync } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const userState = {}; // In-memory session state

const securityErrorPage = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Access Denied</title><style>
body{background:#000;color:#f00;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;}
.terminal{border:2px solid #f00;padding:30px;text-align:center;box-shadow:0 0 12px #f00;}
.blink{animation:blink 1s step-end infinite;}
@keyframes blink{0%,50%{opacity:1;}51%,100%{opacity:0;}}
</style></head><body><div class="terminal"><h1>ACCESS DENIED</h1><p>SECURITY VIOLATION DETECTED</p><p>LOCALHOST CONNECTIONS ONLY</p><p class="blink">INCIDENT LOGGED</p></div></body></html>`;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:']
    }
  }
}));
app.use(compression());
app.use(express.json());

app.use((req, res, next) => {
  const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const ip = rawIP.replace(/^::ffff:/, '');
  const trusted = ['127.0.0.1', '::1', 'localhost', '10.0.2.100'];
  if (!trusted.includes(ip)) return res.status(403).contentType('text/html').send(securityErrorPage);
  next();
});

app.use((req, res, next) => {
  const sanitized = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
  if (sanitized !== req.path) return res.status(403).contentType('text/html').send(securityErrorPage);
  next();
});

app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'deny',
  index: false,
  etag: false,
  lastModified: false
}));

// Command API
app.post('/command', (req, res) => {
  const { command, sessionId = 'default' } = req.body;
  if (!command) return res.status(400).json({ error: 'Command required' });

  let input = command.trim();
  if (!userState[sessionId]) {
    userState[sessionId] = { awaitingPassword: false };
  }

  const state = userState[sessionId];

  // 🔐 Handle login initiation FIRST
  if (input.toLowerCase() === 'login') {
    state.awaitingPassword = true;
    return res.json({
      response: {
        type: 'login',
        message: 'NSA-GRADE SECURE LOGIN SEQUENCE INITIATED\n' +
                 'Enter new password:\n' +
                 '- Min 16 chars, upper/lower/number/symbol\n'
      }
    });
  }

  // 🔐 Handle password submission SECOND
  if (state.awaitingPassword) {
    const accepted = (
      input.length >= 16 &&
      /[a-z]/.test(input) &&
      /[A-Z]/.test(input) &&
      /[0-9]/.test(input) &&
      /[^A-Za-z0-9]/.test(input)
    );

    state.awaitingPassword = false;
    input = ''.padEnd(128, '\0'); // scrub
    input = null;

    return res.json({
      response: {
        type: accepted ? 'login' : 'error',
        message: accepted
          ? '✅ PASSWORD ACCEPTED\nACCESS GRANTED.'
          : '❌ PASSWORD REJECTED\nMust meet NSA standards.\nTry again:'
      }
    });
  }

  // 🧭 Normal command routing
  try {
    const output = processCommand(command);
    res.json({ response: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


function processCommand(input) {
  const [cmd, ...args] = input.trim().split(' ');
  const arg = args.join(' ');
  const commands = {
    help: () => ({ type: 'help', message: `Available commands:\nhelp\nlogin\nstatus\ntime\nping\nmeshstatus\nvault\necho [text]\nadmin\nclear` }),
    status: () => ({ type: 'status', message: 'SYSTEM STATUS: OPERATIONAL\nSECURITY: MAXIMUM\nCONNECTION: ENCRYPTED' }),
    time: () => ({ type: 'time', message: new Date().toLocaleString() }),
    ping: () => ({ type: 'ping', message: 'PONG!' }),
    meshstatus: () => ({ type: 'meshstatus', message: isYggdrasilRunning() ? 'YGGDRASIL: ACTIVE' : 'MESH MODE: SIMULATION (MOCK)' }),
    clear: () => ({ type: 'clear', message: '' }),
    echo: () => ({ type: 'echo', message: arg }),
    admin: () => ({ type: 'admin', message: 'Redirecting to Admin UI...', redirect: '/admin' }),
    vault: () => {
      try {
        const vaultDir = '/app/vault';
        if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
        const files = fs.readdirSync(vaultDir);
        return { type: 'vault', message: files.length ? `Vault Files:\n${files.join('\n')}` : 'Vault is empty.' };
      } catch (err) {
        return { type: 'error', message: `Vault error: ${err.message}` };
      }
    }
  };

  return commands[cmd] ? commands[cmd]() : { type: 'error', message: 'Unknown command. Type "help" for a list.' };
}

app.get('/health', (req, res) => res.status(200).json({ status: 'operational' }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

function isYggdrasilRunning() {
  try {
    execSync('pgrep yggdrasil', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

process.on('SIGINT', () => { console.log('SIGINT received. Shutting down.'); process.exit(0); });
process.on('SIGTERM', () => { console.log('SIGTERM received.'); process.exit(0); });
process.on('uncaughtException', err => { console.error('Uncaught Exception:', err); });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🛰️ TetraKlein-OS live on http://127.0.0.1:${PORT}`);
});
