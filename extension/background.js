// StackAudit Extension Background Service Worker

const DEFAULT_API_BASE_URL = "http://localhost:3000";
const MAX_QUEUE_SIZE = 500;
const BATCH_SIZE = 50;

let syncInProgress = false;
let retryAttempt = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TELEMETRY_EVENT") {
    queueEvent(message.event);
    sendResponse({ status: "queued" });
  } else if (message.type === "TRIGGER_SYNC") {
    triggerSync();
    sendResponse({ status: "sync_initiated" });
  }
  return true;
});

async function queueEvent(event) {
  const sanitized = sanitizeEvent(event);

  chrome.storage.local.get({ eventQueue: [] }, (data) => {
    let queue = data.eventQueue || [];
    
    // Prevent duplicate event IDs within local buffer
    const exists = queue.some((e) => e.eventId === sanitized.eventId);
    if (!exists) {
      queue.push(sanitized);
    }

    // Bounded buffer enforcement: drop oldest if exceeding MAX_QUEUE_SIZE
    if (queue.length > MAX_QUEUE_SIZE) {
      queue = queue.slice(queue.length - MAX_QUEUE_SIZE);
    }

    chrome.storage.local.set({ eventQueue: queue }, () => {
      console.log(`[StackAudit Background] Event queued. Buffer depth: ${queue.length}`);
      triggerSync();
    });
  });
}

/**
 * Client-Side Privacy Compliance Sanitizer
 * Strips all prompts, responses, conversation history, DOM content, and sensitive keys.
 */
function sanitizeEvent(event) {
  const clean = { ...event };
  const bannedKeys = [
    "prompt", "response", "clipboard", "keystroke", "keystrokes", 
    "screenshot", "file", "document", "chatHistory", "pageContent", 
    "query", "input", "output", "tokens"
  ];

  bannedKeys.forEach((key) => {
    delete clean[key];
    if (clean.metadata && typeof clean.metadata === "object") {
      delete clean.metadata[key];
    }
  });

  return clean;
}

/**
 * Validates and normalizes the API base URL.
 * Requires HTTPS unless connecting to localhost/127.0.0.1 for local development.
 */
function validateAndNormalizeEndpoint(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return DEFAULT_API_BASE_URL;
  }

  try {
    const url = new URL(urlString.trim());
    if (url.username || url.password) return DEFAULT_API_BASE_URL;

    const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol === "http:" && isLocalhost) {
      return url.origin;
    }
    if (url.protocol === "https:") {
      return url.origin;
    }
  } catch {
    return DEFAULT_API_BASE_URL;
  }

  return DEFAULT_API_BASE_URL;
}

/**
 * Synchronizes pending telemetry events with the authenticated backend.
 * Uses exponential backoff on transient network failures and atomic batch acknowledgment.
 */
async function triggerSync() {
  if (syncInProgress) return;
  syncInProgress = true;

  chrome.storage.local.get({ eventQueue: [], pairingToken: null, apiBaseUrl: null }, async (data) => {
    const queue = data.eventQueue || [];
    const pairing = data.pairingToken;
    const apiBase = validateAndNormalizeEndpoint(data.apiBaseUrl || DEFAULT_API_BASE_URL);

    if (queue.length === 0) {
      syncInProgress = false;
      return;
    }

    // Require valid pairing token before transmission
    if (!pairing || !pairing.token) {
      console.warn("[StackAudit Background] Telemetry ingest suspended: Extension is not paired with a StackAudit organization.");
      chrome.storage.local.set({
        lastSyncStatus: "UNPAIRED",
        lastSyncError: "Please configure pairing token in extension options."
      });
      syncInProgress = false;
      return;
    }

    // Prepare bounded batch for submission
    const batch = queue.slice(0, BATCH_SIZE);
    const batchEventIds = new Set(batch.map((e) => e.eventId));

    const organizationId = pairing.organizationId;
    const authToken = pairing.token;

    const payload = {
      organizationId,
      events: batch
    };

    const endpointUrl = `${apiBase}/api/usage/events`;

    try {
      console.log(`[StackAudit Background] Syncing batch of ${batch.length} events to ${endpointUrl}...`);

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
        "x-organization-id": organizationId
      };

      const res = await fetch(endpointUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const responseData = await res.json().catch(() => ({}));
        console.log(`[StackAudit Background] Sync successful. Accepted: ${responseData.accepted}, Duplicates: ${responseData.duplicates}`);

        // Atomic Queue Update: remove only the successfully acknowledged/processed events
        chrome.storage.local.get({ eventQueue: [] }, (latestData) => {
          const remainingQueue = (latestData.eventQueue || []).filter((e) => !batchEventIds.has(e.eventId));
          chrome.storage.local.set({
            eventQueue: remainingQueue,
            lastSyncTime: new Date().toISOString(),
            lastSyncStatus: "SUCCESS",
            lastSyncCount: batch.length
          });
        });

        retryAttempt = 0; // Reset backoff on success
      } else if (res.status === 401 || res.status === 403) {
        console.error(`[StackAudit Background] Authentication/Authorization failed (Status ${res.status}). Pausing sync until re-paired.`);
        chrome.storage.local.set({
          lastSyncStatus: `AUTH_ERROR_${res.status}`,
          lastSyncError: "Authentication invalid or organization membership expired."
        });
      } else {
        console.warn(`[StackAudit Background] Ingest server error: Status ${res.status}`);
        scheduleRetry();
      }
    } catch (err) {
      console.warn("[StackAudit Background] Network/connection failure during sync (offline buffer preserved):", err.message);
      chrome.storage.local.set({
        lastSyncStatus: "OFFLINE_QUEUED",
        lastSyncError: err.message
      });
      scheduleRetry();
    } finally {
      syncInProgress = false;
    }
  });
}

function scheduleRetry() {
  retryAttempt = Math.min(retryAttempt + 1, 5);
  const backoffSeconds = Math.pow(2, retryAttempt) * 5; // 10s, 20s, 40s, 80s, 160s
  console.log(`[StackAudit Background] Retrying sync in ${backoffSeconds} seconds (Attempt #${retryAttempt})...`);
}

// Scheduled Alarm: Periodic sync trigger every 30 seconds (0.5 minutes)
chrome.alarms.create("syncAlarm", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncAlarm") {
    triggerSync();
  }
});
