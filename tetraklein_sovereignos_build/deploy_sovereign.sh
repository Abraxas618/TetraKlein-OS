#!/bin/bash
podman stop sovereign-os 2>/dev/null
podman rm sovereign-os 2>/dev/null
podman run -d --name sovereign-os --tmpfs /ramdisk -p 127.0.0.1:8080:80 --read-only --cap-drop=ALL --security-opt no-new-privileges localhost/sovereign-os
echo "🚀 Sovereign OS now active at: https://127.0.0.1:8080"
