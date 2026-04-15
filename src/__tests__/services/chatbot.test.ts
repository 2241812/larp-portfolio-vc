import { generateResponse, ConversationManager } from '@/services/chatbot';

// ==================== ConversationManager ====================

describe('ConversationManager', () => {
  let manager: ConversationManager;

  beforeEach(() => {
    manager = new ConversationManager();
  });

  describe('addMessage', () => {
    it('adds a user message and returns it', () => {
      const msg = manager.addMessage('user', 'Hello!');
      expect(msg.role).toBe('user');
      expect(msg.content).toBe('Hello!');
      expect(msg.id).toBeDefined();
      expect(msg.timestamp).toBeInstanceOf(Date);
    });

    it('adds an assistant message', () => {
      const msg = manager.addMessage('assistant', 'Hi there!');
      expect(msg.role).toBe('assistant');
      expect(msg.content).toBe('Hi there!');
    });

    it('assigns unique IDs to messages', () => {
      const msg1 = manager.addMessage('user', 'first');
      const msg2 = manager.addMessage('user', 'second');
      expect(msg1.id).not.toBe(msg2.id);
    });

    it('accumulates messages in history', () => {
      manager.addMessage('user', 'msg1');
      manager.addMessage('assistant', 'msg2');
      expect(manager.getHistory()).toHaveLength(2);
    });
  });

  describe('getHistory', () => {
    it('returns empty array when no messages', () => {
      expect(manager.getHistory()).toEqual([]);
    });

    it('returns a copy of history, not the original', () => {
      manager.addMessage('user', 'hello');
      const history1 = manager.getHistory();
      const history2 = manager.getHistory();
      expect(history1).not.toBe(history2);
    });
  });

  describe('clearHistory', () => {
    it('clears all messages', () => {
      manager.addMessage('user', 'hello');
      manager.addMessage('assistant', 'hi');
      manager.clearHistory();
      expect(manager.getHistory()).toHaveLength(0);
    });
  });

  describe('getContext', () => {
    it('returns formatted conversation context', () => {
      manager.addMessage('user', 'Hello!');
      manager.addMessage('assistant', 'Hi there!');
      const context = manager.getContext();
      expect(context).toContain('User: Hello!');
      expect(context).toContain('Assistant: Hi there!');
    });

    it('returns empty string when no messages', () => {
      expect(manager.getContext()).toBe('');
    });
  });

  describe('history limit', () => {
    it('keeps only the last 50 messages', () => {
      for (let i = 0; i < 60; i++) {
        manager.addMessage('user', `msg ${i}`);
      }
      const history = manager.getHistory();
      expect(history.length).toBe(50);
      // Should contain the most recent messages
      expect(history[history.length - 1].content).toBe('msg 59');
    });
  });
});

// ==================== generateResponse ====================

describe('generateResponse', () => {
  it('returns a non-empty string', () => {
    const response = generateResponse('hello');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('returns a prompt message for empty input', () => {
    const response = generateResponse('');
    expect(response).toContain('Please say something');
  });

  it('returns a prompt message for whitespace-only input', () => {
    const response = generateResponse('   ');
    expect(response).toContain('Please say something');
  });

  it('handles greeting patterns', () => {
    const response = generateResponse('hello');
    // Should not be the empty-input message
    expect(response).not.toContain('Please say something');
  });

  it('handles education-related queries', () => {
    const response = generateResponse('tell me about your education');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('handles skills-related queries', () => {
    const response = generateResponse('what are your skills');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('handles projects-related queries', () => {
    const response = generateResponse('show me your projects');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('handles contact queries', () => {
    const response = generateResponse('email contact');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('returns a fallback response for unknown input', () => {
    const response = generateResponse('xyzzy frobble wibble');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('handles docker queries', () => {
    const response = generateResponse('tell me about docker');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('handles python queries', () => {
    const response = generateResponse('python skills');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('handles goodbye patterns', () => {
    const response = generateResponse('bye');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('handles location queries', () => {
    const response = generateResponse('where are you located');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});
