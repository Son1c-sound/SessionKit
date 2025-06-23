export class InMemoryStore {
    constructor() {
        this.sessions = new Map();
    }
    async addMessage(userId, message) {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, []);
        }
        const userSession = this.sessions.get(userId);
        userSession.push(message);
    }
    async getSession(userId) {
        return this.sessions.get(userId) || [];
    }
    async resetSession(userId) {
        this.sessions.delete(userId);
    }
    async trimSession(userId, memoryWindow) {
        const userSession = this.sessions.get(userId);
        if (!userSession)
            return;
        const maxMessages = memoryWindow * 2;
        if (userSession.length > maxMessages) {
            const trimmedMessages = userSession.slice(-maxMessages);
            this.sessions.set(userId, trimmedMessages);
        }
    }
}
//# sourceMappingURL=inMemoryStore.js.map