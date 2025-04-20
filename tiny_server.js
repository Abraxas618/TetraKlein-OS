const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const { execSync, exec } = require('child_process');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Virtual file system for Cold War terminal
const virtualFileSystem = {
  // User is initially in home directory
  currentDirectory: '/home/fieldcommander',
  currentUser: 'fieldcommander',
  loggedIn: false,
  
  // Directory structure
  directories: {
    '/': ['home', 'vault', 'ops', 'etc', 'bin', 'usr'],
    '/home': ['fieldcommander', 'agentzero', 'shadowhawk'],
    '/home/fieldcommander': ['LOGIN_RECORD.txt', 'personal', 'mission_logs'],
    '/home/agentzero': ['LOCKED_ACCESS_ONLY.txt'],
    '/home/shadowhawk': ['LOCKED_ACCESS_ONLY.txt'],
    '/vault': ['ProjectPegasus_Report.txt', 'MontaukChairOpsManual.txt', 'PhiladelphiaExperiment_IncidentReport.txt', 'QuantumMesh_NetworkPrototype.txt', 'SovereignVoting_Directive.txt', 'TemporalDisplacement_Tests1979.txt'],
    '/ops': ['valkyrie', 'eclipse', 'tesseract'],
    '/ops/valkyrie': ['MISSION_BRIEF.txt', 'intel', 'resources', 'comms'],
    '/ops/eclipse': ['OPERATION_SUMMARY.txt', 'assets', 'intel', 'personnel'],
    '/ops/tesseract': ['PROJECT_SUMMARY.txt', 'research', 'timelines', 'security'],
    '/etc': ['config', 'security', 'yggdrasil'],
    '/usr': ['bin', 'lib', 'share'],
    '/bin': ['login', 'logout', 'dir', 'cat', 'cd', 'whoami', 'help', 'clear']
  },

  // File contents cache to avoid reading from disk each time
  fileContents: {},

  // Load file from disk if exists, otherwise return placeholder
  getFileContent: function(filePath) {
    // Check if content is already cached
    if (this.fileContents[filePath]) {
      return this.fileContents[filePath];
    }

    // Convert virtual path to real file path
    const realPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    try {
      // Try to read from the actual file system
      if (fs.existsSync(realPath)) {
        const content = fs.readFileSync(realPath, 'utf8');
        this.fileContents[filePath] = content;
        return content;
      }
    } catch (error) {
      console.error(`Error reading file ${realPath}:`, error);
    }

    // For files that don't exist physically, return a placeholder
    return `CLASSIFIED DOCUMENT: ${path.basename(filePath)}\nACCESS DENIED: CLEARANCE LEVEL INSUFFICIENT`;
  },

  // Navigate directories
  changeDirectory: function(targetDir) {
    // Handle absolute path
    let newDir = targetDir;
    
    if (!targetDir.startsWith('/')) {
      // Handle relative path
      if (targetDir === '..') {
        // Go up one directory
        const parts = this.currentDirectory.split('/');
        parts.pop();
        newDir = parts.join('/') || '/';
      } else if (targetDir === '.') {
        // Stay in current directory
        newDir = this.currentDirectory;
      } else {
        // Go to subdirectory
        newDir = path.join(this.currentDirectory, targetDir);
      }
    }

    // Check if directory exists
    const dirParts = newDir.split('/').filter(Boolean);
    let checkPath = '';
    
    for (const part of dirParts) {
      checkPath = checkPath ? `${checkPath}/${part}` : `/${part}`;
      if (!this.directories[checkPath] && !this.directories[checkPath.toLowerCase()]) {
        return { success: false, message: `Directory not found: ${newDir}` };
      }
    }

    this.currentDirectory = newDir;
    return { success: true, message: `Changed directory to ${newDir}` };
  },
  
  // List directory contents
  listDirectory: function(targetDir = null) {
    const dir = targetDir || this.currentDirectory;
    const items = this.directories[dir] || this.directories[dir.toLowerCase()] || [];
    
    const output = [
      `Directory of ${dir}`,
      '------------------------'
    ];
    
    // Add parent directory if not root
    if (dir !== '/') {
      output.push('..  [Directory]');
    }
    
    // Add files and directories
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const isDirectory = this.directories[fullPath] || this.directories[fullPath.toLowerCase()];
      output.push(`${item}  ${isDirectory ? '[Directory]' : '[File]'}`);
    });
    
    return output.join('\n');
  },
  
  // Read file contents
  readFile: function(filename) {
    // Convert to absolute path if needed
    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = path.join(this.currentDirectory, filename);
    }
    
    // Check if path exists by navigating through directories
    const dirPath = path.dirname(filePath);
    const dirParts = dirPath.split('/').filter(Boolean);
    let checkPath = '';
    
    for (const part of dirParts) {
      checkPath = checkPath ? `${checkPath}/${part}` : `/${part}`;
      if (!this.directories[checkPath] && !this.directories[checkPath.toLowerCase()]) {
        return `Error: Path not found: ${dirPath}`;
      }
    }
    
    // Check if file exists in current directory
    const baseName = path.basename(filePath);
    const parentDir = path.dirname(filePath);
    const dirContents = this.directories[parentDir] || this.directories[parentDir.toLowerCase()] || [];
    
    if (!dirContents.includes(baseName) && !dirContents.map(f => f.toLowerCase()).includes(baseName.toLowerCase())) {
      return `Error: File not found: ${filename}`;
    }
    
    // Get file content
    return this.getFileContent(filePath);
  }
};

// Security error page HTML
const securityErrorPage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TetraKlein-OS Access Denied</title>
    <style>
        body {
            background: #000;
            color: #f00;
            font-family: monospace;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }
        .terminal {
            width: 800px;
            border: 2px solid #f00;
            box-shadow: 0 0 10px #f00;
            padding: 20px;
            position: relative;
            text-align: center;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            margin-bottom: 20px;
        }
        .blink {
            animation: blink 1s step-end infinite;
        }
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="terminal">
        <h1>ACCESS DENIED</h1>
        <p>SECURITY VIOLATION DETECTED</p>
        <p>LOCALHOST CONNECTIONS ONLY</p>
        <p class="blink">INCIDENT LOGGED</p>
    </div>
</body>
</html>
`;

// Apply security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    }
  }
}));

// Enable compression
app.use(compression());

// Only allow localhost connections
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip !== '127.0.0.1' && ip !== '::1' && ip !== '::ffff:127.0.0.1') {
    console.error(`Connection attempt from unauthorized IP: ${ip}`);
    return res.status(403).contentType('text/html').send(securityErrorPage);
  }
  next();
});

// Prevent directory listing and path traversal
app.use((req, res, next) => {
  const sanitizedPath = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
  if (sanitizedPath !== req.path) {
    console.error(`Path traversal attempt: ${req.path}`);
    return res.status(403).contentType('text/html').send(securityErrorPage);
  }
  next();
});

// Error handler for 404 errors
app.use((req, res, next) => {
  const isApi = req.path.startsWith('/command') || req.path.startsWith('/health');
  if (!isApi && req.method === 'GET' && !req.path.startsWith('/public')) {
    const knownPaths = ['/', '/admin', '/health'];
    if (!knownPaths.includes(req.path) && !req.path.startsWith('/public/')) {
      return res.status(404).contentType('text/html').send(securityErrorPage);
    }
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files with restricted options
app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'deny',
  index: false,
  etag: false,
  lastModified: false
}));

// Home route - CRT Terminal UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin route - Top Secret Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'operational' });
});

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
    console.error(`Command error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Check if Yggdrasil is running
function isYggdrasilRunning() {
  try {
    // Try different methods to check for Yggdrasil
    try {
      execSync('pgrep yggdrasil || echo "INACTIVE"', { stdio: 'ignore' });
      return true;
    } catch (e) {
      try {
        const output = execSync('ps aux | grep -v grep | grep yggdrasil', { encoding: 'utf8' });
        return output && output.includes('yggdrasil');
      } catch (e2) {
        return false;
      }
    }
  } catch (error) {
    return false;
  }
}

// Command processor
function processCommand(command) {
  // Split command into parts
  const parts = command.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');
  
  // Special handling for file system commands
  if (cmd === 'dir' || cmd === 'ls') {
    return {
      type: 'dir',
      message: virtualFileSystem.listDirectory()
    };
  }
  
  if (cmd === 'cd') {
    if (!args) {
      return {
        type: 'error',
        message: 'Usage: cd <directory>'
      };
    }
    
    const result = virtualFileSystem.changeDirectory(args);
    return {
      type: result.success ? 'cd' : 'error',
      message: result.message
    };
  }
  
  if (cmd === 'cat' || cmd === 'type') {
    if (!args) {
      return {
        type: 'error',
        message: 'Usage: cat <filename>'
      };
    }
    
    return {
      type: 'cat',
      message: virtualFileSystem.readFile(args)
    };
  }
  
  if (cmd === 'whoami') {
    return {
      type: 'whoami',
      message: virtualFileSystem.loggedIn ? 
        `User: ${virtualFileSystem.currentUser}\nClearance: COSMIC\nAccess Level: TOP SECRET` :
        'Not logged in.'
    };
  }
  
  if (cmd === 'pwd' || cmd === 'cwd') {
    return {
      type: 'pwd',
      message: `Current directory: ${virtualFileSystem.currentDirectory}`
    };
  }
  
  if (cmd === 'login') {
    virtualFileSystem.loggedIn = true;
    return {
      type: 'login',
      message: 'LOGIN SUCCESSFUL\nWelcome, FIELD COMMANDER.\nClearance Level: COSMIC\nAccess: GRANTED\n\nTERM-2271 SECURE TERMINAL READY.'
    };
  }
  
  if (cmd === 'logout') {
    virtualFileSystem.loggedIn = false;
    return {
      type: 'logout',
      message: 'LOGOUT SUCCESSFUL\nTerminal secured.'
    };
  }

  // Standard commands
  const commands = {
    'help': () => {
      return {
        type: 'help',
        message: `Available commands:
- help: Show this help message
- login: Start login sequence
- logout: End current session
- dir/ls: List directory contents
- cd <dir>: Change directory
- cat/type <file>: View file contents
- whoami: Display current user
- pwd/cwd: Show current directory
- status: Show system status
- clear: Clear terminal
- meshstatus: Show mesh network status
- admin: Access admin dashboard
- time: Show current time
- vault: List vault contents
- ping: Check connection status
- echo [text]: Echo text back to terminal`
      };
    },
    'status': () => {
      return {
        type: 'status',
        message: 'SYSTEM STATUS: OPERATIONAL\nSECURITY: MAXIMUM\nCONNECTION: SECURE'
      };
    },
    'clear': () => {
      return {
        type: 'clear',
        message: ''
      };
    },
    'ping': () => {
      return {
        type: 'ping',
        message: 'PONG! Connection active.'
      };
    },
    'meshstatus': () => {
      // Try to check Yggdrasil status using multiple methods
      const active = isYggdrasilRunning();
      const status = active ? 
        'ACTIVE\nENCRYPTION: ENABLED' : 
        'INACTIVE (MOCK MODE)\nENCRYPTION: SIMULATED';
        
      return {
        type: 'meshstatus',
        message: `MESH NETWORK STATUS: ${status}`
      };
    },
    'admin': () => {
      return {
        type: 'admin',
        message: 'Redirecting to admin dashboard...',
        redirect: '/admin'
      };
    },
    'time': () => {
      // Return time in Cold War era format (1983)
      const now = new Date();
      return {
        type: 'time',
        message: `Current time: ${now.toLocaleTimeString()}\nCurrent date: 1983-04-15`
      };
    },
    'echo': (args) => {
      return {
        type: 'echo',
        message: args
      };
    },
    'vault': () => {
      try {
        const vaultPath = '/app/vault';
        // Create vault directory if it doesn't exist
        if (!fs.existsSync(vaultPath)) {
          fs.mkdirSync(vaultPath, { recursive: true });
        }
        const files = fs.readdirSync(vaultPath);
        return {
          type: 'vault',
          message: files.length ? `Vault contents:\n${files.join('\n')}` : 'Vault is empty'
        };
      } catch (error) {
        console.error(`Vault access error: ${error.message}`);
        return {
          type: 'error',
          message: `Vault access error: ${error.message}`
        };
      }
    }
  };

  // Handle special case for echo
  if (cmd === 'echo') {
    return commands.echo(args);
  }

  if (cmd in commands) {
    return commands[cmd]();
  }
  
  return {
    type: 'error',
    message: 'Command not recognized. Type "help" for available commands.'
  };
}

// Handle server startup with port fallback
function startServer(port) {
  try {
    return app.listen(port, '0.0.0.0', () => {
      console.log(`TetraKlein-OS Field Terminal running on http://127.0.0.1:${port}`);
      console.log('COLD WAR FIELD DEPLOYMENT ACTIVE');
    });
  } catch (error) {
    console.error(`Error starting server on port ${port}: ${error.message}`);
    if (port === PORT) {
      console.log('Attempting fallback to alternative port...');
      // Try an alternative port if the primary one fails
      return startServer(3000);
    }
    throw error;
  }
}

// Handle termination signals gracefully
process.on('SIGINT', () => {
  console.log('Shutting down TetraKlein-OS Field Terminal...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutdown signal received. Terminating...');
  process.exit(0);
});

// Global error handler to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('CRITICAL ERROR:', error);
  console.log('TetraKlein-OS Field Terminal is still running');
});

// Initialize the file system by reading real files where available
function initializeFileSystem() {
  // Check and create directories if they don't exist
  ['vault', 'ops', 'ops/valkyrie', 'ops/eclipse', 'ops/tesseract', 'home', 'home/fieldcommander'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
  
  console.log('Virtual file system initialized');
}

// Log startup information
console.log('Starting TetraKlein-OS Field Terminal...');
console.log(`Node.js version: ${process.version}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Yggdrasil status: ${isYggdrasilRunning() ? 'Running' : 'Mock Mode'}`);

// Initialize file system
initializeFileSystem();

// Start server with port fallback
const server = startServer(PORT); 