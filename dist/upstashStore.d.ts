import { Message, Store } from './types.js';
export interface UpstashConfig {
    url: string;
    token: string;
    keyPrefix?: string;
}
export declare class UpstashStore implements Store {
    private redis;
    private keyPrefix;
    constructor(config: UpstashConfig);
    private getKey;
    addMessage(userId: string, message: Message): Promise<void>;
    getSession(userId: string): Promise<Message[]>;
    resetSession(userId: string): Promise<void>;
    trimSession(userId: string, memoryWindow: number): Promise<void>;
}
//# sourceMappingURL=upstashStore.d.ts.map