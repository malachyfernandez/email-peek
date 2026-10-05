


# Reading this captured example

- **Gmail is working in this capture.** Near the end, the feed request returns HTTP `200` with the expected `feed` signature; `fullcount` and `entries` are both `0`. The badge paints `0`, and the popup renders `count: 0` with `error: null`. That is a successful refresh of an inbox with no unread messages, not a failed fetch.
- All four provider scripts report as loaded. The capture contains no explicit `error`-tagged event or Gmail request/parse failure. The `sine: false` / `fxAutoconfig: false` values do not override that evidence: those installer checks are best-effort hints, while `providersLoaded` confirms the scripts initialized. The old `Darwin undefined` value is a missing OS-version field, not a provider error; updated reports omit missing OS details instead of printing `undefined`.
- The repeated `scan: pinned/essential tab not claimed` lines are noisy output from this older log format. Each provider inspected every unrelated pinned tab, so these lines mostly mean "not this mail provider," not "broken." The old `tab scan` summaries also omit the provider name. The updated logger now reports provider-labelled match counts only when they change and only calls out unmatched tabs whose URL looks like that provider.
- `hover: unresolved hover target` is Zen tab-structure tracing, not a thrown error. This capture later shows the mail tab being hovered and the fetch/render success above.

---

Email Peek Diagnostics v1.7.2
generated Thu Oct 01 2026 10:33:06 GMT-0400 (Eastern Daylight Time) — reporting a problem? Use the buttons below.
Email logs to developer Select all & copy GitHub malachyf.com
Environment
{
 "mod": "Email Peek v1.7.2",
 "providersLoaded": {
  "gmail-peek": "1.7.2",
  "proton-peek": "1.7.2",
  "outlook-peek": "1.7.2",
  "icloud-peek": "1.7.2"
 },
 "app": "Zen 1.22.3b build 20260922050124",
 "os": "Darwin undefined (aarch64-gcc3)",
 "privateWindow": false,
 "locale": "en-US",
 "timezone": "America/New_York",
 "dpi": 2,
 "screen": "1800x1169, window 1722x1040",
 "compactMode": false,
 "fxAutoconfig": false,
 "sine": false,
 "prefs": {
  "mod.icloudpeek.max_items": "6",
  "mod.outlookpeek.account": "0",
  "mod.protonpeek.hover_delay": "400",
  "mod.protonpeek.max_items": "6",
  "mod.gmailpeek.hover_delay": "400",
  "mod.gmailpeek.max_items": "6",
  "mod.outlookpeek.max_items": "6",
  "mod.icloudpeek.hover_delay": "400",
  "mod.outlookpeek.hover_delay": "400",
  "mod.protonpeek.hide_delay": "150",
  "mod.gmailpeek.hide_delay": "150",
  "mod.outlookpeek.hide_delay": "150",
  "mod.gmailpeek.account": "0",
  "mod.protonpeek.account": "0",
  "mod.icloudpeek.hide_delay": "150",
  "mod.gmailpeek.debug": true,
  "mod.gmailpeek.show_badge": true,
  "mod.icloudpeek.enabled": true,
  "mod.icloudpeek.show_badge": true,
  "mod.outlookpeek.enabled": true,
  "mod.outlookpeek.show_badge": true,
  "mod.protonpeek.enabled": true,
  "mod.protonpeek.show_badge": true
 },
 "tabs": [
  {
   "url": "https://gemini.google.com/app/de15e12e5cdf863c",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://calendar.google.com/calendar/u/0/r/week",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://www.gradescope.com/",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://wolfware.ncsu.edu/login/",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://moodle-courses2527.wolfware.ncsu.edu/login/index.php",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://mail.google.com/mail/u/0/",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://mail.google.com/mail/u/1/",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit",
   "pinned": true,
   "essential": true
  },
  {
   "url": "https://moodle-courses2527.wolfware.ncsu.edu/course/view.php",
   "pinned": true,
   "essential": false
  },
  {
   "url": "https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit",
   "pinned": true,
   "essential": false
  },
  {
   "url": "https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit",
   "pinned": true,
   "essential": false
  },
  {
   "url": "https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit",
   "pinned": true,
   "essential": false
  },
  {
   "url": "https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit",
   "pinned": true,
   "essential": false
  },
  {
   "url": "https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit",
   "pinned": true,
   "essential": false
  },
  {
   "url": "https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit",
   "pinned": true,
   "essential": false
  },
  {
   "url": "about:blank",
   "pinned": true,
   "essential": false
  },
  {
   "url": "https://sineorg.github.io/store/",
   "pinned": true,
   "essential": false
  },
  {
   "url": "https://github.com/YashjitPal/Arc-2.0",
   "pinned": true,
   "essential": false
  },
  {
   "url": "about:blank",
   "pinned": false,
   "essential": false
  },
  {
   "url": "https://www.google.com/search",
   "pinned": false,
   "essential": false
  },
  {
   "url": "https://www.reddit.com/r/zen_browser/comments/1wtlht7/arcstyle_gmail_preview_when_you_hover_your_pinned/",
   "pinned": false,
   "essential": false
  },
  {
   "url": "https://www.reddit.com/media",
   "pinned": false,
   "essential": false
  },
  {
   "url": "https://www.desmos.com/calculator",
   "pinned": false,
   "essential": false
  },
  {
   "url": "https://www.google.com/search",
   "pinned": false,
   "essential": false
  }
 ]
}
Log
[14:32:58.209] hover: enter | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:32:58.234] hover: leave | {"tab":{"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}}
[14:32:58.630] hover: unresolved hover target | {"localName":"hbox","cls":"zen-essentials-container zen-workspace-tabs-section","near":"hbox"} (x24)
[14:32:59.993] hover: enter | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:00.009] hover: leave | {"tab":{"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:00.822] scan: tab scan | {"total":25,"claimed":2}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:00.822] scan: tab scan | {"total":25,"claimed":0}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:00.822] scan: tab scan | {"total":25,"claimed":0}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:00.822] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:00.822] scan: tab scan | {"total":25,"claimed":0}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:00.826] scan: tab scan | {"total":25,"claimed":2}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:00.826] scan: tab scan | {"total":25,"claimed":0}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:00.826] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:00.827] scan: tab scan | {"total":25,"claimed":0}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:00.827] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:00.827] scan: tab scan | {"total":25,"claimed":0}
[14:33:02.351] hover: unresolved hover target | {"localName":"hbox","cls":"zen-essentials-container zen-workspace-tabs-section","near":"hbox"} (x8)
[14:33:03.063] hover: enter | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.072] hover: leave | {"tab":{"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.642] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.642] scan: tab scan | {"total":25,"claimed":2}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":2}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":2}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":2}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":2}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":2}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.643] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.643] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":2}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":2}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":0}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://gemini.google.com/app/de15e12e5cdf863c","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://calendar.google.com/calendar/u/0/r/week","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://annas-archive.gl/md5/4321e1522f7e4417d69fbb6e681599ef","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://www.gradescope.com/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://wolfware.ncsu.edu/login/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/login/index.php","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1oC2EcphceaMUGsXENalhExVrjstaLJefQhM9VHEuCkk/edit","pinned":true,"essential":true}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://moodle-courses2527.wolfware.ncsu.edu/course/view.php","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/spreadsheets/d/1dI-xzdQSkGmK1CjdoFTLDi33yq9UKJ12AEK3hn-0XTg/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1LJkzwzD39Ev5Dy9wY6-j99JdLHbNyH6WO9qXWY15VZo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1-Oa2_3IyWe26bPPU_pOr2HZQf1VsWw_9t9FpJiVRaWU/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/1HDwuH0U_ClQp2R7unCRtRrlgbJc4qDFrsBEXq73WWGo/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/10Hv9mEOU2_wLEKXP5qsFxZ9BhYMn6zBWehARRCVcJt8/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://docs.google.com/document/d/11OwaGb0LQxh4mWVFG9f3wUK-9jqcXLubbyFyNZ4PHI4/edit","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"about:blank","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://sineorg.github.io/store/","pinned":true,"essential":false}
[14:33:03.644] scan: pinned/essential tab not claimed | {"url":"https://github.com/YashjitPal/Arc-2.0","pinned":true,"essential":false}
[14:33:03.644] scan: tab scan | {"total":25,"claimed":0}
[14:33:04.434] hover: unresolved hover target | {"localName":"hbox","cls":"zen-essentials-container zen-workspace-tabs-section","near":"hbox"} (x16)
[14:33:04.459] hover: enter | {"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}
[14:33:04.584] hover: leave | {"tab":{"url":"https://mail.google.com/mail/u/1/","pinned":true,"essential":true}}
[14:33:04.584] hover: unresolved hover target | {"localName":"hbox","cls":"zen-essentials-container zen-workspace-tabs-section","near":"hbox"} (x8)
[14:33:04.609] hover: enter | {"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}
[14:33:05.010] popup: show | {"acct":"0","cached":false}
[14:33:05.016] feed: get | {"acct":"0","force":true}
[14:33:05.016] feed: request | {"acct":"0","url":"https://mail.google.com/mail/u/0/feed/atom","jar":false,"tp":false}
[14:33:05.381] feed: response | {"acct":"0","status":200,"ms":364,"ct":"text/xml; charset=UTF-8","len":353,"sig":"feed","fullcount":"0","entries":0}
[14:33:05.381] badge: paint | {"count":0,"tab":{"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}}
[14:33:05.382] render: paint | {"acct":"0","entries":0,"count":0,"error":null}
[14:33:05.829] hover: leave | {"panelState":"open","tab":{"url":"https://mail.google.com/mail/u/0/","pinned":true,"essential":true}}
This report is also written to <profile>/email-peek.log continuously.
