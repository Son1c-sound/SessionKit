import { Message, Store } from './types.js';
export declare class InMemoryStore implements Store {
    private sessions;
    addMessage(userId: string, message: Message): Promise<void>;
    getSession(userId: string): Promise<Message[]>;
    resetSession(userId: string): Promise<void>;
    trimSession(userId: string, memoryWindow: number): Promise<void>;
}
//# sourceMappingURL=inMemoryStore.d.ts.map