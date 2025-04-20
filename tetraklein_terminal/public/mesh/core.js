class MeshNode {
    constructor(id) {
        this.id = id;
        this.status = 'active';
        this.lastSeen = Date.now();
        this.connections = new Set();
    }

    updateStatus(status) {
        this.status = status;
        this.lastSeen = Date.now();
    }

    addConnection(nodeId) {
        this.connections.add(nodeId);
    }

    removeConnection(nodeId) {
        this.connections.delete(nodeId);
    }
}

class MeshNetwork {
    constructor() {
        this.nodes = new Map();
        this.connections = new Map();
        this.chatHistory = new Map();
    }

    addNode(nodeId) {
        if (!this.nodes.has(nodeId)) {
            this.nodes.set(nodeId, new MeshNode(nodeId));
            this.connections.set(nodeId, new Set());
            this.chatHistory.set(nodeId, []);
        }
    }

    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        this.connections.delete(nodeId);
        this.chatHistory.delete(nodeId);
        
        // Remove connections to this node from other nodes
        for (const [id, connections] of this.connections.entries()) {
            connections.delete(nodeId);
        }
    }

    connectNodes(nodeId1, nodeId2) {
        if (!this.nodes.has(nodeId1) || !this.nodes.has(nodeId2)) {
            throw new Error('One or both nodes do not exist');
        }

        this.connections.get(nodeId1).add(nodeId2);
        this.connections.get(nodeId2).add(nodeId1);
        
        this.nodes.get(nodeId1).addConnection(nodeId2);
        this.nodes.get(nodeId2).addConnection(nodeId1);
    }

    disconnectNodes(nodeId1, nodeId2) {
        if (this.connections.has(nodeId1)) {
            this.connections.get(nodeId1).delete(nodeId2);
        }
        if (this.connections.has(nodeId2)) {
            this.connections.get(nodeId2).delete(nodeId1);
        }
        
        if (this.nodes.has(nodeId1)) {
            this.nodes.get(nodeId1).removeConnection(nodeId2);
        }
        if (this.nodes.has(nodeId2)) {
            this.nodes.get(nodeId2).removeConnection(nodeId1);
        }
    }

    addChatMessage(sender, recipient, message) {
        const key = `${sender}-${recipient}`;
        const reverseKey = `${recipient}-${sender}`;
        
        if (!this.chatHistory.has(key)) {
            this.chatHistory.set(key, []);
        }
        if (!this.chatHistory.has(reverseKey)) {
            this.chatHistory.set(reverseKey, []);
        }
        
        const timestamp = Date.now();
        const messageObj = { sender, message, timestamp };
        
        this.chatHistory.get(key).push(messageObj);
        this.chatHistory.get(reverseKey).push(messageObj);
    }

    getChatHistory(nodeId1, nodeId2) {
        const key = `${nodeId1}-${nodeId2}`;
        return this.chatHistory.get(key) || [];
    }

    getConnectedNodes(nodeId) {
        return Array.from(this.connections.get(nodeId) || []);
    }

    updateNodeStatus(nodeId, status) {
        if (this.nodes.has(nodeId)) {
            this.nodes.get(nodeId).updateStatus(status);
        }
    }
}

// Initialize mesh network
const mesh = new MeshNetwork();

// Export mesh network instance
window.mesh = mesh; 