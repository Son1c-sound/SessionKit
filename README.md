# SessionKit

**Simple conversation memory for AI chat apps**

SessionKit automatically saves and manages conversation history for any AI API (OpenAI, Claude, Gemini, etc.). Set a memory window and it handles the rest!

```bash
npm install sessionkit
```

## Quick Start

```javascript
import { SessionManager } from 'sessionkit';

const session = new SessionManager({ 
  memoryWindow: 5  // Keep last 5 conversation pairs (10 messages)
});

// User sends message - automatically saved! 
await session.addUserMessage('user123', 'Hello AI!');

// Get conversation history for AI API
const messages = await session.getSession('user123');

// Send to any AI API (OpenAI example)
const response = await openai.chat.completions.create({
  messages,  // Full conversation history included
  model: 'gpt-4'
});

// Save AI response - automatically saved!
await session.addAssistantMessage('user123', response.choices[0].message.content);

// Next message will include full conversation history!
```

## What SessionKit Does

- **Saves conversation history** - User messages + AI responses automatically stored
- **Remembers context** - AI sees previous messages for better responses  
- **Auto-trims conversations** - Keeps only last N conversation pairs
- **Multi-user support** - Separate conversation history per user
- **Works with any AI** - Returns standard message format

## Storage Options

**InMemory (Default)**
```javascript
const session = new SessionManager({ memoryWindow: 5 });
// Conversations saved in memory (lost on restart)
```

**Persistent Storage (Upstash Redis)**
```javascript
import { SessionManager, UpstashStore } from 'sessionkit';

const session = new SessionManager({
  memoryWindow: 10,
  store: new UpstashStore({
    url: 'https://your-db.upstash.io',
    token: 'your-token'
  })
});
// Conversations survive server restarts
```

## API

### Main Methods
```javascript
// Add messages (automatically saved)
await session.addUserMessage(userId, 'Hello!');
await session.addAssistantMessage(userId, 'Hi there!');

// Get conversation history
const messages = await session.getSession(userId);

// Reset conversation
await session.resetSession(userId);
```

### Memory Window
- `memoryWindow: 5` = Keep last 5 conversation pairs (10 total messages)
- `memoryWindow: 10` = Keep last 10 conversation pairs (20 total messages)
- Older messages automatically deleted when limit reached

## Examples

### Express Server with Conversation Memory
```javascript
import express from 'express';
import OpenAI from 'openai';
import { SessionManager } from 'sessionkit';

const app = express();
const openai = new OpenAI({ apiKey: 'your-key' });
const session = new SessionManager({ memoryWindow: 5 });

app.post('/chat', async (req, res) => {
  const { message, userId } = req.body;
  
  // Save user message
  await session.addUserMessage(userId, message);
  
  // Get full conversation history  
  const messages = await session.getSession(userId);
  
  // Send to OpenAI with full context
  const response = await openai.chat.completions.create({
    messages,
    model: 'gpt-4'
  });
  
  // Save AI response
  const aiMessage = response.choices[0].message.content;
  await session.addAssistantMessage(userId, aiMessage);
  
  res.json({ response: aiMessage });
});
```

### Works with Any AI API
```javascript
// OpenAI
const messages = await session.getSession(userId);
await openai.chat.completions.create({ messages, model: 'gpt-4' });

// Claude (Anthropic)
await anthropic.messages.create({ messages, model: 'claude-3' });

// Gemini 
await gemini.generateContent({ messages });
```

## TypeScript Support

Full TypeScript support included:

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

## What You Get

- **Automatic conversation memory** 
- **Multi-user session management**
- **Memory window control**
- **TypeScript ready**
- **Zero configuration needed**
- **Works with any AI API**

---

**That's it!** Install, set memory window, and your AI will remember conversations automatically.
