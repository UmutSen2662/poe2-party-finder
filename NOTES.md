# NOTES For Future Reference

## 🔴 1. Path of Exile OAuth Authentication in Tauri
**Why we need to do this:**
You cannot easily or securely do OAuth (like GGG's login) directly inside a Tauri desktop webview. Security policies often block it, and users generally don't trust typing their game passwords into custom app windows. We must open the user's default system browser (Chrome, Firefox, etc.) to handle the login, then securely pass the success token back into our desktop app.

**How to do this (Two Options):**

* **Option A: Temporary Localhost Server (Recommended):**
    Right before opening the system browser, the Tauri Rust backend spins up a tiny, temporary HTTP server on a random open port (e.g., `http://localhost:45678`). We pass this localhost URL to GGG as the "Redirect URI". The browser finishes login, redirects to our temporary localhost server with the auth token, the Rust backend grabs the token, passes it to the React frontend, and immediately shuts the temporary server down. 
    *Pros:* Extremely reliable, works on all OS without custom registry edits.

* **Option B: Custom Deep Linking (Protocol URI):**
    We register a custom protocol with the OS (e.g., `poe2-service://auth`). We open the browser, the user logs in, and the redirect URI points to `poe2-service://auth?token=12345`. The OS intercepts this and focuses our Tauri app, passing the URL parameters to it.
    *Pros:* No background server needed. *Cons:* OS-level protocol registration can be finicky on Windows.

## 🔵 2. Aggressive WebSocket Reconnection State
**Why we need to do this:**
Tauri desktop apps get minimized, OS background throttling kicks in, and user internet connections blip. If a user is waiting in a queue and their WebSocket connection drops silently, the Host might "Accept" them, but their UI will never update to show the "One-Click Whisper" button.

**How to do this:**
1.  **Silent Reconnection:** Use a robust WebSocket wrapper on the frontend (like `partysocket` or just solid reconnect logic) that constantly tries to ping the Elysia backend if the connection drops.
2.  **State Sync on Reconnect:** When the frontend detects that a WebSocket connection was lost and successfully re-established, it MUST trigger a TanStack Query refetch of the user's current queue status. We cannot assume no events happened while they were disconnected.