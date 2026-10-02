// StackAudit Extension Options Page: Enrollment & Backend Pairing

/**
 * Validates and normalizes the API base URL.
 * Requires HTTPS unless connecting to localhost/127.0.0.1 for local development.
 * Rejects embedded credentials, unsupported protocols, and malformed URLs.
 */
function validateAndNormalizeEndpoint(urlString) {
  if (!urlString || typeof urlString !== "string") {
    throw new Error("API URL cannot be empty.");
  }

  let url;
  try {
    url = new URL(urlString.trim());
  } catch {
    throw new Error("Invalid URL format. Please provide a valid URL (e.g. https://app.stackaudit.io).");
  }

  // Prevent embedded credentials (e.g. https://user:pass@example.com)
  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not permitted.");
  }

  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (url.protocol === "http:") {
    if (!isLocalhost) {
      throw new Error("Insecure HTTP is only permitted for localhost development. Production endpoints must use HTTPS.");
    }
  } else if (url.protocol !== "https:") {
    throw new Error(`Unsupported URL protocol '${url.protocol}'. Only HTTPS (or HTTP for localhost) is supported.`);
  }

  // Return normalized origin without trailing slashes or subpaths
  return url.origin;
}

document.addEventListener("DOMContentLoaded", () => {
  const apiUrlInput = document.getElementById("api-url");
  const tokenInput = document.getElementById("token");
  const saveBtn = document.getElementById("save-btn");
  const statusDiv = document.getElementById("status");

  // Load existing configuration
  chrome.storage.local.get({ apiBaseUrl: "http://localhost:3000", pairingToken: null }, (data) => {
    apiUrlInput.value = data.apiBaseUrl || "http://localhost:3000";
    if (data.pairingToken) {
      tokenInput.value = data.pairingToken.token || "";
      showStatus(`Active Pairing: ${data.pairingToken.organizationName || "Configured Organization"} (Org ID: ${data.pairingToken.organizationId})`, "success");
    }
  });

  saveBtn.addEventListener("click", async () => {
    const rawApiUrl = apiUrlInput.value.trim() || "http://localhost:3000";
    const rawToken = tokenInput.value.trim();

    if (!rawToken) {
      showStatus("Please enter an enrollment token.", "error");
      return;
    }

    let normalizedApiUrl;
    try {
      normalizedApiUrl = validateAndNormalizeEndpoint(rawApiUrl);
    } catch (err) {
      showStatus(`URL Validation Error: ${err.message}`, "error");
      return;
    }

    saveBtn.disabled = true;
    showStatus("Validating enrollment token with StackAudit server...", "success");

    try {
      // Validate token with backend /api/auth/enroll
      const enrollEndpoint = `${normalizedApiUrl}/api/auth/enroll`;
      const res = await fetch(enrollEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          token: rawToken
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error status ${res.status}`);
      }

      const result = await res.json();
      const pairingToken = {
        token: rawToken,
        organizationId: result.organizationId,
        organizationName: result.organizationName,
        employeeId: result.employeeId,
        enrolledAt: new Date().toISOString()
      };

      // Save valid enrollment to chrome.storage.local
      chrome.storage.local.set({
        apiBaseUrl: normalizedApiUrl,
        pairingToken: pairingToken,
        lastSyncStatus: "READY"
      }, () => {
        showStatus(`Success! Paired with "${result.organizationName}" (Org ID: ${result.organizationId})`, "success");
        saveBtn.disabled = false;
        
        // Trigger immediate background sync
        chrome.runtime.sendMessage({ type: "TRIGGER_SYNC" });
      });
    } catch (error) {
      console.error("Pairing error:", error);
      showStatus(`Enrollment Failed: ${error.message}`, "error");
      saveBtn.disabled = false;
    }
  });

  function showStatus(text, type) {
    statusDiv.textContent = text;
    statusDiv.className = `status-msg ${type}`;
    statusDiv.style.display = "block";
  }
});

