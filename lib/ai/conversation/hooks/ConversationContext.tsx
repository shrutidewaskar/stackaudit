"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { ChatSession, ChatMessage, ConversationContext as ChatContext, IntentType, SuggestedAction } from "../types";
import { conversationService } from "../ConversationService";
import { promptService } from "../PromptService";

interface ConversationContextType {
  session: ChatSession | null;
  messages: ChatMessage[];
  context: ChatContext | null;
  currentIntent: IntentType | null;
  suggestions: SuggestedAction[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initializeSession: (userId: string | null, auditId: string | null) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContextInstance = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [context, setContext] = useState<ChatContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<IntentType | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedAction[]>([]);

  // Initialize session
  const initializeSession = async (userId: string | null, auditId: string | null) => {
    try {
      const { session: s, messages: m, context: c } = await conversationService.getOrInitializeSession(userId, auditId);
      setSession(s);
      setMessages(m);
      setContext(c);
      setCurrentIntent(s.current_intent);
      
      const newSugs = promptService.getSuggestedActions(s.current_intent || "Greeting", c);
      setSuggestions(newSugs);
    } catch (err) {
      console.error("ConversationProvider: Failed to initialize chat session", err);
    }
  };

  const sendMessage = async (content: string) => {
    if (!session || !content.trim()) return;

    setIsLoading(true);

    // Append user message instantly
    const tempUserMsg: ChatMessage = {
      id: "temp-user-" + Date.now(),
      session_id: session.id,
      role: "user",
      content,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const { userMessage, assistantMessage } = await conversationService.processUserMessage(session.id, content);
      
      // Update with exact saved message IDs
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.id.startsWith("temp-user-"));
        return [...filtered, userMessage, assistantMessage];
      });

      // Update active intent
      const newIntent = assistantMessage.metadata?.intent || "Exploration";
      setCurrentIntent(newIntent);

      const newSugs = promptService.getSuggestedActions(newIntent, context);
      setSuggestions(newSugs);
    } catch (err) {
      console.error("ConversationProvider: Failed to send chat message", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContextInstance.Provider
      value={{
        session,
        messages,
        context,
        currentIntent,
        suggestions,
        isLoading,
        isOpen,
        setIsOpen,
        initializeSession,
        sendMessage
      }}
    >
      {children}
    </ChatContextInstance.Provider>
  );
};

export const useConversationContext = () => {
  const context = useContext(ChatContextInstance);
  if (!context) {
    throw new Error("useConversationContext must be used within a ConversationProvider");
  }
  return context;
};
