#!/bin/bash
set -e

echo "🛰️  TetraKlein-OS Field Terminal Deployment"
echo "=========================================="
echo "COLD WAR FIELD DEPLOYMENT SCENARIO"
echo

OS="$(uname -s)"
CONTAINER_ENGINE=""

check_container_engine() {
    if command -v podman &> /dev/null; then
        CONTAINER_ENGINE="podman"
        echo "✅ Using Podman"
    elif command -v docker &> /dev/null; then
        CONTAINER_ENGINE="docker"
        echo "✅ Using Docker (fallback)"
    else
        echo "❌ ERROR: No container engine found."
        exit 1
    fi
}

purge_old_container() {
    if $CONTAINER_ENGINE ps -a --format '{{.Names}}' | grep -q '^tetraklein-os$'; then
        echo "⚡ Removing old container..."
        $CONTAINER_ENGINE rm -f tetraklein-os
    fi
}

check_port_8080() {
    echo "🔍 Checking if port 8080 is free..."

    if command -v lsof &>/dev/null; then
        if lsof -i :8080 &>/dev/null; then
            echo "❌ Port 8080 is in use. Please free it or stop the service."
            exit 1
        else
            echo "✅ Port 8080 is available"
        fi
    else
        echo "⚠️ lsof not found. Skipping port check. Please make sure port 8080 is free manually."
    fi
}

prepare_environment() {
    mkdir -p vault
    chmod 777 vault
    mkdir -p tetraklein_archive
}

create_archive() {
    echo "📦 Creating archive snapshot..."
    if [[ "$OS" == "Linux" || "$OS" == "Darwin" ]]; then
        tar -czf tetraklein_archive/tetraklein-os.tar.gz \
            Containerfile deploy.sh tiny_server.js tetraklein_terminal/public vault README.md .dockerignore
    else
        if command -v powershell &> /dev/null; then
            powershell -Command "Compress-Archive -Path Containerfile,deploy.sh,tiny_server.js,tetraklein_terminal/public,vault,README.md,.dockerignore -DestinationPath tetraklein_archive/tetraklein-os.zip -Force"
        else
            echo "⚠️ Could not archive (PowerShell not found)"
        fi
    fi
}

build_container() {
    echo "⚡ Building container..."
    $CONTAINER_ENGINE build -t tetraklein-os .
}

run_container() {
    echo "🚀 Launching TetraKlein-OS on port 8080..."

    SHARED_FLAG="Z"
    [ "$CONTAINER_ENGINE" = "docker" ] && SHARED_FLAG=""

    $CONTAINER_ENGINE run -d \
        --name tetraklein-os \
        --rm \
        -p 127.0.0.1:8080:8080 \
        -v "$(pwd)/vault:/app/vault:$SHARED_FLAG" \
        tetraklein-os

    sleep 2

    if $CONTAINER_ENGINE ps | grep -q tetraklein-os; then
        echo "✅ Deployment successful"
        echo "GUI: http://127.0.0.1:8080"
        echo "Admin: http://127.0.0.1:8080/admin"
        echo "CLASSIFIED: TERMINAL WILL SELF-DESTRUCT WHEN STOPPED"
    else
        echo "❌ Deployment failed"
        $CONTAINER_ENGINE logs tetraklein-os
        exit 1
    fi
}

check_container_engine
purge_old_container
check_port_8080
prepare_environment
create_archive
build_container
run_container
