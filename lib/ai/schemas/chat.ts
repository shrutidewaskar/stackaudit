export interface ChatResponseSchema {
  reply: string;
  suggestedFollowUps: string[];
}

export const validateChatResponse = (data: any): data is ChatResponseSchema => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.reply === "string" &&
    Array.isArray(data.suggestedFollowUps) &&
    data.suggestedFollowUps.every((item: any) => typeof item === "string")
  );
};
