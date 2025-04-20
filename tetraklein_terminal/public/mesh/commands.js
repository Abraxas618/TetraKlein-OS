const meshCommands = {
    'mesh': () => {
        const nodeCount = mesh.nodes.size;
        const connectionCount = Array.from(mesh.connections.values())
            .reduce((sum, set) => sum + set.size, 0);
        const connectionStatus = networkManager.isConnected() ? 'CONNECTED' : 'DISCONNECTED';
        return `
Mesh Network Status:
- Total Nodes: ${nodeCount}
- Active Connections: ${connectionCount}
- Network Status: ${connectionStatus}
- Encryption: ENABLED
- Protocol: P2P SECURE
- Node ID: ${networkManager.getNodeId()}
                `;
    },
    'nodes': () => {
        if (!networkManager.isConnected()) {
            return 'ERROR: Not connected to mesh network';
        }
        const nodes = Array.from(mesh.nodes.entries())
            .map(([id, node]) => `${id} (${node.status})`)
            .join('\n');
        return `Connected Nodes:\n${nodes}`;
    },
    'connect': (args) => {
        if (!networkManager.isConnected()) {
            return 'ERROR: Not connected to mesh network';
        }
        const nodeId = args[0];
        if (!nodeId) return 'ERROR: Node ID required';
        
        mesh.connectNodes('local', nodeId);
        return `Connected to node ${nodeId}`;
    },
    'chat': (args) => {
        if (!networkManager.isConnected()) {
            return 'ERROR: Not connected to mesh network';
        }
        const [nodeId, ...messageParts] = args;
        if (!nodeId || messageParts.length === 0) {
            return 'ERROR: Node ID and message required';
        }
        
        const message = messageParts.join(' ');
        networkManager.sendMessage(nodeId, message);
        return `Message sent to ${nodeId}`;
    },
    'history': (args) => {
        if (!networkManager.isConnected()) {
            return 'ERROR: Not connected to mesh network';
        }
        const nodeId = args[0];
        if (!nodeId) return 'ERROR: Node ID required';
        
        const history = mesh.getChatHistory(nodeId)
            .map(msg => `${new Date(msg.timestamp).toLocaleString()} - ${msg.sender}: ${msg.message}`)
            .join('\n');
        return `Chat History with ${nodeId}:\n${history}`;
    }
};

// Export commands
window.meshCommands = meshCommands;