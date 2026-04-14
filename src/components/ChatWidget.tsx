"use client";
import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateResponse, ConversationManager, type Message } from '@/services/chatbot';

interface ChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ChatWidget = memo(function ChatWidget({ isOpen: initialOpen = false, onClose }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationManagerRef = useRef(new ConversationManager());

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hey! 👋 I'm Narciso, a CS student and AI Development Intern. Ask me anything about my skills, projects, or how to get in touch!",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      conversationManagerRef.current.addMessage('assistant', welcomeMessage.content);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    conversationManagerRef.current.addMessage('user', inputValue);
    setInputValue('');
    setIsLoading(true);

    // Simulate response delay for natural feel
    setTimeout(() => {
      const responseText = generateResponse(inputValue);
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        content: responseText,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      conversationManagerRef.current.addMessage('assistant', responseText);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleReset = () => {
    conversationManagerRef.current.clearHistory();
    setMessages([
      {
        id: 'welcome',
        content: "Hey! 👋 I'm Narciso. What would you like to know about me?",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-2xl shadow-cyan-500/50 flex items-center justify-center font-bold text-xl hover:shadow-cyan-500/70 transition-all z-40"
            aria-label="Open chat"
          >
            💬
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', bounce: 0.25 }}
            className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-32px)] h-[600px] bg-gradient-to-br from-neutral-900/95 via-neutral-950/95 to-black/95 backdrop-blur-xl border border-cyan-400/20 rounded-2xl shadow-2xl shadow-cyan-400/10 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-6 py-4 border-b border-cyan-400/10 flex items-center justify-between bg-neutral-900/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="font-bold text-cyan-400 text-base">Portfolio Bot</h3>
                  <p className="text-[11px] text-neutral-500">AI-powered assistance</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-neutral-500 hover:text-cyan-400 transition-colors text-lg"
                aria-label="Close chat"
              >
                ✕
              </button>
            </motion.div>

            {/* Messages Area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((message, idx) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, x: message.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ type: 'spring', delay: idx * 0.05 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-cyan-500/80 text-neutral-950 font-medium rounded-br-none'
                          : 'bg-neutral-800/60 text-neutral-100 rounded-bl-none border border-cyan-400/20'
                      }`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-neutral-500 text-sm"
                  >
                    <span>Thinking</span>
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }}>
                      •
                    </motion.span>
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>
                      •
                    </motion.span>
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>
                      •
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </motion.div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-6 py-4 border-t border-cyan-400/10 space-y-3 bg-neutral-900/50"
            >
              {/* Reset button */}
              <button
                onClick={handleReset}
                className="w-full text-xs text-neutral-600 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded border border-neutral-700/50 hover:border-cyan-400/30 text-center"
              >
                Clear Conversation
              </button>

              {/* Input field */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-neutral-800/50 border border-cyan-400/20 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4 py-2 bg-cyan-500/80 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold rounded-lg transition-all text-sm"
                >
                  Send
                </button>
              </div>

              {/* Helper text */}
              <p className="text-[10px] text-neutral-700 text-center">
                Rule-based AI • Trained on portfolio content
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default ChatWidget;
