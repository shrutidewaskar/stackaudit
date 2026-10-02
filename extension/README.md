# StackAudit Browser Intelligence Extension

A privacy-first browser extension for Chromium/Chrome that tracks metadata usage events of supported corporate AI tools.

## Architecture

* **`manifest.json`**: Configures host matching rules restricted strictly to supported AI domains.
* **`background.js`**: Receives messages from content scripts, schedules batch synchronization alarms, and manages offline-first queues.
* **`content.js`**: Automatically detects visible tabs, mouse interactions, and keystroke activity rates to calculate active/idle sessions.
* **`popup.html` / `popup.js`**: Action popup showing paired organization names, sync status logs, and Pause/Resume triggers.
* **`options.html` / `options.js`**: Settings page enabling simple paired enrollment token integrations.

## Developer Installation Instructions

1. Open **Chrome** and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in top right).
3. Click **Load unpacked** (top left).
4. Select the `extension/` directory of this project repository.
5. The extension is now successfully installed. Open `options.html` by clicking "Details" -> "Extension Options" to pair with a StackAudit organization.
