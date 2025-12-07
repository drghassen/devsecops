/**
 * Client WebSocket professionnel pour les interfaces IoT
 * Remplace le polling HTTP par une communication temps réel bidirectionnelle
 */
class IoTWebSocketClient {
    constructor(endpoint, callbacks) {
        this.endpoint = endpoint;
        this.callbacks = callbacks || {};
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.isConnecting = false;
    }

    connect() {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        this.isConnecting = true;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}${this.endpoint}`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                if (this.callbacks.onOpen) {
                    this.callbacks.onOpen();
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (this.callbacks.onMessage) {
                        this.callbacks.onMessage(data);
                    }
                } catch (error) {
                    console.error('Erreur lors du parsing des données WebSocket:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('Erreur WebSocket:', error);
                if (this.callbacks.onError) {
                    this.callbacks.onError(error);
                }
            };

            this.ws.onclose = () => {
                this.isConnecting = false;
                if (this.callbacks.onClose) {
                    this.callbacks.onClose();
                }
                this.attemptReconnect();
            };

        } catch (error) {
            console.error('Erreur lors de la connexion WebSocket:', error);
            this.isConnecting = false;
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Nombre maximum de tentatives de reconnexion atteint');
            if (this.callbacks.onMaxReconnectAttempts) {
                this.callbacks.onMaxReconnectAttempts();
            }
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket n\'est pas connecté');
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

