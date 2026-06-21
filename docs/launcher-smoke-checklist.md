# Launcher Smoke Checklist

Use this developer-facing checklist to manually verify the shared launcher behavior across standalone and dashboard preview surfaces.

## General Flow
- [ ] Sign in with Google.
- [ ] Run audit.
- [ ] Open `/launcher`.
- [ ] Confirm Pages-enabled sites appear.
- [ ] Move a tile.
- [ ] Refresh the page.
- [ ] Confirm persisted order remains.

## Dashboard Preview Flow
- [ ] Open a Dashboard result (e.g. latest audit).
- [ ] Open the "Launcher" tab.
- [ ] Confirm the exact same order from the standalone page appears.
- [ ] Open `/results/:auditId/launcher` directly.
- [ ] Confirm saved audit preview appears.
- [ ] Move a tile in the dashboard preview.
- [ ] Refresh `/launcher`. Confirm order synced.

## Edge Cases
- [ ] Confirm clicking a tile opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).
- [ ] Sign out and select "Continue as Guest (In-Memory)".
- [ ] Run an audit as guest.
- [ ] Open the Launcher tab in Dashboard.
- [ ] Confirm the anonymous user sees the expected "Guest launcher is available after a persisted audit..." limitation message.
- [ ] Open Network DevTools and confirm no external favicon service requests are expected (icons should be generated locally).
- [ ] Inspect Firestore `settings/launcherLayout` document and confirm it contains only ordered IDs / metadata, not audit payloads or secrets.

## Launcher Icon Caching & Fallback Visual Affordances
- [ ] **Observe Rendering Priority Sequence**:
  1. High: Instantly loads secure Base64 data URLs from the Firestore `launcherIconCache` collection.
  2. Medium: Falls back to direct `pwaIconUrl` if loaded and cached is empty.
  3. Low: Falls back to direct `faviconUrl` if PWA icon is absent/failing.
  4. Full Fallback: Renders the circular warm amber fallback initial badge.
- [ ] **Verify No Tiny Text Labels**: Confirm that no tiny `"CACHED"`, `"PWA"`, or any other status text stickers or badges are overlayed on launcher tile images.
- [ ] **Subtle Visual Cues**: Inspect elements or visually observe the circular tile wrappers:
  - **Cached Icons**: Displayed in a sleek circular outline with a subtle indigo/blue-tinted circular background and border treatment (`border-2 border-indigo-500/30 bg-indigo-50/40 dark:border-indigo-500/20 dark:bg-indigo-950/30 p-1`).
  - **Direct PWA Icons**: Displayed in a sleek circular outline with a subtle emerald-tinted circular background and border treatment (`border-2 border-emerald-500/30 bg-emerald-50/45 dark:border-emerald-500/20 dark:bg-emerald-950/25 p-1`).
  - **Direct Favicon Icons**: Displayed in a sleek circular outline with a neutral slate/white circular background and border treatment (`border border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50 p-1`).
  - **Generated Fallback Initial**: Displayed with a distinct warm amber backdrop initial (`bg-amber-500/10 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/10`) that never implies cache or PWA statuses.
- [ ] **Verify Path Isolation**: Confirm that Google user icon cache paths and anonymous session icon cache paths are securely isolated under their respective tenant namespaces.
