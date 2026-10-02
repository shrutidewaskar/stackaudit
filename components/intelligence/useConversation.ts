import { useState, useCallback } from "react";

export interface ConversationMock {
  id: string;
  title: string;
  lastMessageAt: string;
  isPinned: boolean;
  isFavorite: boolean;
  status: "active" | "archived";
}

export function useConversation() {
  const [conversations, setConversations] = useState<ConversationMock[]>([
    {
      id: "session-1",
      title: "Consolidating Claude seat plans",
      lastMessageAt: "2026-08-03T09:00:00.000Z",
      isPinned: true,
      isFavorite: false,
      status: "active"
    },
    {
      id: "session-2",
      title: "Cursor Pro team configuration",
      lastMessageAt: "2026-08-02T10:00:00.000Z",
      isPinned: false,
      isFavorite: true,
      status: "active"
    },
    {
      id: "session-3",
      title: "Renewing GitHub Copilot early",
      lastMessageAt: "2026-08-01T10:00:00.000Z",
      isPinned: false,
      isFavorite: false,
      status: "active"
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>("session-1");

  const renameConversation = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const pinConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  }, []);

  const favoriteConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  }, []);

  const selectConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
  }, []);

  return {
    conversations,
    activeConversationId,
    renameConversation,
    deleteConversation,
    pinConversation,
    favoriteConversation,
    selectConversation
  };
}
