import { Redis } from '@upstash/redis';
export class UpstashStore {
    constructor(config) {
        this.redis = new Redis({
            url: config.url,
            token: config.token,
        });
        this.keyPrefix = config.keyPrefix || 'sessionkit:';
    }
    getKey(userId) {
        return `${this.keyPrefix}${userId}`;
    }
    async addMessage(userId, message) {
        const key = this.getKey(userId);
        const messageStr = JSON.stringify(message);
        await this.redis.rpush(key, messageStr);
    }
    async getSession(userId) {
        const key = this.getKey(userId);
        const messages = await this.redis.lrange(key, 0, -1);
        if (!Array.isArray(messages)) {
            return [];
        }
        return messages.map(msg => {
            if (typeof msg === 'string') {
                return JSON.parse(msg);
            }
            return msg;
        });
    }
    async resetSession(userId) {
        const key = this.getKey(userId);
        await this.redis.del(key);
    }
    async trimSession(userId, memoryWindow) {
        const key = this.getKey(userId);
        const sessionLength = await this.redis.llen(key);
        const maxMessages = memoryWindow * 2;
        if (sessionLength > maxMessages) {
            const trimCount = sessionLength - maxMessages;
            await this.redis.ltrim(key, trimCount, -1);
        }
    }
}
//# sourceMappingURL=upstashStore.js.map