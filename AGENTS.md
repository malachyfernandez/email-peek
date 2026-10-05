# Agent notes

## Version bumps

Every shipped change bumps the version in **5 places** — a test fails if they
drift, so run tests after bumping:

- `theme.json` → `"version"` (Sine compares `updatedAt` for updates, not
  `version` — bump `updatedAt` to a full ISO timestamp every release too)
- `const VERSION = "..."` in each of `gmail-peek.uc.js`, `proton-peek.uc.js`,
  `outlook-peek.uc.js`, `icloud-peek.uc.js`

## Deploying / verifying changes

Zen does NOT hot-reload these scripts, and the repo copies are not the files
Zen runs. After any change:

1. `node --test proton-peek.test.mjs` (also `node --check` each `.uc.js`)
2. Quit Zen fully (`osascript -e 'tell application "Zen" to quit'`)
3. Copy all four `.uc.js` files (and `theme.json`/`preferences.json` if
   changed) into:
   `~/Library/Application Support/zen/Profiles/xxu1j6kr.Default (release)/chrome/sine-mods/gmail-peek/`
   (adding a script to `theme.json` also requires patching
   `chrome/sine-mods/mods.json` — see CONTEXT.md)
4. Relaunch Zen (`open -a Zen`)
5. Verify in `<profile>/email-peek.log` — fresh `boot:` lines should show the
   new version.

## Diagnostics page

- Shared singleton `window.__EPDiag` is duplicated in all four scripts — keep
  the copies identical (the test suite asserts the core exists in each).
- Page opens as a `data:` URL (primary; `file://` rendering is unreliable in
  Zen). Report text also flushes to `<profile>/email-peek.log`.
- Support email opens a Gmail compose URL — deliberately **not** `mailto:`,
  which hands off to the OS handler (and may open a different browser). Keep
  the URL body short; the click copies the full report for pasting.
