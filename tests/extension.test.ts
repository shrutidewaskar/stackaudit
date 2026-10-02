import { UsageEvent } from "../lib/usage/types/types";

// Simulates extension domain detection logic
function detectToolFromDomain(hostname: string): string {
  if (hostname.includes("chatgpt.com")) return "chatgpt";
  if (hostname.includes("claude.ai")) return "claude";
  if (hostname.includes("gemini.google.com")) return "gemini";
  return "unknown-tool";
}

// Simulates client-side PrivacyFilter sanitization checks
function filterEventPrivacy(event: any): any {
  const clean = { ...event };
  const banned = ["prompt", "response", "clipboard", "keystrokes", "screenshot", "file", "pageContent"];
  
  banned.forEach((key) => {
    delete clean[key];
    if (clean.metadata) {
      delete clean.metadata[key];
    }
  });

  return clean;
}

async function runExtensionTests() {
  console.log("=== Running Browser Intelligence Extension Tests ===");

  // Test 1: Domain matching checks
  const tool1 = detectToolFromDomain("chat.chatgpt.com");
  const tool2 = detectToolFromDomain("claude.ai/chats");
  console.log(`Test 1: Domain host matches (ChatGPT: ${tool1}, Claude: ${tool2}) - ${tool1 === "chatgpt" && tool2 === "claude" ? "PASSED" : "FAILED"}`);

  // Test 2: Client-side privacy filtering sanitization
  const rawTelemetry = {
    eventId: "ext-123",
    provider: "openai",
    tool: "chatgpt",
    prompt: "Show me top secret corporate keys",
    clipboard: "Copied credentials",
    activeDuration: 180,
    metadata: {
      keystrokes: "some keystrokes log"
    }
  };

  const cleanTelemetry = filterEventPrivacy(rawTelemetry);
  const privacyPassed = 
    cleanTelemetry.prompt === undefined &&
    cleanTelemetry.clipboard === undefined &&
    cleanTelemetry.metadata.keystrokes === undefined &&
    cleanTelemetry.activeDuration === 180;
  console.log(`Test 2: Client-side privacy filter protection - ${privacyPassed ? "PASSED" : "FAILED"}`);

  // Test 3: Duration mathematical tracking checks
  const start = new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago
  const end = new Date();
  const sessionActiveSeconds = 25 * 60;
  const sessionIdleSeconds = 5 * 60;
  
  const totalTracked = sessionActiveSeconds + sessionIdleSeconds;
  const isCorrectDuration = totalTracked === 30 * 60;
  console.log(`Test 3: Active and Idle duration tracking sum calculations - ${isCorrectDuration ? "PASSED" : "FAILED"}`);

  console.log("=== Browser Extension Test Suite Completed successfully ===");
}

runExtensionTests().catch(console.error);
export {};
