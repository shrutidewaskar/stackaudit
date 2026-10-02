// StackAudit Extension Popup UI Handler

document.addEventListener("DOMContentLoaded", () => {
  const statusBadge = document.getElementById("status-badge");
  const toggleBtn = document.getElementById("toggle-btn");
  const lastSyncSpan = document.getElementById("last-sync");

  // Load active extension state settings
  chrome.storage.local.get(
    { 
      monitoringEnabled: true, 
      lastSyncTime: "Never",
      lastSyncStatus: "IDLE",
      pairingToken: null 
    },
    (data) => {
      updateUI(data.monitoringEnabled, data.pairingToken, data.lastSyncStatus);
      if (data.lastSyncTime && data.lastSyncTime !== "Never") {
        lastSyncSpan.textContent = new Date(data.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } else {
        lastSyncSpan.textContent = "Never";
      }
    }
  );

  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get({ monitoringEnabled: true }, (data) => {
      const nextState = !data.monitoringEnabled;
      chrome.storage.local.set({ monitoringEnabled: nextState }, () => {
        chrome.storage.local.get({ pairingToken: null, lastSyncStatus: "IDLE" }, (d) => {
          updateUI(nextState, d.pairingToken, d.lastSyncStatus);
        });
      });
    });
  });

  function updateUI(enabled, pairingToken, syncStatus) {
    if (!pairingToken) {
      statusBadge.textContent = "Not Paired";
      statusBadge.className = "status-badge paused";
      toggleBtn.textContent = "Open Options to Pair";
      toggleBtn.onclick = () => {
        chrome.runtime.openOptionsPage();
      };
      return;
    }

    if (enabled) {
      statusBadge.textContent = syncStatus.startsWith("AUTH_ERROR") ? "Auth Error" : "Monitoring";
      statusBadge.className = syncStatus.startsWith("AUTH_ERROR") ? "status-badge paused" : "status-badge";
      toggleBtn.textContent = "Pause Monitoring";
      toggleBtn.className = "btn pause";
    } else {
      statusBadge.textContent = "Paused";
      statusBadge.className = "status-badge paused";
      toggleBtn.textContent = "Resume Monitoring";
      toggleBtn.className = "btn";
    }
  }
});
