const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const WebSocket = require('ws');

const app = express();
const PORT = 8080;

// Security middleware
app.use((req, res, next) => {
    // Only allow localhost
    if (req.ip !== '127.0.0.1') {
        return res.status(403).send('ACCESS DENIED');
    }
    next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Command endpoint
app.post('/command', (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }
    
    // Process command and return response
    try {
        const response = processCommand(command);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Command processor
function processCommand(command) {
    const commands = {
        'login': () => 'INITIATING SECURE LOGIN SEQUENCE...\nENTER CLEARANCE ID:',
        'help': () => `Available commands:
- help: Show this help message
- login: Start login sequence
- status: Show system status
- clear: Clear terminal
- meshstatus: Show mesh network status`,
        'status': () => 'SYSTEM STATUS: OPERATIONAL\nSECURITY: MAXIMUM\nCONNECTION: SECURE',
        'clear': () => '',
        'meshstatus': () => 'MESH NETWORK STATUS: ACTIVE\nNODES: 3\nENCRYPTION: ENABLED'
    };

    const [cmd] = command.toLowerCase().split(' ');
    if (cmd in commands) {
        return commands[cmd]();
    }
    return 'Command not recognized. Type "help" for available commands.';
}

// Generate self-signed certificate
const cert = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Create HTTPS server
const server = https.createServer({
    key: cert.privateKey,
    cert: cert.publicKey,
    ciphers: 'TLS_AES_256_GCM_SHA384',
    minVersion: 'TLSv1.3'
}, app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);

            switch (data.type) {
                case 'node_connected':
                    // Store client info
                    clients.set(data.nodeId, {
                        ws,
                        publicKey: data.publicKey
                    });
                    // Broadcast new node to all clients
                    broadcast({
                        type: 'node_connected',
                        nodeId: data.nodeId,
                        publicKey: data.publicKey
                    }, ws);
                    break;

                case 'message':
                    // Forward message to recipient
                    const recipient = clients.get(data.receiver);
                    if (recipient) {
                        recipient.ws.send(JSON.stringify(data));
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Remove client and notify others
        for (const [nodeId, client] of clients.entries()) {
            if (client.ws === ws) {
                clients.delete(nodeId);
                broadcast({
                    type: 'node_disconnected',
                    nodeId
                });
                break;
            }
        }
    });
});

function broadcast(data, exclude = null) {
    wss.clients.forEach(client => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Start server
server.listen(PORT, '127.0.0.1', () => {
    console.log(`TetraKlein OS running on https://127.0.0.1:${PORT}`);
}); 