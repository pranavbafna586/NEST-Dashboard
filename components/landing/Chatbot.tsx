"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your CTIE assistant with access to all your dashboard data including KPIs, regional metrics, country performance, subject details, site performance, signature compliance, and more. I can answer specific questions about any metric, region, country, site, or subject. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Speech recognition hook
  const {
    isListening,
    isSupported: isSpeechSupported,
    toggleListening,
    error: speechRecognitionError,
  } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputValue((prev) => prev + (prev ? " " : "") + transcript);
    },
    onError: (error) => {
      setSpeechError(error);
      setTimeout(() => setSpeechError(null), 5000);
    },
    continuous: false,
    language: "en-US",
  });

  // Sample chat history for demonstration
  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: "1",
      title: "Clinical Trial Query",
      lastMessage: "What are the enrollment rates?",
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      title: "Data Harmonization",
      lastMessage: "How does CDISC mapping work?",
      timestamp: new Date(Date.now() - 172800000),
    },
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        chatWindowRef.current &&
        !chatWindowRef.current.contains(e.target as Node)
      ) {
        // Check if click is on the chat button
        const chatButton = document.getElementById("chat-toggle-button");
        if (chatButton && chatButton.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleChat = useCallback(() => {
    if (isAnimating) return; // Prevent rapid toggling
    setIsAnimating(true);
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setIsHistoryOpen(false);
    }
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, isOpen]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const userMessageText = inputValue.trim();
    setInputValue("");

    // Add typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        text: "Thinking...",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

    try {
      // Get session ID from localStorage
      const sessionId = localStorage.getItem("dashboardSessionId") || "";

      // Call Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          sessionId,
        }),
      });

      const data = await response.json();

      // Remove typing indicator
      setMessages((prev) => prev.filter((m) => m.id !== typingId));

      if (!response.ok) {
        // Handle error responses
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text:
            data.error || "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      // Add cache freshness warning if needed
      let botText = data.message;
      if (data.cacheAge && data.cacheAge > 15) {
        botText =
          `⚠️ *Note: Dashboard data is ${data.cacheAge} minutes old. Consider refreshing.*\n\n` +
          botText;
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove typing indicator
      setMessages((prev) => prev.filter((m) => m.id !== typingId));

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't connect to the AI service. Please check your connection and try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [inputValue]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = useCallback(() => {
    if (!isSpeechSupported) {
      setSpeechError(
        "Voice input is not supported in your browser. Please try Chrome or Edge.",
      );
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }
    toggleListening();
  }, [isSpeechSupported, toggleListening]);

  const loadChatHistory = useCallback((historyItem: ChatHistory) => {
    // Placeholder: In a real app, this would load the conversation
    setMessages([
      {
        id: "loaded",
        text: `Loaded conversation: "${historyItem.title}"`,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setIsHistoryOpen(false);
  }, []);

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        id="chat-toggle-button"
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] bg-white rounded-2xl overflow-hidden flex flex-col shadow-xl border border-gray-200"
            role="dialog"
            aria-label="Chat window"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600">
              <div className="flex items-center gap-3">
                {/* History Toggle (Hamburger Menu) */}
                <button
                  onClick={() => setIsHistoryOpen((prev) => !prev)}
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                  aria-label="Toggle chat history"
                  aria-expanded={isHistoryOpen}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    CTIE Assistant
                  </h3>
                  <span className="text-white/70 text-xs">Online</span>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content Area with History Sidebar */}
            <div className="flex-1 flex overflow-hidden relative bg-white">
              {/* History Sidebar */}
              <AnimatePresence>
                {isHistoryOpen && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 w-[70%] bg-white border-r border-gray-200 z-10 flex flex-col"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Chat History
                      </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {chatHistory.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No previous chats
                        </div>
                      ) : (
                        chatHistory.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => loadChatHistory(item)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-800 text-sm truncate">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.lastMessage}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {item.timestamp.toLocaleDateString()}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    {/* New Chat Button */}
                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setMessages([
                            {
                              id: "welcome",
                              text: "Hello! I'm your CTIE assistant with access to all your dashboard data including KPIs, regional metrics, country performance, subject details, site performance, signature compliance, and more. I can answer specific questions about any metric, region, country, site, or subject. How can I help you today?",
                              sender: "bot",
                              timestamp: new Date(),
                            },
                          ]);
                          setIsHistoryOpen(false);
                        }}
                        className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        + New Chat
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      {message.sender === "bot" ? (
                        <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="break-words my-1">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold text-gray-900">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic">{children}</em>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside my-2 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside my-2 space-y-1">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="ml-2">{children}</li>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  className="text-blue-600 underline hover:text-blue-800"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="break-words">{message.text}</p>
                      )}
                      <span
                        className={`text-[10px] mt-1 block ${
                          message.sender === "user"
                            ? "text-white/70"
                            : "text-gray-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-gray-200 bg-white">
              {/* Speech Error Toast */}
              <AnimatePresence>
                {speechError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
                  >
                    {speechError}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-2">
                {/* Mic Button */}
                <button
                  onClick={handleMicClick}
                  className={`p-2.5 rounded-full transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label={
                    isListening ? "Stop recording" : "Start voice input"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  aria-label="Type your message"
                />

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`p-2.5 rounded-full transition-all ${
                    inputValue.trim()
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  aria-label="Send message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
