const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const WebSocket = require('ws');

const app = express();
const PORT = 8080;

// Session state
const userState = {};

// Trust localhost variants
const trustedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1', '10.0.2.100'];

// Middleware: enforce localhost access only
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!trustedIPs.includes(ip)) {
    return res.status(403).send('ACCESS DENIED');
  }
  next();
});

// Parse JSON
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Commands
app.post('/command', (req, res) => {
  const { command, sessionId = 'default' } = req.body;
  if (!command) return res.status(400).json({ error: 'Command required' });

  let input = command.trim();
  if (!userState[sessionId]) {
    userState[sessionId] = { awaitingPassword: false };
  }

  const state = userState[sessionId];

  // 🔐 Handle LOGIN command first
  if (input.toLowerCase() === 'login') {
    state.awaitingPassword = true;
    return res.json({
      response: {
        type: 'login',
        message: 'NSA-GRADE SECURE LOGIN INITIATED\nEnter new password:'
      }
    });
  }

  // 🔐 Handle PASSWORD entry if awaitingPassword = true
  if (state.awaitingPassword) {
  const accepted = (
    input.length >= 16 &&
    /[a-z]/.test(input) &&
    /[A-Z]/.test(input) &&
    /[0-9]/.test(input) &&
    /[^A-Za-z0-9]/.test(input)
  );

  if (accepted) {
    state.awaitingPassword = false;
  }

  input = ''.padEnd(128, '\0');
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


  // 🧭 ONLY after successful login, process normal commands
  try {
    const output = processCommand(command); // use command (original), not input
    res.json({ response: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function processCommand(input) {
  const [cmd, ...args] = input.trim().split(' ');
  const arg = args.join(' ');

  const commands = {
    help: () => ({ type: 'help', message: `Commands: help, login, status, time, clear, echo [msg]` }),
    status: () => ({ type: 'status', message: 'SYSTEM: OK\nSECURE MODE ACTIVE' }),
    time: () => ({ type: 'time', message: new Date().toLocaleString() }),
    clear: () => ({ type: 'clear', message: '' }),
    echo: () => ({ type: 'echo', message: arg }),
  };

  return commands[cmd] ? commands[cmd]() : { type: 'error', message: 'Unknown command. Type "help".' };
}

// WebSocket Secure Server
const cert = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const server = https.createServer({
  key: cert.privateKey,
  cert: cert.publicKey
}, app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', msg: 'Welcome to TetraKlein Secure Mesh' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🛰️ TetraKlein OS running at https://127.0.0.1:${PORT}`);
});
