import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket) return;

        this.socket = io(import.meta.env.VITE_API_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Connected to real-time server');
        });

        this.socket.on('expense_updated', (data) => {
            this.emit('expense_updated', data);
        });

        this.socket.on('budget_warning', (data) => {
            this.emit('budget_warning', data);
        });

        this.socket.on('analysis_complete', (data) => {
            this.emit('analysis_complete', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    joinUserRoom(userId) {
        this.emit('join_user', userId);
    }
}

export default new SocketService();