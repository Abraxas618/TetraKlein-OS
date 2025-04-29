#!/bin/bash
set -e

echo "🛰️  TetraKlein-OS Field Terminal Deployment"
echo "=========================================="
echo "COLD WAR FIELD DEPLOYMENT SCENARIO"
echo

# Detect OS
OS="$(uname -s)"
CONTAINER_ENGINE=""

# Detect container engine
check_container_engine() {
    if command -v podman &> /dev/null; then
        CONTAINER_ENGINE="podman"
        echo "✅ Using Podman as container engine"
    elif command -v docker &> /dev/null; then
        CONTAINER_ENGINE="docker"
        echo "✅ Using Docker as container engine (fallback)"
    else
        echo "❌ ERROR: Neither Podman nor Docker found."
        exit 1
    fi
}

# Purge any old container
purge_old_container() {
    if $CONTAINER_ENGINE ps -a --format '{{.Names}}' | grep -q '^tetraklein-os$'; then
        echo "⚡ Removing existing container tetraklein-os..."
        $CONTAINER_ENGINE rm -f tetraklein-os
    fi
}

# Check if port 8080 is available
check_port_8080() {
    echo "🔍 Checking if port 8080 is available..."
    if [ "$OS" = "Linux" ] || [ "$OS" = "Darwin" ]; then
        if lsof -i :8080 &> /dev/null; then
            echo "❌ ERROR: Port 8080 is already in use. Please free it before deployment."
            exit 1
        fi
    elif [[ "$OS" == *"MINGW"* ]] || [[ "$OS" == *"MSYS"* ]] || [[ "$OS" == "CYGWIN"* ]]; then
        netstat -ano | grep -q ":8080 " && {
            echo "❌ ERROR: Port 8080 is already in use. Please free it before deployment."
            exit 1
        }
    fi
}

# Prepare environment
prepare_environment() {
    mkdir -p vault
    chmod 777 vault
    mkdir -p tetraklein_archive
}

# Create archive snapshot
create_archive() {
    echo "⚡ Building TetraKlein-OS archive..."
    if [ "$OS" = "Linux" ] || [ "$OS" = "Darwin" ]; then
        tar -czf tetraklein_archive/tetraklein-os.tar.gz \
            Containerfile deploy.sh tiny_server.js public vault README.md .dockerignore
    else
        if command -v powershell &> /dev/null; then
            powershell -Command "Compress-Archive -Path Containerfile,deploy.sh,tiny_server.js,public,vault,README.md,.dockerignore -DestinationPath tetraklein_archive/tetraklein-os.zip -Force"
        else
            echo "⚠️ Warning: Could not create archive (powershell not available)"
        fi
    fi
}

# Build container image
build_container() {
    echo "⚡ Building TetraKlein-OS Field Terminal container..."
    $CONTAINER_ENGINE build -t tetraklein-os .
}

# Run container
run_container() {
    echo "⚡ Launching TetraKlein-OS Field Terminal on port 8080..."

    SHARED_FLAG="Z"
    if [ "$CONTAINER_ENGINE" = "docker" ]; then
        SHARED_FLAG=""
    fi

    $CONTAINER_ENGINE run -d \
        --name tetraklein-os \
        --rm \
        -p 127.0.0.1:8080:8080 \
        -v "$(pwd)/vault:/app/vault:$SHARED_FLAG" \
        tetraklein-os

    sleep 2

    if $CONTAINER_ENGINE ps | grep -q tetraklein-os; then
        echo
        echo "✅ TetraKlein-OS Field Terminal deployed successfully."
        echo "Access via: http://127.0.0.1:8080"
        echo "Admin access: http://127.0.0.1:8080/admin"
        echo
        echo "CLASSIFIED: DESTROY AFTER MISSION COMPLETE"
        echo "Container will self-destroy when stopped."
    else
        echo "❌ ERROR: Container failed to start. Checking logs:"
        $CONTAINER_ENGINE logs tetraklein-os
        exit 1
    fi
}

# MAIN EXECUTION
check_container_engine
purge_old_container
check_port_8080
prepare_environment
create_archive
build_container
run_container
