class MeshNetwork {
    constructor() {
        this.nodes = new Map();
        this.connections = new Map();
        this.chatHistory = [];
    }

    addNode(nodeId, publicKey) {
        this.nodes.set(nodeId, {
            publicKey,
            status: 'online',
            lastSeen: Date.now()
        });
    }

    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        this.connections.delete(nodeId);
    }

    connectNodes(nodeId1, nodeId2) {
        if (!this.connections.has(nodeId1)) {
            this.connections.set(nodeId1, new Set());
        }
        this.connections.get(nodeId1).add(nodeId2);
    }

    sendMessage(senderId, receiverId, message) {
        if (!this.nodes.has(senderId) || !this.nodes.has(receiverId)) {
            return false;
        }

        const encryptedMessage = this.encryptMessage(message, this.nodes.get(receiverId).publicKey);
        this.chatHistory.push({
            sender: senderId,
            receiver: receiverId,
            message: encryptedMessage,
            timestamp: Date.now()
        });
        return true;
    }

    encryptMessage(message, publicKey) {
        // Implement actual encryption here
        return btoa(message); // Placeholder for actual encryption
    }

    decryptMessage(encryptedMessage, privateKey) {
        // Implement actual decryption here
        return atob(encryptedMessage); // Placeholder for actual decryption
    }

    getNodeStatus(nodeId) {
        return this.nodes.get(nodeId)?.status || 'offline';
    }

    getConnectedNodes(nodeId) {
        return Array.from(this.connections.get(nodeId) || []);
    }

    getChatHistory(nodeId) {
        return this.chatHistory.filter(msg => 
            msg.sender === nodeId || msg.receiver === nodeId
        );
    }
}

// Initialize mesh network
const mesh = new MeshNetwork();

// WebSocket connection for real-time communication
const ws = new WebSocket('wss://' + window.location.host);

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case 'node_connected':
            mesh.addNode(data.nodeId, data.publicKey);
            break;
        case 'node_disconnected':
            mesh.removeNode(data.nodeId);
            break;
        case 'message':
            mesh.sendMessage(data.sender, data.receiver, data.message);
            break;
    }
};

// Export mesh network instance
window.mesh = mesh; 