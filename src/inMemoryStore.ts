import { Message, Store } from './types.js';

export class InMemoryStore implements Store {
  private sessions: Map<string, Message[]> = new Map();

  async addMessage(userId: string, message: Message): Promise<void> {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, []);
    }
    
    const userSession = this.sessions.get(userId)!;
    userSession.push(message);
  }

  async getSession(userId: string): Promise<Message[]> {
    return this.sessions.get(userId) || [];
  }

  async resetSession(userId: string): Promise<void> {
    this.sessions.delete(userId);
  }

  async trimSession(userId: string, memoryWindow: number): Promise<void> {
    const userSession = this.sessions.get(userId);
    if (!userSession) return;

    const maxMessages = memoryWindow * 2;
    
    if (userSession.length > maxMessages) {
      const trimmedMessages = userSession.slice(-maxMessages);
      this.sessions.set(userId, trimmedMessages);
    }
  }
}
