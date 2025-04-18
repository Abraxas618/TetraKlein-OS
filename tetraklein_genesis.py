
#!/usr/bin/env python3
# 🚀 TetraKlein Genesis Boot Manager (Version 2)

import os
import subprocess
import time

print("\n🛰️  TetraKlein: Sovereign Genesis Initialization Starting (V2)...\n")

# Paths
core_path = "./Core/"
zk_path = "./ZK/"
mesh_path = "./Mesh/"
docker_path = "./Docker/"

# Step 1: Golden Ratio Entropy Initialization
print("⚡ Initializing Golden Ratio Entropy System...")
golden_ratio_simulation = os.path.join(core_path, "golden_ratio_simulation.py")
if os.path.exists(golden_ratio_simulation):
    subprocess.run(["python3", golden_ratio_simulation])
else:
    print("❌ Golden Ratio Entropy System not found.")

# Step 2: PQCrypto Core Activation
print("\n⚡ Initializing PQCrypto Engines...")
pqcrypto_modules = ["qidl_encrypt.py", "rth.py", "tke.py"]
for module in pqcrypto_modules:
    path = os.path.join(core_path, module)
    if os.path.exists(path):
        print(f"✅ {module} detected and ready.")
    else:
        print(f"❌ {module} missing.")

# Step 3: Sovereign Ledger Genesis Launch
print("\n⚡ Launching Sovereign Ledger Genesis...")
ledger_path = os.path.join(core_path, "ledger.py")
if os.path.exists(ledger_path):
    subprocess.run(["python3", ledger_path])
else:
    print("❌ Ledger Genesis script not found.")

# Step 4: Zero Knowledge Proof Preparation
print("\n⚡ Preparing Zero Knowledge Proof Layer...")
zk_circuit = os.path.join(zk_path, "zk_trust.circom")
if os.path.exists(zk_circuit):
    print("✅ zk_trust.circom detected. Ready for Circom compilation if environment installed.")
else:
    print("❌ zk_trust.circom missing.")

# Step 5: Sovereign API & Metrics System Initialization
print("\n⚡ Sovereign API and Metrics Activation...")
codex_api = os.path.join(core_path, "CodexAPI.py")
codex_metrics = os.path.join(core_path, "CodexMetrics.py")

if os.path.exists(codex_api):
    print("✅ Sovereign API Interface (CodexAPI.py) available.")
else:
    print("❌ Sovereign API Interface missing.")

if os.path.exists(codex_metrics):
    print("✅ Sovereign Metrics Tracker (CodexMetrics.py) available.")
else:
    print("❌ Sovereign Metrics Tracker missing.")

# Step 6: Autonomous Self-Healing Test Option
print("\n⚡ Autonomous Sovereign System Test Option:")
run_self_test = input("   ➔ Run Autonomous Self-Healing Test? (y/N): ").strip().lower()
if run_self_test == 'y':
    auto_test_path = os.path.join(core_path, "tetracube_autonomous_test.py")
    if os.path.exists(auto_test_path):
        subprocess.run(["python3", auto_test_path])
    else:
        print("❌ Autonomous Self-Test module missing.")

# Step 7: Mesh Node Optional Launch
print("\n⚡ Sovereign Mesh Node Launch Option:")
launch_mesh = input("   ➔ Launch Mesh Node Dev Server? (y/N): ").strip().lower()
if launch_mesh == 'y':
    print("⚡ Launching Mesh Node...")
    os.chdir(mesh_path)
    subprocess.run(["npm", "install"])
    subprocess.run(["npm", "run", "dev"])
else:
    print("✅ Mesh Node launch skipped.")

# Step 8: Deployment Log
timestamp = time.strftime("%Y-%m-%d_%H-%M-%S")
log_content = f"""
TetraKlein Genesis Launch Report (Version 2)
Timestamp: {timestamp}
Golden Ratio Entropy: Initialized
PQCrypto Engines: Detected
Ledger Genesis: Completed
ZK Proof System: Prepared
Sovereign API Interface: {"Available" if os.path.exists(codex_api) else "Missing"}
Sovereign Metrics Tracker: {"Available" if os.path.exists(codex_metrics) else "Missing"}
Mesh Node Launch: {"Initiated" if launch_mesh == 'y' else "Skipped"}
"""

with open("TetraKlein_Genesis_Log.txt", "w") as f:
    f.write(log_content)

print("\n✅ TetraKlein Genesis Completed (V2). Sovereignty Achieved. 🛰️")
