let sessionStart = new Date().toISOString();
let activeDuration = 0; // seconds
let idleDuration = 0; // seconds
let lastActivity = Date.now();
let isIdle = false;
let trackingPaused = false;

const IDLE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes default
const providerInfo = getProviderInfo(window.location.hostname);

function getProviderInfo(hostname) {
  if (hostname.includes("chatgpt.com")) return { provider: "openai", tool: "chatgpt", domain: "chatgpt.com" };
  if (hostname.includes("claude.ai")) return { provider: "anthropic", tool: "claude", domain: "claude.ai" };
  if (hostname.includes("gemini.google.com")) return { provider: "gemini", tool: "gemini", domain: "gemini.google.com" };
  if (hostname.includes("perplexity.ai")) return { provider: "perplexity", tool: "perplexity", domain: "perplexity.ai" };
  if (hostname.includes("copilot.microsoft.com")) return { provider: "microsoft", tool: "copilot", domain: "copilot.microsoft.com" };
  return { provider: "unknown", tool: "shadow-tool", domain: hostname };
}

// Check tracking configuration on load
chrome.storage.local.get({ monitoringEnabled: true }, (data) => {
  trackingPaused = !data.monitoringEnabled;
});

// Periodic tracking ticker
setInterval(() => {
  if (trackingPaused) return;

  const now = Date.now();
  if (now - lastActivity > IDLE_LIMIT_MS) {
    if (!isIdle) {
      isIdle = true;
      console.log("[Content] Inactivity threshold hit. Tab entered IDLE state.");
    }
    idleDuration += 1;
  } else {
    if (isIdle) {
      isIdle = false;
      console.log("[Content] User activity resumed. Active state active.");
    }
    activeDuration += 1;
  }
}, 1000);

// Record activity on focus / keypress / mouse clicks (no content scraping)
const recordActivity = () => {
  lastActivity = Date.now();
};

window.addEventListener("mousemove", recordActivity);
window.addEventListener("keydown", recordActivity);
window.addEventListener("click", recordActivity);
window.addEventListener("focus", recordActivity);

// Flush telemetries when leaving or closing tab page
window.addEventListener("beforeunload", () => {
  if (trackingPaused) return;

  const event = {
    eventId: "ext-ev-" + Math.random().toString(36).substring(2),
    organizationId: "novatech-labs-uuid",
    employeeId: "emp-1", // Will resolve from pairing token
    workspaceId: "ws-" + providerInfo.provider,
    connectorId: providerInfo.provider + "-connector",
    provider: providerInfo.provider,
    tool: providerInfo.tool,
    source: "browser_extension",
    device: "Windows",
    browser: "Chrome",
    sessionStart: sessionStart,
    sessionEnd: new Date().toISOString(),
    activeDuration: activeDuration,
    idleDuration: idleDuration,
    tabVisibility: document.hidden ? "hidden" : "visible",
    domain: providerInfo.domain,
    createdAt: new Date().toISOString()
  };

  chrome.runtime.sendMessage({
    type: "TELEMETRY_EVENT",
    event
  });
});
