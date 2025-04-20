#!/bin/bash
set -e

echo "🛰️ Deploying TetraKlein Terminal Interface"
echo "----------------------------------------"

# Build container
echo "⚡ Building terminal container..."
podman build -t tetraklein-terminal .

# Run container
echo "⚡ Launching terminal interface..."
podman run -d \
    --name tetraklein-terminal \
    -p 127.0.0.1:8080:8080 \
    tetraklein-terminal

echo "✅ TetraKlein Terminal Interface deployed."
echo "Access via: http://127.0.0.1:8080" 