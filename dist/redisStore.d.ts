import { Message, Store } from './types.js';
export interface RedisConfig {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    keyPrefix?: string;
}
export declare class RedisStore implements Store {
    private redis;
    private keyPrefix;
    constructor(config?: RedisConfig);
    private getKey;
    addMessage(userId: string, message: Message): Promise<void>;
    getSession(userId: string): Promise<Message[]>;
    resetSession(userId: string): Promise<void>;
    trimSession(userId: string, memoryWindow: number): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=redisStore.d.ts.map