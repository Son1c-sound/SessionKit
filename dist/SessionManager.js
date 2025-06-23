import { InMemoryStore } from './inMemoryStore.js';
export class SessionManager {
    constructor(config = {}) {
        this.memoryWindow = config.memoryWindow || 10;
        this.store = config.store || new InMemoryStore();
    }
    async sendMessage(userId, message) {
        await this.store.addMessage(userId, message);
        await this.store.trimSession(userId, this.memoryWindow);
    }
    async getSession(userId) {
        return await this.store.getSession(userId);
    }
    async resetSession(userId) {
        await this.store.resetSession(userId);
    }
    async addAssistantMessage(userId, content) {
        await this.sendMessage(userId, {
            role: 'assistant',
            content
        });
    }
    async addUserMessage(userId, content) {
        await this.sendMessage(userId, {
            role: 'user',
            content
        });
    }
    async addSystemMessage(userId, content) {
        await this.sendMessage(userId, {
            role: 'system',
            content
        });
    }
    getMemoryWindow() {
        return this.memoryWindow;
    }
    setMemoryWindow(window) {
        this.memoryWindow = window;
    }
}
//# sourceMappingURL=SessionManager.js.map