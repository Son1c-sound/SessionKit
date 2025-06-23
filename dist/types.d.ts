export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface SessionConfig {
    memoryWindow?: number;
    store?: Store;
}
export interface Store {
    addMessage(userId: string, message: Message): Promise<void>;
    getSession(userId: string): Promise<Message[]>;
    resetSession(userId: string): Promise<void>;
    trimSession(userId: string, memoryWindow: number): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map