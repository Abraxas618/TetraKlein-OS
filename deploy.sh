#!/bin/bash
set -e

echo "🛰️  TetraKlein-OS Field Terminal Deployment"
echo "=========================================="
echo "COLD WAR FIELD DEPLOYMENT SCENARIO"
echo

# Detect OS for proper commands
OS="$(uname -s)"
CONTAINER_ENGINE=""

# Check for container engines and set the appropriate one
check_container_engine() {
    if command -v podman &> /dev/null; then
        CONTAINER_ENGINE="podman"
        echo "✅ Using Podman as container engine"
        return 0
    elif command -v docker &> /dev/null; then
        CONTAINER_ENGINE="docker"
        echo "✅ Using Docker as container engine (fallback)"
        return 0
    else
        echo "❌ ERROR: Neither Podman nor Docker found. Please install one of them first."
        exit 1
    fi
}

# Check for port availability
check_port() {
    local port=$1
    local available=true
    
    if [ "$OS" = "Linux" ] || [ "$OS" = "Darwin" ]; then
        if command -v nc &> /dev/null; then
            nc -z localhost $port &>/dev/null && available=false
        elif command -v lsof &> /dev/null; then
            lsof -i :$port &>/dev/null && available=false
        fi
    elif [[ "$OS" == *"MINGW"* ]] || [[ "$OS" == *"MSYS"* ]] || [[ "$OS" == "CYGWIN"* ]]; then
        # Windows detection
        netstat -ano | grep -q ":$port " && available=false
    fi
    
    if [ "$available" = false ]; then
        echo "⚠️ Port $port is already in use, will try alternate port"
        return 1
    fi
    
    return 0
}

# Create required directories
prepare_environment() {
    # Create vault directory with proper permissions
    mkdir -p vault
    chmod 777 vault
    
    # Create archive directory
    mkdir -p tetraklein_archive
}

# Build container image
build_container() {
    echo "⚡ Building TetraKlein-OS Field Terminal container..."
    $CONTAINER_ENGINE build -t tetraklein-os .
}

# Run container with appropriate parameters
run_container() {
    local primary_port=8080
    local fallback_port=3000
    local port_to_use=$primary_port
    
    # Check if primary port is available
    if ! check_port $primary_port; then
        port_to_use=$fallback_port
        # Check if fallback port is available
        if ! check_port $fallback_port; then
            echo "❌ ERROR: Both ports $primary_port and $fallback_port are in use. Please free one of them."
            exit 1
        fi
    fi
    
    echo "⚡ Launching TetraKlein-OS Field Terminal on port $port_to_use..."
    
    # Set shared folder flag based on OS
    SHARED_FLAG="Z"
    if [ "$CONTAINER_ENGINE" = "docker" ]; then
        SHARED_FLAG=""
    fi
    
    $CONTAINER_ENGINE run -d \
        --name tetraklein-os \
        --rm \
        -p 127.0.0.1:$port_to_use:8080 \
        -v "$(pwd)/vault:/app/vault:$SHARED_FLAG" \
        tetraklein-os
    
    # Wait for container to start
    sleep 2
    
    # Check if container is running
    if $CONTAINER_ENGINE ps | grep -q tetraklein-os; then
        echo
        echo "✅ TetraKlein-OS Field Terminal deployed successfully."
        echo "Access via: http://127.0.0.1:$port_to_use"
        echo "Admin access: http://127.0.0.1:$port_to_use/admin"
        echo
        echo "CLASSIFIED: DESTROY AFTER MISSION COMPLETE"
        echo "Container will self-destroy when stopped."
    else
        echo "❌ ERROR: Container failed to start. Checking logs:"
        $CONTAINER_ENGINE logs tetraklein-os
        exit 1
    fi
}

# Create deployment archive
create_archive() {
    echo "⚡ Building TetraKlein-OS archive..."
    
    if [ "$OS" = "Linux" ] || [ "$OS" = "Darwin" ]; then
        tar -czf tetraklein_archive/tetraklein-os.tar.gz \
            Containerfile \
            deploy.sh \
            tiny_server.js \
            public \
            vault \
            README.md \
            .dockerignore
    else
        # Windows-compatible archiving (PowerShell)
        if command -v powershell &> /dev/null; then
            powershell -Command "Compress-Archive -Path Containerfile,deploy.sh,tiny_server.js,public,vault,README.md,.dockerignore -DestinationPath tetraklein_archive/tetraklein-os.zip -Force"
        else
            echo "⚠️ Warning: Could not create archive (powershell not available)"
        fi
    fi
}

# Main execution
check_container_engine
prepare_environment
create_archive
build_container
run_container 