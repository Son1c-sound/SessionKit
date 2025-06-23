import { Message, SessionConfig, Store } from './types.js';
import { InMemoryStore } from './inMemoryStore.js';

export class SessionManager {
  private store: Store;
  private memoryWindow: number;

  constructor(config: SessionConfig = {}) {
    this.memoryWindow = config.memoryWindow || 10
    this.store = config.store || new InMemoryStore();
  }

  async sendMessage(userId: string, message: Message): Promise<void> {
    await this.store.addMessage(userId, message);
    await this.store.trimSession(userId, this.memoryWindow);
  }

  async getSession(userId: string): Promise<Message[]> {
    return await this.store.getSession(userId);
  }

  async resetSession(userId: string): Promise<void> {
    await this.store.resetSession(userId);
  }

  async addAssistantMessage(userId: string, content: string): Promise<void> {
    await this.sendMessage(userId, {
      role: 'assistant',
      content
    });
  }

  async addUserMessage(userId: string, content: string): Promise<void> {
    await this.sendMessage(userId, {
      role: 'user',
      content
    });
  }

  async addSystemMessage(userId: string, content: string): Promise<void> {
    await this.sendMessage(userId, {
      role: 'system',
      content
    });
  }

  getMemoryWindow(): number {
    return this.memoryWindow;
  }

  setMemoryWindow(window: number): void {
    this.memoryWindow = window;
  }
}
