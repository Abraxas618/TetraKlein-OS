# TetraKlein-OS Field Terminal Deployment PowerShell script
# For Windows platforms

# Display banner
Write-Host "`n🛰️  TetraKlein-OS Field Terminal Deployment" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "COLD WAR FIELD DEPLOYMENT SCENARIO`n" -ForegroundColor Red

# Check for container engines
function Check-ContainerEngine {
    $containerEngine = $null
    
    if (Get-Command "podman" -ErrorAction SilentlyContinue) {
        $containerEngine = "podman"
        Write-Host "✅ Using Podman as container engine" -ForegroundColor Green
    }
    elseif (Get-Command "docker" -ErrorAction SilentlyContinue) {
        $containerEngine = "docker"
        Write-Host "✅ Using Docker as container engine (fallback)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ ERROR: Neither Podman nor Docker found. Please install one of them first." -ForegroundColor Red
        exit 1
    }
    
    return $containerEngine
}

# Check if a port is available
function Test-PortAvailable {
    param(
        [int]$Port
    )
    
    $inUse = $false
    $connections = netstat -ano | Select-String ":$Port "
    
    if ($connections) {
        $inUse = $true
    }
    
    return -not $inUse
}

# Create required directories
function Prepare-Environment {
    # Create vault directory with proper permissions
    if (-not (Test-Path "vault")) {
        New-Item -Path "vault" -ItemType Directory | Out-Null
    }
    
    # Create archive directory
    if (-not (Test-Path "tetraklein_archive")) {
        New-Item -Path "tetraklein_archive" -ItemType Directory | Out-Null
    }
}

# Build container image
function Build-Container {
    param(
        [string]$ContainerEngine
    )
    
    Write-Host "`n⚡ Building TetraKlein-OS Field Terminal container..." -ForegroundColor Cyan
    & $ContainerEngine build -t tetraklein-os .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Container build failed" -ForegroundColor Red
        exit 1
    }
}

# Run container with appropriate parameters
function Run-Container {
    param(
        [string]$ContainerEngine
    )
    
    $primaryPort = 8080
    $fallbackPort = 3000
    $portToUse = $primaryPort
    
    # Check if primary port is available
    if (-not (Test-PortAvailable -Port $primaryPort)) {
        Write-Host "⚠️ Port $primaryPort is already in use, trying alternate port" -ForegroundColor Yellow
        $portToUse = $fallbackPort
        
        # Check if fallback port is available
        if (-not (Test-PortAvailable -Port $fallbackPort)) {
            Write-Host "❌ ERROR: Both ports $primaryPort and $fallbackPort are in use. Please free one of them." -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "⚡ Launching TetraKlein-OS Field Terminal on port $portToUse..." -ForegroundColor Cyan
    
    # Set proper path for volume mounting
    $vaultPath = (Get-Item -Path ".\vault").FullName.Replace('\', '/')
    
    if ($ContainerEngine -eq "podman") {
        & $ContainerEngine run -d --name tetraklein-os --rm -p "127.0.0.1:${portToUse}:8080" -v "${vaultPath}:/app/vault:Z" tetraklein-os
    }
    else {
        # Docker syntax
        & $ContainerEngine run -d --name tetraklein-os --rm -p "127.0.0.1:${portToUse}:8080" -v "${vaultPath}:/app/vault" tetraklein-os
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Container failed to start" -ForegroundColor Red
        & $ContainerEngine logs tetraklein-os
        exit 1
    }
    
    # Wait for container to start
    Start-Sleep -Seconds 2
    
    # Check if container is running
    $containerRunning = & $ContainerEngine ps | Select-String "tetraklein-os"
    
    if ($containerRunning) {
        Write-Host "`n✅ TetraKlein-OS Field Terminal deployed successfully." -ForegroundColor Green
        Write-Host "Access via: http://127.0.0.1:$portToUse" -ForegroundColor Cyan
        Write-Host "Admin access: http://127.0.0.1:$portToUse/admin" -ForegroundColor Cyan
        Write-Host "`nCLASSIFIED: DESTROY AFTER MISSION COMPLETE" -ForegroundColor Red
        Write-Host "Container will self-destroy when stopped." -ForegroundColor Yellow
        
        # Attempt to open the browser
        Start-Process "http://127.0.0.1:$portToUse"
    }
    else {
        Write-Host "❌ ERROR: Container failed to start. Checking logs:" -ForegroundColor Red
        & $ContainerEngine logs tetraklein-os
        exit 1
    }
}

# Create deployment archive
function Create-Archive {
    Write-Host "⚡ Building TetraKlein-OS archive..." -ForegroundColor Cyan
    
    try {
        Compress-Archive -Path Containerfile, deploy.sh, deploy.ps1, tiny_server.js, public, vault, README.md, .dockerignore -DestinationPath tetraklein_archive/tetraklein-os.zip -Force
        Write-Host "✅ Archive created: tetraklein_archive/tetraklein-os.zip" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Warning: Could not create archive. Error: $_" -ForegroundColor Yellow
    }
}

# Main execution
$containerEngine = Check-ContainerEngine
Prepare-Environment
Create-Archive
Build-Container -ContainerEngine $containerEngine
Run-Container -ContainerEngine $containerEngine 