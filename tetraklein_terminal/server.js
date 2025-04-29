const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const WebSocket = require('ws');

const app = express();
const PORT = 8080;

const userState = {}; // session memory

const trustedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1', '10.0.2.100'];

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!trustedIPs.includes(ip)) {
    return res.status(403).send('ACCESS DENIED');
  }
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/command', (req, res) => {
  const { command, sessionId = 'default', isPassword = false } = req.body;
  if (!command) return res.status(400).json({ error: 'Command required' });

  let input = command.trim();
  if (!userState[sessionId]) {
    userState[sessionId] = { awaitingPassword: false, authenticated: false };
  }

  const state = userState[sessionId];

  if (input.toLowerCase() === 'login') {
    state.awaitingPassword = true;
    return res.json({
      response: {
        type: 'login',
        message: 'NSA-GRADE SECURE LOGIN INITIATED\nEnter new password:'
      }
    });
  }

  if (state.awaitingPassword && isPassword) {
    const accepted = (
      input.length >= 16 &&
      /[a-z]/.test(input) &&
      /[A-Z]/.test(input) &&
      /[0-9]/.test(input) &&
      /[^A-Za-z0-9]/.test(input)
    );

    state.awaitingPassword = false;
    state.authenticated = accepted;
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

  if (!state.authenticated) {
    return res.json({
      response: {
        type: 'error',
        message: '⚠️ ACCESS DENIED. Please login first.'
      }
    });
  }

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
    help: () => ({ type: 'help', message: `Commands: help, login, status, time, clear, echo [text]` }),
    status: () => ({ type: 'status', message: 'SYSTEM STATUS: OPERATIONAL\nMODE: SECURE' }),
    time: () => ({ type: 'time', message: new Date().toLocaleString() }),
    clear: () => ({ type: 'clear', message: '' }),
    echo: () => ({ type: 'echo', message: arg }),
  };

  return commands[cmd] ? commands[cmd]() : { type: 'error', message: 'Unknown command. Type "help".' };
}

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
  console.log(`🛰️ TetraKlein OS LIVE at https://127.0.0.1:${PORT}`);
});
