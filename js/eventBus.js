/**
 * EventBus Class
 * Implements a simple publish-subscribe pattern for component communication
 */
export class EventBus {
    constructor() {
        this.subscribers = {};
    }
    
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
        
        // Return unsubscribe function
        return () => this.unsubscribe(event, callback);
    }
    
    unsubscribe(event, callback) {
        if (!this.subscribers[event]) return;
        this.subscribers[event] = this.subscribers[event]
            .filter(cb => cb !== callback);
    }
    
    publish(event, data) {
        if (!this.subscribers[event]) return;
        this.subscribers[event].forEach(callback => callback(data));
    }
}

// Create and export a singleton instance
export const eventBus = new EventBus();