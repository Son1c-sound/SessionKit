import Redis from 'ioredis';
import { Message, Store } from './types.js';

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  keyPrefix?: string;
}

export class RedisStore implements Store {
  private redis: Redis;
  private keyPrefix: string;

  constructor(config: RedisConfig = {}) {
    this.keyPrefix = config.keyPrefix || 'sessionkit:';
    
    if (config.url) {
      this.redis = new Redis(config.url, {
        tls: config.url.includes('upstash.io') ? {} : undefined,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3,
      });
    } else {
      this.redis = new Redis({
        host: config.host || 'localhost',
        port: config.port || 6379,
        password: config.password,
        tls: config.host?.includes('upstash.io') ? {} : undefined,
      });
    }
  }

  private getKey(userId: string): string {
    return `${this.keyPrefix}${userId}`;
  }

  async addMessage(userId: string, message: Message): Promise<void> {
    const key = this.getKey(userId);
    const messageStr = JSON.stringify(message);
    await this.redis.rpush(key, messageStr);
  }

  async getSession(userId: string): Promise<Message[]> {
    const key = this.getKey(userId);
    const messages = await this.redis.lrange(key, 0, -1);
    return messages.map(msg => JSON.parse(msg));
  }

  async resetSession(userId: string): Promise<void> {
    const key = this.getKey(userId);
    await this.redis.del(key);
  }

  async trimSession(userId: string, memoryWindow: number): Promise<void> {
    const key = this.getKey(userId);
    const sessionLength = await this.redis.llen(key);
    
    const maxMessages = memoryWindow * 2;
    
    if (sessionLength > maxMessages) {
      const trimCount = sessionLength - maxMessages;
      await this.redis.ltrim(key, trimCount, -1);
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
