class MeshNetworkManager {
    constructor() {
        this.mesh = new MeshNetwork();
        this.ws = null;
        this.nodeId = this.generateNodeId();
        this.publicKey = this.generatePublicKey();
        this.connected = false;
    }

    generateNodeId() {
        return 'node_' + Math.random().toString(36).substr(2, 9);
    }

    generatePublicKey() {
        // Placeholder for actual key generation
        return 'pub_' + Math.random().toString(36).substr(2, 9);
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.ws = new WebSocket(`${protocol}//${window.location.host}`);
        
        this.ws.onopen = () => {
            this.connected = true;
            this.sendNodeInfo();
            console.log('WebSocket connected');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.connected = false;
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.connected = false;
            setTimeout(() => this.connect(), 5000);
        };
    }

    sendNodeInfo() {
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'node_connected',
                nodeId: this.nodeId,
                publicKey: this.publicKey
            }));
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'node_connected':
                this.mesh.addNode(data.nodeId, data.publicKey);
                break;
            case 'node_disconnected':
                this.mesh.removeNode(data.nodeId);
                break;
            case 'message':
                this.mesh.sendMessage(data.sender, data.receiver, data.message);
                break;
        }
    }

    sendMessage(receiverId, message) {
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'message',
                sender: this.nodeId,
                receiver: receiverId,
                message: message
            }));
        }
    }

    getNodeId() {
        return this.nodeId;
    }

    getMesh() {
        return this.mesh;
    }

    isConnected() {
        return this.connected;
    }
}

// Initialize and export network manager
const networkManager = new MeshNetworkManager();
networkManager.connect();
window.mesh = networkManager.getMesh();
window.networkManager = networkManager; 