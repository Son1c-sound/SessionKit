import { Redis } from '@upstash/redis';
import { Message, Store } from './types.js';

export interface UpstashConfig {
  url: string; 
  token: string;
  keyPrefix?: string;
}

export class UpstashStore implements Store {
  private redis: Redis;
  private keyPrefix: string;

  constructor(config: UpstashConfig) {
    this.redis = new Redis({
      url: config.url,
      token: config.token,
    });
    this.keyPrefix = config.keyPrefix || 'sessionkit:';
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
    
    if (!Array.isArray(messages)) {
      return [];
    }
    
    return messages.map(msg => {
      if (typeof msg === 'string') {
        return JSON.parse(msg);
      }
      return msg as Message;
    });
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
} 