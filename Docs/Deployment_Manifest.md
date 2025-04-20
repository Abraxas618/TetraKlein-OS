# TetraKlein OS Deployment Manual

## Prerequisites
- Node.js v16 or higher
- npm (comes with Node.js)
- Git
- A modern web browser (Chrome, Firefox, Edge, or Safari)

## Step-by-Step Deployment Guide

### Windows Deployment

1. **Install Node.js**
```powershell
# Download and install from https://nodejs.org/
# Verify installation
node --version
npm --version
```

2. **Clone and Setup**
```powershell
# Create directory
mkdir C:\TetraKlein-OS
cd C:\TetraKlein-OS

# Clone repository
git clone [your-repo-url] .

# Enter terminal directory
cd tetraklein_terminal

# Install dependencies
npm install
```

3. **Start Server**
```powershell
# Start the server
node server.js
```

4. **Access Terminal**
- Open browser: `https://127.0.0.1:8080`
- Accept security certificate warning
- Type `login` to begin

### Linux Deployment

1. **Install Node.js**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install node
nvm use node

# Verify installation
node --version
npm --version
```

2. **Clone and Setup**
```bash
# Create directory
mkdir ~/TetraKlein-OS
cd ~/TetraKlein-OS

# Clone repository
git clone [your-repo-url] .

# Enter terminal directory
cd tetraklein_terminal

# Install dependencies
npm install
```

3. **Start Server**
```bash
# Make server executable
chmod +x server.js

# Start the server
node server.js
```

4. **Access Terminal**
- Open browser: `https://127.0.0.1:8080`
- Accept security certificate warning
- Type `login` to begin

### macOS Deployment

1. **Install Node.js**
```bash
# Using Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node

# Verify installation
node --version
npm --version
```

2. **Clone and Setup**
```bash
# Create directory
mkdir ~/TetraKlein-OS
cd ~/TetraKlein-OS

# Clone repository
git clone [your-repo-url] .

# Enter terminal directory
cd tetraklein_terminal

# Install dependencies
npm install
```

3. **Start Server**
```bash
# Make server executable
chmod +x server.js

# Start the server
node server.js
```

4. **Access Terminal**
- Open browser: `https://127.0.0.1:8080`
- Accept security certificate warning
- Type `login` to begin

## Verification Steps (All OS)

1. **Test Server**
```bash
# You should see:
TetraKlein OS running on https://127.0.0.1:8080
```

2. **Test Terminal Commands**
```
login     # Create account
help      # View commands
status    # Check system
clear     # Clear screen
```

## Troubleshooting Guide

### Common Issues

1. **Port Already in Use**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID [PID] /F

# Linux/macOS
lsof -i :8080
kill -9 [PID]
```

2. **Node Modules Issues**
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall modules
rm -rf node_modules
npm install
```

3. **Certificate Warnings**
- This is normal with self-signed certificates
- Click "Advanced" → "Proceed anyway"
- For production, use proper SSL certificates

### Security Notes

1. **Password Requirements**
- Minimum 8 characters
- Store securely
- Never share credentials

2. **Network Security**
- Server runs on localhost only
- Uses HTTPS with TLS 1.3
- WebSocket connections are encrypted

## Production Deployment

For production environments, additional steps are recommended:

1. **Use Process Manager**
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name tetraklein

# Enable startup
pm2 startup
pm2 save
```

2. **Configure Firewall**
```bash
# Windows (PowerShell as Admin)
New-NetFirewallRule -DisplayName "TetraKlein" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow

# Linux (UFW)
sudo ufw allow 8080/tcp

# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp node
```

## Maintenance

1. **Regular Updates**
```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit
```

2. **Backup Data**
```bash
# Backup configuration
cp -r config/ config_backup/

# Backup logs
cp -r logs/ logs_backup/
```

## Support

If you encounter any issues:
1. Check the logs in `tetraklein_terminal/logs/`
2. Verify all prerequisites are installed
3. Ensure proper permissions are set
4. Check firewall settings

This manual has been tested on:
- Windows 10/11
- Ubuntu 20.04+
- macOS Monterey+ 
