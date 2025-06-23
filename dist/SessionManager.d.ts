import { Message, SessionConfig } from './types.js';
export declare class SessionManager {
    private store;
    private memoryWindow;
    constructor(config?: SessionConfig);
    sendMessage(userId: string, message: Message): Promise<void>;
    getSession(userId: string): Promise<Message[]>;
    resetSession(userId: string): Promise<void>;
    addAssistantMessage(userId: string, content: string): Promise<void>;
    addUserMessage(userId: string, content: string): Promise<void>;
    addSystemMessage(userId: string, content: string): Promise<void>;
    getMemoryWindow(): number;
    setMemoryWindow(window: number): void;
}
//# sourceMappingURL=SessionManager.d.ts.map