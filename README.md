![Gmail Peek](cover.jpg)

# Gmail Peek

Arc-style Gmail preview for Zen Browser. Hover your pinned/essential Gmail
tab and get a popup with your recent unread emails — sender, subject,
snippet, and how long ago it arrived. Click an email to open it in the tab,
or hit `+` to start a compose.

## How it works

- Fetches `https://mail.google.com/mail/u/N/feed/atom` from the browser's
  chrome context. The request uses your existing Google session cookies —
  **no API key, no OAuth setup**.
- **Multi-account**: the account index is read from each tab's own URL
  (`/u/0/`, `/u/1/`...), so hovering different pinned Gmail tabs previews
  the right inbox. `mod.gmailpeek.account` is only a fallback for tabs
  whose URL carries no `/u/N/`.
- The feed only contains **unread** mail, so the preview mirrors what Arc
  shows.
- Bonus: an unread-count badge on the tab icon (toggleable), refreshed on
  every hover and every 2.5 minutes.

## Install

1. Install [Sine](https://github.com/CosmoCreeper/Sine) (the JS mod loader
   for Zen/Firefox forks — no browser recompile needed).
2. In Zen: `Settings → Sine` → paste this repo's URL into the install
   field — or find **Gmail Peek** on the
   [Sine marketplace](https://sineorg.github.io/store/).
3. Pin Gmail (or drag it to Essentials), hover it.

## Requirements
- Gmail pinned as a **pinned tab** or an **essential**.
- Gmail signed in **in the default (non-container) context** — the feed
  request sends cookies from the default cookie jar. If you keep Gmail in a
  Firefox container, the request can't authenticate and the popup will show
  a sign-in prompt instead.

## Settings

Configurable in Sine → Mod Settings (or `about:config`):

| Pref | Default | What |
| --- | --- | --- |
| `mod.gmailpeek.account` | `0` | Fallback account index when a tab URL has no `/u/N/` |
| `mod.gmailpeek.max_items` | `6` | Emails shown in the popup |
| `mod.gmailpeek.hover_delay` | `400` | ms before the preview opens |
| `mod.gmailpeek.hide_delay` | `150` | ms before the preview closes on mouse-out |
| `mod.gmailpeek.show_badge` | `true` | Unread badge on the tab icon |
| `mod.gmailpeek.debug` | `true` | Log to Browser Console (Cmd+Shift+J) |

## Known limitations

- Container-isolated Gmail sessions can't be read via the Atom feed
  (cookies live in the container jar). Would need the Gmail API + OAuth
  variant.
- Zen's native tab tooltip is suppressed via `popupshowing` interception;
  if a Zen update changes tooltip plumbing it may reappear alongside the
  panel.
- Zen updates can wipe the Sine bootloader — reinstall Sine if mods vanish.
