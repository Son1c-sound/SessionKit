# SessionKit 🧠

> **Simple session memory management for any AI chat application**

A lightweight, TypeScript-ready SDK that manages conversation history with configurable memory windows and multiple storage backends. Works good  with OpenAI, Claude, Gemini, or any chat API.

[![npm version](https://badge.fury.io/js/sessionkit.svg)](https://www.npmjs.com/package/sessionkit)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Universal AI Support** - Works with OpenAI, Claude, Gemini, or any chat API
- **Smart Memory Management** - Configurable memory windows (keep last N message pairs)
- **Multiple Storage Backends** - InMemory (default), Upstash Redis, or traditional Redis
- **Simple API** - Just 3 main methods: `sendMessage`, `getSession`, `resetSession`
- **TypeScript Ready** - Full type safety with zero `any` types
- **Zero Config** - Works immediately with sensible defaults
- **Pluggable Architecture** - Easy to extend with custom storage backends

## Quick Start

```bash
npm install sessionkit
```

```javascript
import { SessionManager } from 'sessionkit';

const session = new SessionManager({
  memoryWindow: 5 // stores last 5 message pairs
});

// Add messages
await session.sendMessage("user123", {
  role: "user",
  content: "Hello, AI!"
});

// Get session for AI API
const messages = await session.getSession("user123");

// Use with any AI API
const response = await openai.chat.completions.create({
  messages,
  model: "gpt-4"
});

// Save AI response
await session.sendMessage("user123", {
  role: "assistant", 
  content: response.choices[0].message.content
});
```

## 💾 Storage Backends

| Backend | Storage | Persistent? | Use Case |
|---------|---------|-------------|----------|
| **InMemoryStore** | JavaScript Map | ❌ No | Development, single server |
| **UpstashStore** | Upstash Redis | ✅ Yes | Production, serverless |
| **RedisStore** | Self-hosted Redis | ✅ Yes | Production, dedicated servers |

### InMemory Storage (Default)
```javascript
import { SessionManager } from 'sessionkit';

const session = new SessionManager({ memoryWindow: 5 });
// Ready to use! No setup required
```

### Upstash Redis (Recommended for Production)
```javascript
import { SessionManager, UpstashStore } from 'sessionkit';

const session = new SessionManager({
  memoryWindow: 10,
  store: new UpstashStore({
    url: "https://your-db.upstash.io",
    token: "your-upstash-token"
  })
});
```

### Traditional Redis
```javascript
import { SessionManager, RedisStore } from 'sessionkit';

const session = new SessionManager({
  memoryWindow: 10,
  store: new RedisStore({
    host: "localhost",
    port: 6379,
    password: "your-password"
  })
});
```

## 📖 API Reference

### SessionManager

#### Constructor
```typescript
new SessionManager(config?: SessionConfig)
```

**SessionConfig:**
- `memoryWindow?: number` - Number of message pairs to keep (default: 10)
- `store?: Store` - Storage backend (default: InMemoryStore)

#### Core Methods

##### `sendMessage(userId: string, message: Message): Promise<void>`
Add a message to user's session and automatically trim to memory window.

```typescript
await session.sendMessage("user123", {
  role: "user",
  content: "What is TypeScript?"
});
```

##### `getSession(userId: string): Promise<Message[]>`
Get all messages for a user (returns array ready for AI APIs).

```typescript
const messages = await session.getSession("user123");
// Returns: [{ role: "user", content: "..." }, { role: "assistant", content: "..." }]
```

##### `resetSession(userId: string): Promise<void>`
Clear all messages for a user.

```typescript
await session.resetSession("user123");
```

#### Helper Methods

```typescript
// Convenience methods for common message types
await session.addUserMessage("user123", "Hello!");
await session.addAssistantMessage("user123", "Hi there!");
await session.addSystemMessage("user123", "You are a helpful assistant");

// Memory window management
session.setMemoryWindow(15);
const currentWindow = session.getMemoryWindow();
```

### Message Interface

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

### Storage Interfaces

#### UpstashStore Configuration
```typescript
interface UpstashConfig {
  url: string;        // https://your-db.upstash.io
  token: string;      // Your Upstash REST token
  keyPrefix?: string; // Optional prefix (default: "sessionkit:")
}
```

#### RedisStore Configuration
```typescript
interface RedisConfig {
  url?: string;       // Redis connection URL
  host?: string;      // Redis host (default: localhost)
  port?: number;      // Redis port (default: 6379)
  password?: string;  // Redis password
  keyPrefix?: string; // Optional prefix (default: "sessionkit:")
}
```

## 🤖 AI Integration Examples

### OpenAI GPT
```javascript
import { SessionManager } from 'sessionkit';
import OpenAI from 'openai';

const session = new SessionManager({ memoryWindow: 5 });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chat(userId, userMessage) {
  // Add user message
  await session.addUserMessage(userId, userMessage);
  
  // Get conversation history
  const messages = await session.getSession(userId);
  
  // Get AI response
  const response = await openai.chat.completions.create({
    messages,
    model: "gpt-4"
  });
  
  const assistantMessage = response.choices[0].message.content;
  
  // Save AI response
  await session.addAssistantMessage(userId, assistantMessage);
  
  return assistantMessage;
}
```

### Anthropic Claude
```javascript
import { SessionManager } from 'sessionkit';
import Anthropic from '@anthropic-ai/sdk';

const session = new SessionManager({ memoryWindow: 5 });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function chat(userId, userMessage) {
  await session.addUserMessage(userId, userMessage);
  const messages = await session.getSession(userId);
  
  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1000,
    messages
  });
  
  const assistantMessage = response.content[0].text;
  await session.addAssistantMessage(userId, assistantMessage);
  
  return assistantMessage;
}
```

### Google Gemini
```javascript
import { SessionManager } from 'sessionkit';
import { GoogleGenerativeAI } from '@google/generative-ai';

const session = new SessionManager({ memoryWindow: 5 });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

async function chat(userId, userMessage) {
  await session.addUserMessage(userId, userMessage);
  const messages = await session.getSession(userId);
  
  // Convert SessionKit format to Gemini format
  const geminiHistory = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({ history: geminiHistory });
  
  const result = await chat.sendMessage(userMessage);
  const assistantMessage = result.response.text();
  
  await session.addAssistantMessage(userId, assistantMessage);
  return assistantMessage;
}
```

## 🧠 Memory Window Behavior

The `memoryWindow` parameter controls how many **message pairs** (user + assistant) to keep:

- `memoryWindow: 1` → Keeps 2 messages (1 user + 1 assistant)
- `memoryWindow: 5` → Keeps 10 messages (5 user + 5 assistant)  
- `memoryWindow: 10` → Keeps 20 messages (10 user + 10 assistant)

Messages are automatically trimmed when new messages are added, keeping only the most recent conversations.

```javascript
const session = new SessionManager({ memoryWindow: 3 });

// After adding many messages, only last 3 pairs are kept
await session.addUserMessage("user", "Message 1");
await session.addAssistantMessage("user", "Response 1");
await session.addUserMessage("user", "Message 2");  
await session.addAssistantMessage("user", "Response 2");
await session.addUserMessage("user", "Message 3");
await session.addAssistantMessage("user", "Response 3");
await session.addUserMessage("user", "Message 4");  // Oldest pair gets removed

const messages = await session.getSession("user");
// Returns only messages 2, 3, and 4 with their responses
```

## 🔧 Advanced Usage

### Custom Storage Backend
```javascript
import { Store, Message } from 'sessionkit';

class CustomStore implements Store {
  async addMessage(userId: string, message: Message): Promise<void> {
    // Your custom storage logic
  }
  
  async getSession(userId: string): Promise<Message[]> {
    // Your custom retrieval logic
  }
  
  async resetSession(userId: string): Promise<void> {
    // Your custom reset logic
  }
  
  async trimSession(userId: string, memoryWindow: number): Promise<void> {
    // Your custom trimming logic
  }
}

const session = new SessionManager({
  store: new CustomStore()
});
```

### Dynamic Memory Window
```javascript
const session = new SessionManager({ memoryWindow: 5 });

// Adjust memory window based on conversation type
if (conversationType === 'technical') {
  session.setMemoryWindow(10); // Keep more context for technical discussions
} else {
  session.setMemoryWindow(3);  // Less context for casual chat
}
```

### Multi-tenant Applications
```javascript
const session = new SessionManager({
  store: new UpstashStore({
    url: process.env.UPSTASH_URL,
    token: process.env.UPSTASH_TOKEN,
    keyPrefix: `tenant:${tenantId}:` // Namespace by tenant
  })
});
```

## 🏗️ Production Deployment

### Environment Variables
```bash
# For Upstash Redis
UPSTASH_URL=https://your-db.upstash.io
UPSTASH_TOKEN=your-token

# For traditional Redis  
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-password
```

### Error Handling
```javascript
try {
  const messages = await session.getSession(userId);
  const response = await openai.chat.completions.create({ messages });
  await session.addAssistantMessage(userId, response.choices[0].message.content);
} catch (error) {
  console.error('Chat session error:', error);
  // Graceful fallback - session operations are isolated
}
```

### Connection Cleanup
```javascript
// For Redis-based stores, clean up connections
const redisStore = new RedisStore({ host: "localhost" });
const session = new SessionManager({ store: redisStore });

// When shutting down
await redisStore.disconnect();
```

## 📦 Installation & Setup

### Basic Installation
```bash
npm install sessionkit
```

### With AI Providers
```bash
# Choose your AI provider
npm install sessionkit openai                    # OpenAI
npm install sessionkit @anthropic-ai/sdk        # Claude  
npm install sessionkit @google/generative-ai    # Gemini
```

### With Persistent Storage
```bash
# Upstash Redis (recommended)
npm install sessionkit

# Traditional Redis
npm install sessionkit ioredis
```

## 🛠️ Development

### TypeScript Support
SessionKit is built with TypeScript and provides full type safety:

```typescript
import { SessionManager, Message, UpstashStore } from 'sessionkit';

// Full autocomplete and type checking
const session: SessionManager = new SessionManager({ memoryWindow: 5 });
const messages: Message[] = await session.getSession("user123");

// Compile-time error prevention
await session.sendMessage("user123", {
  role: "invalid",  // ❌ TypeScript error!
  content: "test"
});
```

### Testing
```bash
git clone https://github.com/your-username/sessionkit
cd sessionkit
npm install
npm run build
node example.js  # Test the examples
```

## 🗺️ Roadmap

### ✅ Phase 1 (Current)
- [x] Core session management
- [x] Memory window trimming  
- [x] Multiple storage backends
- [x] TypeScript support
- [x] Universal AI compatibility

### 🔄 Phase 2 (Coming Soon)
- [ ] Token-based trimming (by token count, not message count)
- [ ] Conversation summarization
- [ ] Message search and filtering
- [ ] Analytics and insights
- [ ] Rate limiting and quotas

### 🚀 Phase 3 (Future)
- [ ] Vector-based semantic search
- [ ] Conversation branching
- [ ] Export/import conversations
- [ ] Real-time collaboration
- [ ] Advanced compression

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the AI development community
- Inspired by the need for simple session management
- Thanks to all contributors and users

---

**Built with ❤️ for AI developers**

[npm](https://www.npmjs.com/package/sessionkit) • [GitHub](https://github.com/your-username/sessionkit) • [Documentation](https://github.com/your-username/sessionkit#readme) • [Issues](https://github.com/your-username/sessionkit/issues) 