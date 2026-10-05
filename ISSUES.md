# Issue tracker

User reports, mostly from the [r/zen_browser thread](https://www.reddit.com/r/zen_browser/comments/1wtlht7/).
Check mark = taken care of; anything else still needs work or confirmation.

## Open

| Who | Report | Status |
|-----|--------|--------|
| not_RangeRocket5453 | "not working for me", up to date, reinstalled | Open — needs a v1.7.3+ support report to diagnose |
| Skyz786 | same "not working" | Open — needs a v1.7.3+ support report to diagnose |
| vak2710 | `Couldn't load inbox (HTTP 401)`, logged in, no containers, reload doesn't help | Open — 401 despite a valid session; cookie-jar/container fixes may have addressed it, needs a support report to confirm |
| MisterUltimate | "plz fix nested corner radius" | Open — no fix identified |

## Taken care of

| Who | Report | Resolution |
|-----|--------|------------|
| Apprehensive_Rope382 | Outlook support? | ✅ Shipped (outlook-peek.uc.js) |
| FarSir3000 | iCloud Mail support? | ✅ Shipped (icloud-peek.uc.js) |
| lightningdashgod | Proton Mail support? | ✅ Shipped (proton-peek.uc.js) — DOM scraping, more fragile than Gmail by design |
| ShailAntani7 | Auto-hiding sidebar collapses when preview opens | ✅ Fixed — replied "should be live on github" |
| lordruzki3084 | Container/workspace credential question | ✅ Answered — each tab's own cookie jar is used |
| Anti_simp_1001 | Maintenance/abandonment concern | ✅ Answered — directed to email for bug reports |

## Notes

- v1.7.3 added the about/support page (**Tools → About Email Peek**) with a
  one-click copyable support report and a Gmail-compose email action — the
  intended channel for "it doesn't work" reports.
- 401s with a valid session are the top open thread; suspects: container tabs,
  multi-account (`/u/N/`) mismatch, or cookie-jar routing.
