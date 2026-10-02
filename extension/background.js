const BACKEND_INGEST_URL = "http://localhost:3000/api/usage/events";

// Offline Event Ingestion Queue backed by chrome.storage.local
let syncInProgress = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TELEMETRY_EVENT") {
    queueEvent(message.event);
    sendResponse({ status: "queued" });
  }
  return true;
});

async function queueEvent(event) {
  // Client-side Privacy Compliance check: strictly double check that prompts/responses are never stored
  const sanitized = sanitizeEvent(event);
  
  chrome.storage.local.get({ eventQueue: [] }, (data) => {
    const queue = data.eventQueue;
    queue.push(sanitized);
    chrome.storage.local.set({ eventQueue: queue }, () => {
      console.log("[Background] Telemetry event queued locally.");
      triggerSync();
    });
  });
}

function sanitizeEvent(event) {
  const clean = { ...event };
  const banned = ["prompt", "response", "clipboard", "keystroke", "screenshot", "file", "document", "chatHistory"];
  
  banned.forEach((key) => {
    delete clean[key];
    if (clean.metadata) {
      delete clean.metadata[key];
    }
  });

  return clean;
}

async function triggerSync() {
  if (syncInProgress) return;
  syncInProgress = true;

  chrome.storage.local.get({ eventQueue: [], pairingToken: null }, async (data) => {
    const queue = data.eventQueue;
    if (queue.length === 0) {
      syncInProgress = false;
      return;
    }

    console.log(`[Background] Attempting to sync ${queue.length} events...`);
    
    try {
      const payload = {
        organizationId: data.pairingToken ? data.pairingToken.organizationId : "novatech-labs-uuid",
        events: queue
      };

      const res = await fetch(BACKEND_INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        console.log("[Background] Ingestion sync successful.");
        chrome.storage.local.set({ eventQueue: [], lastSyncTime: new Date().toISOString() });
      } else {
        console.warn("[Background] Server returned error status during sync.");
      }
    } catch (err) {
      console.error("[Background] Sync connection failed (offline mode):", err);
    } finally {
      syncInProgress = false;
    }
  });
}

// Check every 10 seconds for any pending syncs
chrome.alarms.create("syncAlarm", { periodInMinutes: 0.1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncAlarm") {
    triggerSync();
  }
});
