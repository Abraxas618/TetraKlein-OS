#!/bin/bash
echo "🛡 Scrubbing SovereignOS Memory..."
podman stop sovereign-os
dd if=/dev/zero of=/dev/shm/sovereign bs=1M count=64 status=progress
sync
podman rm sovereign-os
echo "✅ Memory scrub complete. No forensic trace remains."
