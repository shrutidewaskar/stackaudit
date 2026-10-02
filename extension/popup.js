document.addEventListener("DOMContentLoaded", () => {
  const statusBadge = document.getElementById("status-badge");
  const toggleBtn = document.getElementById("toggle-btn");
  const lastSyncSpan = document.getElementById("last-sync");

  // Load active extension state settings
  chrome.storage.local.get(
    { monitoringEnabled: true, lastSyncTime: "Never" },
    (data) => {
      updateUI(data.monitoringEnabled);
      lastSyncSpan.textContent = data.lastSyncTime === "Never" ? "Never" : "Today " + new Date(data.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  );

  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get({ monitoringEnabled: true }, (data) => {
      const nextState = !data.monitoringEnabled;
      chrome.storage.local.set({ monitoringEnabled: nextState }, () => {
        updateUI(nextState);
      });
    });
  });

  function updateUI(enabled) {
    if (enabled) {
      statusBadge.textContent = "Monitoring";
      statusBadge.className = "status-badge";
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
