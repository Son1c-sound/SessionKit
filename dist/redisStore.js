import Redis from 'ioredis';
export class RedisStore {
    constructor(config = {}) {
        this.keyPrefix = config.keyPrefix || 'sessionkit:';
        if (config.url) {
            this.redis = new Redis(config.url, {
                tls: config.url.includes('upstash.io') ? {} : undefined,
                enableOfflineQueue: false,
                maxRetriesPerRequest: 3,
            });
        }
        else {
            this.redis = new Redis({
                host: config.host || 'localhost',
                port: config.port || 6379,
                password: config.password,
                tls: config.host?.includes('upstash.io') ? {} : undefined,
            });
        }
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
        return messages.map(msg => JSON.parse(msg));
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
    async disconnect() {
        await this.redis.quit();
    }
}
//# sourceMappingURL=redisStore.js.map