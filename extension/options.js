document.addEventListener("DOMContentLoaded", () => {
  const tokenInput = document.getElementById("token");
  const saveBtn = document.getElementById("save-btn");
  const statusDiv = document.getElementById("status");

  // Load existing pairing enrollment token
  chrome.storage.local.get({ pairingToken: null }, (data) => {
    if (data.pairingToken) {
      tokenInput.value = data.pairingToken.token || "";
      statusDiv.textContent = `Paired with organization: ${data.pairingToken.organizationName || "Unknown"}`;
      statusDiv.className = "status-msg success";
    }
  });

  saveBtn.addEventListener("click", () => {
    const rawVal = tokenInput.value.trim();
    if (!rawVal) {
      statusDiv.textContent = "Please enter a valid token.";
      statusDiv.className = "status-msg error";
      return;
    }

    // In development mode, we parse a simple mock JSON token
    try {
      const pairingToken = {
        token: rawVal,
        organizationId: "novatech-labs-uuid",
        organizationName: "NovaTech Labs",
        employeeId: "emp-1",
        workspaceId: "ws-openai"
      };

      chrome.storage.local.set({ pairingToken }, () => {
        statusDiv.textContent = "Success! Extension paired successfully.";
        statusDiv.className = "status-msg success";
      });
    } catch (e) {
      statusDiv.textContent = "Failed to parse token.";
      statusDiv.className = "status-msg error";
    }
  });
});
