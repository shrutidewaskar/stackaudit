"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useConversation } from "@/lib/ai/conversation/hooks/useConversation";
import { FloatingOrb } from "./FloatingOrb";
import { ChatPanel } from "./ChatPanel";

export const ChatWidget = () => {
  const { initializeSession } = useConversation();
  const params = useParams();
  const auditId = params?.id as string || null;

  useEffect(() => {
    // Initialize session with current auditId if present
    initializeSession(null, auditId);
  }, [auditId]);

  return (
    <>
      <FloatingOrb />
      <ChatPanel />
    </>
  );
};
