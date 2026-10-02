// StackAudit Extension Content Script: Privacy-First AI Usage Telemetry

let sessionStart = new Date().toISOString();
let activeDuration = 0; // seconds of active engagement on this focused tab
let idleDuration = 0; // seconds of tab open but inactive
let lastActivity = Date.now();
let isIdle = false;
let trackingPaused = false;
let checkpointCount = 0;

const IDLE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes inactivity threshold
const CHECKPOINT_INTERVAL_SECONDS = 60; // Periodic checkpoint flush every 60s
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
if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get({ monitoringEnabled: true }, (data) => {
    trackingPaused = !data.monitoringEnabled;
  });
}

// Record activity on direct user engagement (Strictly timestamps - NO content scraping)
const recordActivity = () => {
  lastActivity = Date.now();
};

window.addEventListener("mousemove", recordActivity);
window.addEventListener("keydown", recordActivity);
window.addEventListener("click", recordActivity);
window.addEventListener("focus", recordActivity);

// Multi-Tab Focus Aware & Idle Tracking Loop (1 Hz ticker)
setInterval(() => {
  if (trackingPaused) return;

  const now = Date.now();
  const hasFocus = typeof document !== "undefined" && document.hasFocus && document.hasFocus();
  const isVisible = typeof document !== "undefined" && !document.hidden;

  // Active duration increments ONLY if:
  // 1. The tab has focus and is visible (avoids multi-tab inflation across concurrent tabs)
  // 2. User has interacted within the IDLE_LIMIT_MS
  if (hasFocus && isVisible && (now - lastActivity <= IDLE_LIMIT_MS)) {
    if (isIdle) {
      isIdle = false;
      console.log("[StackAudit Content] User resumed activity in active tab.");
    }
    activeDuration += 1;
  } else {
    // Tab is backgrounded, unfocused, or user has gone idle
    if (!isIdle && (now - lastActivity > IDLE_LIMIT_MS)) {
      isIdle = true;
      console.log("[StackAudit Content] Tab marked as IDLE due to inactivity.");
    }
    idleDuration += 1;
  }

  // Periodic Checkpoint: Flush incremental telemetry every CHECKPOINT_INTERVAL_SECONDS
  // Ensures data is not lost if the browser crashes, computer sleeps, or process dies abruptly.
  if (activeDuration > 0 && activeDuration % CHECKPOINT_INTERVAL_SECONDS === 0) {
    checkpointCount += 1;
    flushTelemetryEvent(false);
  }
}, 1000);

/**
 * Sends a privacy-safe telemetry event to background service worker.
 * @param {boolean} isFinalSession - True when tab is unloading/closing.
 */
function flushTelemetryEvent(isFinalSession = false) {
  if (trackingPaused || (activeDuration === 0 && idleDuration === 0)) return;

  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.storage.local.get({ pairingToken: null }, (data) => {
      const pairing = data.pairingToken || {};
      const event = {
        eventId: `ext-ev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        organizationId: pairing.organizationId || "novatech-labs-uuid",
        employeeId: pairing.employeeId || "emp-1",
        workspaceId: `ws-${providerInfo.provider}`,
        connectorId: `${providerInfo.provider}-connector`,
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
        createdAt: new Date().toISOString(),
        metadata: {
          isCheckpoint: !isFinalSession,
          checkpointIndex: checkpointCount
        }
      };

      chrome.runtime.sendMessage({
        type: "TELEMETRY_EVENT",
        event
      });

      // If checkpoint flush, reset incremental delta counters while preserving session baseline
      if (!isFinalSession) {
        activeDuration = 0;
        idleDuration = 0;
        sessionStart = new Date().toISOString();
      }
    });
  }
}

// Flush final telemetry when user navigates away or closes tab
window.addEventListener("beforeunload", () => {
  flushTelemetryEvent(true);
});
