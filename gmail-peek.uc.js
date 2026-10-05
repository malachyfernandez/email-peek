// ==UserScript==
// @name           Gmail Peek
// @namespace      gmail-peek
// @description    Arc-style inbox preview when hovering a pinned/essential Gmail tab
// @version        1.4.0
// @author         malachyfernandez + Devin
// @include        main
// @ignorecache
// ==/UserScript==

// Runs in chrome://browser/content/browser.xhtml (privileged chrome context).
// Requires Sine (or fx-autoconfig). No Zen source modifications needed.

(() => {
  "use strict";

  if (window.gmailPeek) {
    return;
  }

  const XHTML = "http://www.w3.org/1999/xhtml";
  const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
  const TAG = "[gmail-peek]";
  // ---------- shared diagnostics ----------
  // Identical in every email-peek script: whoever loads first owns the
  // singleton on window.__EPDiag, so diagnostics survive even if sibling
  // scripts fail to boot. Consecutive repeats dedupe (xN), everything flushes
  // to <profile>/email-peek.log every few seconds and on unload, and "open"
  // renders the whole report into a real browser tab — plain HTML, plain
  // links, no chrome APIs required at click time.
  const EPDiag = (window.__EPDiag ||= (() => {
    const VERSION = "1.7.3";
    const CONTACT = {
      email: "malachyfernandez@gmail.com",
      github: "https://github.com/malachyfernandez/email-peek",
      site: "https://malachyf.com",
    };
    const MAX = 800;
    const lines = [];
    const loaded = {};
    let dirty = false, flushTimer = null;
    let uiDone = false, envLogged = false, hooked = false;

    const safe = fn => { try { return fn(); } catch { return undefined; } };
    const clip = (s, n = 300) => String(s).replace(/\s+/g, " ").slice(0, n);
    const stamp = t => t.toISOString().slice(11, 23);
    const esc = s => String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    function log(tag, msg, data) {
      let m = clip(msg);
      if (data !== undefined) {
        try { m += " | " + clip(JSON.stringify(data)); } catch {}
      }
      const last = lines[lines.length - 1];
      if (last && last.tag === tag && last.m === m) { last.n++; last.t = new Date(); }
      else lines.push({ t: new Date(), tag, m, n: 1 });
      if (lines.length > MAX) lines.splice(0, lines.length - MAX);
      dirty = true;
      if (!flushTimer) {
        flushTimer = setTimeout(() => { flushTimer = null; flush(); }, 3000);
      }
    }

    function tabInfo(tab) {
      const spec = safe(() => tab.linkedBrowser?.currentURI?.spec) ||
        safe(() => tab._zenPinnedInitialState?.entry?.url) || "";
      const ucid = safe(() => Number(tab.getAttribute("usercontextid"))) || 0;
      const container = safe(() =>
        ucid ? ContextualIdentityService.getPublicIdentityFromId(ucid)?.name : null);
      return {
        url: clip(spec.replace(/[?#].*$/, ""), 120) || "(blank)",
        pinned: !!safe(() => tab.pinned),
        essential: !!safe(() => tab.hasAttribute("zen-essential")),
        ucid: ucid || undefined,
        container: container || undefined,
      };
    }

    function env() {
      const e = {};
      e.mod = `Email Peek v${VERSION}`;
      e.providersLoaded = { ...loaded };
      e.app = safe(() => `${Services.appinfo.name} ${Services.appinfo.version} build ${Services.appinfo.appBuildID}`);
      e.zen = safe(() => Services.prefs.getCharPref("zen.version")) ||
        safe(() => Services.prefs.getCharPref("zen.browser.version"));
      e.os = safe(() => {
        const { OS, OSVersion, XPCOMABI } = Services.appinfo;
        return [OS, OSVersion, XPCOMABI && `(${XPCOMABI})`].filter(Boolean).join(" ") || undefined;
      });
      e.privateWindow = safe(() => PrivateBrowsingUtils.isWindowPrivate(window));
      e.locale = safe(() => Services.locale.appLocaleAsBCP47);
      e.timezone = safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
      e.dpi = safe(() => window.devicePixelRatio);
      e.screen = safe(() => `${window.screen.width}x${window.screen.height}, window ${window.innerWidth}x${window.innerHeight}`);
      e.compactMode = safe(() => document.documentElement.hasAttribute("zen-compact-mode"));
      e.fxAutoconfig = safe(() => typeof _uc !== "undefined" || typeof UC_API !== "undefined");
      e.sine = safe(() => typeof window.Sine !== "undefined" || typeof window.sine !== "undefined" ||
        !!document.getElementById("sine-settings"));
      e.prefs = safe(() => {
        const out = {};
        for (const name of Services.prefs.getChildList("mod.")) {
          if (/gmail|proton|outlook|icloud|peek/i.test(name)) {
            out[name] = Services.prefs.getPrefType(name) === Services.prefs.PREF_BOOL
              ? Services.prefs.getBoolPref(name)
              : Services.prefs.getPrefType(name) === Services.prefs.PREF_INT
                ? Services.prefs.getIntPref(name)
                : Services.prefs.getStringPref(name, "?");
          }
        }
        return out;
      });
      e.tabs = safe(() => [...gBrowser.tabs].map(tabInfo));
      return e;
    }

    function render() {
      return lines.map(l =>
        `[${stamp(l.t)}] ${l.tag}: ${l.m}${l.n > 1 ? ` (x${l.n})` : ""}`
      ).join("\n");
    }

    function fullText() {
      return [
        "== Email Peek support report ==",
        `generated ${new Date().toISOString()}`,
        "",
        "-- environment --",
        JSON.stringify(env(), null, 1),
        "",
        "-- how to read this report --",
        "A provider response with HTTP 200 and the expected format is a successful fetch; zero entries means no unread messages, not an error.",
        "Tab-detection summaries count pinned mail tabs matched by this provider. Other pinned tabs are unrelated and are intentionally omitted.",
        "For failures, follow hover/popup events through request/response and render; non-null error fields or explicit failure entries are the strongest signals.",
        "providersLoaded lists scripts that initialized here. Sine/autoconfig and OS-version fields are best-effort environment hints; a missing value alone does not mean a provider failed.",
        "",
        "-- log --",
        render() || "(empty)",
        "",
        `contact: ${CONTACT.email} · ${CONTACT.github} · ${CONTACT.site}`,
      ].join("\n");
    }

    function emailHref() {
      const body = [
        "[Paste the Email Peek support report here — it is copied when this link opens.]",
        "",
        "Explain the issue — attaching screenshots is recommended:",
        "",
      ].join("\n");
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT.email)}&su=${encodeURIComponent(`Email Peek support report v${VERSION}`)}&body=${encodeURIComponent(body)}`;
    }

    function html() {
      const envJson = esc(JSON.stringify(env(), null, 1));
      const logTxt = esc(render() || "(empty)");
      const reportTxt = esc(fullText());
      return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email Peek</title>
<style>
  :root{color-scheme:dark;font:15px/1.6 system-ui,-apple-system,sans-serif;background:#111318;color:#eff0f4}
  *{box-sizing:border-box} body{margin:0;padding:clamp(20px,5vw,56px) 20px 64px}
  main{max-width:820px;margin:auto} a{color:inherit} .eyebrow{color:#a9b8d6;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
  h1{font-size:clamp(34px,6vw,52px);letter-spacing:-.045em;line-height:1.08;margin:10px 0} h2{font-size:20px;letter-spacing:-.02em;margin:0 0 8px}
  p{color:#c4c8d2;margin:8px 0}.version{font-size:14px;font-weight:500;letter-spacing:0;color:#a9b8d6;vertical-align:middle}
  .intro{max-width:650px;font-size:17px;color:#c4c8d2}.links{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:26px 0 34px}
  .link{background:#1b202b;border:1px solid #303746;border-radius:12px;padding:17px 18px;text-decoration:none;transition:border-color .15s,transform .15s}
  .link:hover{border-color:#8297bd;transform:translateY(-1px)}.link strong{display:block;font-size:16px}.link span{display:block;color:#aeb5c4;font-size:13px;margin-top:2px}
  .support{border-top:1px solid #30343e;padding-top:28px;margin-top:18px}.actions{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 10px}
  .button{appearance:none;border:1px solid #3b465a;border-radius:8px;background:#252d3a;color:#f5f7fb;padding:10px 15px;font:600 14px system-ui;text-decoration:none;cursor:pointer}
  .button.primary{background:#315fae;border-color:#4777c7}.button:hover{filter:brightness(1.12)}#msg{align-self:center;color:#b9c9e4;font-size:13px}
  details{border-top:1px solid #30343e;padding:16px 0}summary{cursor:pointer;font-weight:650}details p{font-size:14px}
  pre{background:#0b0d11;border:1px solid #272b34;border-radius:9px;padding:15px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.55 ui-monospace,SFMono-Regular,monospace;color:#d8deea}
  .note{font-size:13px;color:#aeb5c4}.report-copy{position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0}
</style></head><body><main>
<div class="eyebrow">A Zen browser mod</div>
<h1>Email Peek <span class="version">v${VERSION}</span></h1>
<section aria-label="Links">
<div class="links">
  <a class="link" href="${esc(CONTACT.github)}" target="_blank" rel="noopener"><strong>GitHub ↗</strong><span>Source, releases, and issue tracking</span></a>
  <a class="link" href="${esc(CONTACT.site)}" target="_blank" rel="noopener"><strong>malachyf.com ↗</strong><span>More from the developer</span></a>
</div></section>
<section class="support" aria-labelledby="support-title"><h2 id="support-title">Something not working?</h2>
<p>Open a prefilled Gmail draft in Zen and the report is copied automatically.</p>
<div class="actions">
  <a class="button primary" id="email" href="${esc(emailHref())}" target="_blank" rel="noopener">Email a support report</a>
  <button class="button" id="copy" type="button">Copy report</button><span id="msg" role="status" aria-live="polite"></span>
</div>
<p class="note">The report includes app details, preferences, open tab URLs, and diagnostic events. Review it before sharing.</p>
</section>
<details><summary>Environment snapshot</summary><pre>${envJson}</pre></details>
<details><summary>Diagnostic log</summary><p>Read the log in sequence: tab detection → hover → popup/fetch → response → render. Repeated identical events may be collapsed as <code>(xN)</code>.</p><pre>${logTxt}</pre></details>
<textarea class="report-copy" id="report-copy" aria-hidden="true" tabindex="-1">${reportTxt}</textarea>
<script>
const field = document.getElementById("report-copy");
const msg = document.getElementById("msg");
function copyReport(sent) {
  field.focus(); field.select();
  let copied = false;
  try { copied = document.execCommand("copy"); } catch {}
  msg.textContent = copied
    ? (sent ? "Report copied. Paste it into the draft." : "Full report copied. Review it before sharing.")
    : "Copy was blocked. Open the Environment and Diagnostic log sections to select text manually.";
  field.setSelectionRange(0, 0); field.blur();
}
document.getElementById("copy").addEventListener("click", () => copyReport(false));
document.getElementById("email").addEventListener("click", () => copyReport(true));
<\/script></main></body></html>`;
    }

    function writePageFile() {
      const path =
        safe(() => PathUtils.join(PathUtils.profileDir, "email-peek-diag.html")) ||
        safe(() => ChromeUtils.importESModule("resource://gre/modules/PathUtils.sys.mjs")
          .PathUtils.join(
            ChromeUtils.importESModule("resource://gre/modules/PathUtils.sys.mjs").PathUtils.profileDir,
            "email-peek-diag.html"
          ));
      if (!path) throw new Error("profile path unavailable");
      const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      file.initWithPath(path);
      const fos = Cc["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Ci.nsIFileOutputStream);
      fos.init(file, 0x02 | 0x08 | 0x20, 0o644, 0);
      const cos = Cc["@mozilla.org/intl/converter-output-stream;1"]
        .createInstance(Ci.nsIConverterOutputStream);
      cos.init(fos, "UTF-8");
      cos.writeString(html());
      cos.close(); fos.close();
      return file;
    }

    function open() {
      log("diag", "open requested");
      // Primary: a data: URL — it renders immediately in Zen with no disk I/O.
      try {
        const page = "data:text/html;charset=utf-8," + encodeURIComponent(html());
        const tab = gBrowser.addTab(page, {
          triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
        });
        gBrowser.selectedTab = tab;
        log("diag", "opened diagnostics data: tab");
        return;
      } catch (e) { log("diag", "data open path failed", String(e)); }
      // Fallback: write a file and open it.
      try {
        const file = writePageFile();
        const uri = Cc["@mozilla.org/network/io-service;1"]
          .getService(Ci.nsIIOService).newFileURI(file).spec;
        openWebLinkIn(uri, "tab");
        log("diag", "opened diagnostics file:// tab");
      } catch (e) { log("diag", "open failed", String(e)); }
    }

    function copy() {
      try {
        Cc["@mozilla.org/widget/clipboardhelper;1"]
          .getService(Ci.nsIClipboardHelper)
          .copyString(fullText());
        log("diag", "logs copied to clipboard");
        return true;
      } catch (e) { log("diag", "clipboard copy failed", String(e)); return false; }
    }

    function writeFile() {
      try {
        const FU =
          safe(() => FileUtils) ||
          ChromeUtils.importESModule("resource://gre/modules/FileUtils.sys.mjs").FileUtils;
        const file = FU.getFile("ProfD", ["email-peek.log"]);
        const fos = Cc["@mozilla.org/network/file-output-stream;1"]
          .createInstance(Ci.nsIFileOutputStream);
        fos.init(file, 0x02 | 0x08 | 0x20, 0o644, 0); // write|create|truncate
        const cos = Cc["@mozilla.org/intl/converter-output-stream;1"]
          .createInstance(Ci.nsIConverterOutputStream);
        cos.init(fos, "UTF-8");
        cos.writeString(fullText());
        cos.close(); fos.close();
        return true;
      } catch { return false; }
    }

    async function flush() {
      if (!dirty) return;
      dirty = false;
      const text = fullText();
      const path = safe(() => PathUtils.join(PathUtils.profileDir, "email-peek.log"));
      for (const attempt of [
        // Bare globals — the proven pattern the actor writer already uses.
        () => IOUtils.writeUTF8(path, text),
        async () => {
          const { IOUtils: IO } = ChromeUtils.importESModule("resource://gre/modules/IOUtils.sys.mjs");
          const { PathUtils: PU } = ChromeUtils.importESModule("resource://gre/modules/PathUtils.sys.mjs");
          await IO.writeUTF8(PU.join(PU.profileDir, "email-peek.log"), text);
        },
      ]) {
        try { await attempt(); return; } catch {}
      }
      if (!writeFile()) {
        try { console.warn("[email-peek] diagnostics flush failed"); } catch {}
      }
    }

    function ensureUI() {
      if (uiDone) return;
      uiDone = true;
      // Tools menu item — out of the way, always in the menubar.
      try {
        const popup =
          document.getElementById("menu_ToolsPopup") ||
          document.querySelector("#menu_ToolsMenu menupopup") ||
          document.getElementById("tools-menu");
        if (popup) {
          const item = document.createXULElement("menuitem");
          item.id = "emailpeek-diag-item";
          item.setAttribute("label", "About Email Peek");
          item.addEventListener("command", () => open());
          popup.appendChild(item);
        }
      } catch {}
    }

    return {
      VERSION, CONTACT, log, open, copy, render, fullText, env, flush, tabInfo, html,
      boot(provider) {
        if (loaded[provider]) return;
        loaded[provider] = VERSION;
        if (!envLogged) {
          envLogged = true;
          log("env", "environment", env());
        }
        log("boot", `${provider} initialized`, { v: VERSION });
        safe(() => ensureUI());
        // Flush at boot too — don't wait for the 3s timer — so a crash or
        // early unload can't lose the startup snapshot.
        try { flush(); } catch {}
        if (!hooked) {
          hooked = true;
          safe(() => {
            window.addEventListener("error", ev => {
              if (/peek/i.test(String(ev.filename || ""))) {
                log("error", `${ev.message} @ ${String(ev.filename).split("/").pop()}:${ev.lineno}`);
              }
            }, true);
            window.addEventListener("unhandledrejection", ev => {
              const s = String(ev.reason?.stack || ev.reason || "");
              if (/peek/i.test(s)) log("error", "unhandled rejection", clip(s));
            });
            window.addEventListener("unload", () => writeFile(), { once: true });
          });
        }
      },
    };
  })());


  const pref = (name, fallback) => {
    try {
      switch (Services.prefs.getPrefType(name)) {
        case Services.prefs.PREF_STRING:
          return Services.prefs.getStringPref(name);
        case Services.prefs.PREF_INT:
          return Services.prefs.getIntPref(name);
        case Services.prefs.PREF_BOOL:
          return Services.prefs.getBoolPref(name);
      }
    } catch {}
    return fallback;
  };
  const sPref = (n, f) => String(pref(n, f));
  const iPref = (n, f) => {
    const v = parseInt(pref(n, f), 10);
    return Number.isFinite(v) ? v : f;
  };
  const bPref = (n, f) => {
    const v = pref(n, f);
    return typeof v === "boolean" ? v : String(v) === "true";
  };

  // Default account index when a tab's URL doesn't carry /u/N/.
  const defaultAccount = () =>
    sPref("mod.gmailpeek.account", "0").trim() || "0";
  const feedUrl = acct =>
    `https://mail.google.com/mail/u/${encodeURIComponent(acct)}/feed/atom`;
  const inboxUrl = acct =>
    `https://mail.google.com/mail/u/${encodeURIComponent(acct)}/#inbox`;
  const composeUrl = acct =>
    `https://mail.google.com/mail/u/${encodeURIComponent(acct)}/#inbox?compose=new`;

  const el = (tag, cls, text) => {
    const node = document.createElementNS(XHTML, tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  // innerHTML doesn't reliably namespace <svg> inside chrome docs, so icons
  // are built explicitly in the SVG namespace.
  const SVGNS = "http://www.w3.org/2000/svg";
  const makeIcon = (paths, size, strokeWidth = 1.7, viewBox = size) => {
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", `0 0 ${viewBox} ${viewBox}`);
    for (const d of paths) {
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke", "currentColor");
      p.setAttribute("stroke-width", strokeWidth);
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      p.setAttribute("fill", "none");
      svg.appendChild(p);
    }
    return svg;
  };

  const timeAgo = iso => {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return "";
    const s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 90) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  // A tab element can be <tab class="tabbrowser-tab"> or a custom element —
  // accept either, plus shadow-retargeted descendants.
  const asTab = node => {
    for (let n = node; n && n.nodeType === Node.ELEMENT_NODE; n = n.parentNode) {
      const name = n.localName;
      if (
        name === "tab" ||
        name === "tabbrowser-tab" ||
        n.classList?.contains("tabbrowser-tab")
      ) {
        return n;
      }
      if (name === "tabs" || name === "tabbrowser-tabs" || name === "window") {
        return null;
      }
    }
    return null;
  };

  const CSS = `
    #gmailpeek-panel {
      --gp-bg: var(--panel-background, Field);
      --gp-fg: var(--panel-color, FieldText);
      --gp-dim: color-mix(in srgb, var(--gp-fg) 55%, transparent);
      --gp-hover: color-mix(in srgb, var(--gp-fg) 8%, transparent);
      --gp-border: color-mix(in srgb, var(--gp-fg) 15%, transparent);
    }
    #gmailpeek-panel .gp-box {
      width: 340px;
      font: menu;
      color: var(--gp-fg);
      padding: 4px 0 42px;
      position: relative;
    }
    #gmailpeek-panel .gp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--gp-dim);
      letter-spacing: 0.02em;
    }
    #gmailpeek-panel .gp-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 400;
    }
    #gmailpeek-panel .gp-refresh {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--gp-dim);
    }
    #gmailpeek-panel .gp-refresh:hover {
      background: var(--gp-hover);
      color: var(--gp-fg);
    }
    #gmailpeek-panel .gp-refresh.gp-spin svg {
      animation: gp-rot 0.7s linear infinite;
    }
    @keyframes gp-rot {
      to { transform: rotate(360deg); }
    }
    #gmailpeek-panel .gp-row {
      display: block;
      padding: 8px 14px;
      cursor: pointer;
      border-top: 1px solid transparent;
    }
    #gmailpeek-panel .gp-row:hover,
    #gmailpeek-panel .gp-row:focus-visible {
      background: var(--gp-hover);
    }
    #gmailpeek-panel .gp-topline {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    #gmailpeek-panel .gp-author {
      font-size: 13px;
      font-weight: 650;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #gmailpeek-panel .gp-time {
      font-size: 11px;
      color: var(--gp-dim);
      flex-shrink: 0;
    }
    #gmailpeek-panel .gp-subject {
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #gmailpeek-panel .gp-snippet {
      font-size: 12px;
      color: var(--gp-dim);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    #gmailpeek-panel .gp-compose {
      position: absolute;
      right: 10px;
      bottom: 8px;
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 50%;
      border: 1px solid var(--gp-border);
      background: var(--gp-bg);
      color: var(--gp-fg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    #gmailpeek-panel .gp-compose svg {
      display: block;
    }
    #gmailpeek-panel .gp-compose:hover {
      background: var(--gp-hover);
    }
    #gmailpeek-panel .gp-status {
      padding: 18px 14px;
      font-size: 13px;
      color: var(--gp-dim);
      text-align: center;
    }
    #gmailpeek-panel .gp-status.gp-link {
      cursor: pointer;
      text-decoration: underline;
    }
    #gmailpeek-panel .gp-refreshing {
      position: absolute;
      left: 14px;
      bottom: 15px;
      font-size: 11px;
      font-weight: 400;
      color: var(--gp-dim);
    }
  `;

  // Tab internals (.tab-icon-stack etc.) live in the tab's shadow DOM, so the
  // badge can't be styled with document CSS — it gets inline styles instead.
  const BADGE_STYLE =
    "position:absolute;top:-3px;right:-4px;min-width:14px;height:14px;" +
    "padding:0 3px;border-radius:7px;background:#e5222e;color:#fff;" +
    "font-size:9.5px;font-weight:700;line-height:14px;text-align:center;" +
    "pointer-events:none;box-sizing:border-box;";

  class GmailPeek {
    constructor() {
      this.hoverTab = null;
      this.currentTab = null;
      this.hoverTimer = null;
      this.hideTimer = null;
      this.suppressTooltip = false;
      this.panel = null;
      this.box = null;
      this.caches = new Map(); // account -> { t, data, error }
      this.inflights = new Map(); // account -> Promise
      this.gmailTabs = new Set();
      this.boundTabs = new WeakSet();
      this.refreshSequence = 0;
      this.refreshing = false;
      this.dotsTimer = null;
      this.refreshDots = 0;
      this._compactHold = null;
      this._weSetUserShow = false;

      this.onHoverIn = this.onHoverIn.bind(this);
      this.onHoverOut = this.onHoverOut.bind(this);
      this.onPopupShowing = this.onPopupShowing.bind(this);
      this.onClick = this.onClick.bind(this);
    }

    init() {
      EPDiag.boot("gmail-peek");
      const style = el("style");
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);

      // Delegated listeners — capture phase so shadow-DOM retargeting and
      // stopPropagation in Zen handlers can't eat them.
      for (const evt of ["mouseover", "pointerover"]) {
        document.addEventListener(evt, this.onHoverIn, true);
      }
      for (const evt of ["mouseout", "pointerout"]) {
        document.addEventListener(evt, this.onHoverOut, true);
      }
      document.addEventListener("popupshowing", this.onPopupShowing, true);

      // Watch for tabs being pinned/essential-ified after startup.
      this.observer = new MutationObserver(() => this.scanTabs());
      const roots = [
        gBrowser.tabContainer,
        document.querySelector(".zen-essentials-container"),
        document.documentElement,
      ];
      const root = roots.find(r => r) || document.documentElement;
      this.observer.observe(root, {
        subtree: true,
        attributes: true,
        attributeFilter: ["zen-essential", "pinned"],
        childList: true,
      });

      window.addEventListener("unload", () => this.destroy(), { once: true });

      this.badgeInterval = setInterval(() => this.refreshBadge(), 150000);

      this.scanTabs();
      this.refreshBadge();
      EPDiag.log("boot", "gmail-peek init complete", { claimed: this.gmailTabs.size });
    }

    destroy() {
      EPDiag.log("boot", "gmail-peek destroyed");
      clearInterval(this.badgeInterval);
      clearInterval(this.dotsTimer);
      clearTimeout(this.hoverTimer);
      clearTimeout(this.hideTimer);
      this.observer?.disconnect();
      document.removeEventListener("mouseover", this.onHoverIn, true);
      document.removeEventListener("pointerover", this.onHoverIn, true);
      document.removeEventListener("mouseout", this.onHoverOut, true);
      document.removeEventListener("pointerout", this.onHoverOut, true);
      document.removeEventListener("popupshowing", this.onPopupShowing, true);
      this.releaseCompactSidebar();
      this.panel?.remove();
      for (const tab of this.gmailTabs) {
        (tab.shadowRoot || tab).querySelector(".gmailpeek-badge")?.remove();
      }
      window.gmailPeek = null;
    }

    // ---------- tab detection ----------

    tabUrl(tab) {
      return (
        tab.linkedBrowser?.currentURI?.spec ||
        tab._zenPinnedInitialState?.entry?.url ||
        tab.getAttribute?.("data-zen-url") ||
        ""
      );
    }

    // Which Gmail account (/u/N/) a tab belongs to. Falls back to the
    // mod.gmailpeek.account pref when the URL carries no index.
    accountForTab(tab) {
      const specs = [
        tab._zenPinnedInitialState?.entry?.url,
        tab.linkedBrowser?.currentURI?.spec,
      ];
      for (const spec of specs) {
        const m = typeof spec === "string"
          ? spec.match(/mail\.google\.com\/mail\/u\/(\d+)\//)
          : null;
        if (m) return m[1];
      }
      return defaultAccount();
    }

    isGmailTab(tab) {
      if (!tab) return false;
      const pinnedLike =
        tab.pinned || tab.hasAttribute("zen-essential") || tab.hasAttribute("pinned");
      if (!pinnedLike) return false;
      const specs = [
        tab._zenPinnedInitialState?.entry?.url,
        tab.linkedBrowser?.currentURI?.spec,
      ];
      return specs.some(
        spec =>
          typeof spec === "string" &&
          /^https?:\/\/mail\.google\.com\//.test(spec)
      );
    }

    scanTabs() {
      let scanned = 0, claimed = 0;
      this.scanMisses ||= new WeakSet();
      for (const tab of gBrowser.tabs) {
        scanned++;
        if (!this.isGmailTab(tab)) {
          const info = EPDiag.tabInfo(tab);
          const candidate = /mail\.google\.com/i.test(info.url);
          if ((tab.pinned || tab.hasAttribute("zen-essential")) && candidate && !this.scanMisses.has(tab)) {
            EPDiag.log("scan", "pinned provider URL not matched", { provider: "Gmail", tab: info });
            this.scanMisses.add(tab);
          } else if (!candidate) this.scanMisses.delete(tab);
          continue;
        }
        this.scanMisses.delete(tab);
        claimed++;
        this.gmailTabs.add(tab);
        if (!this.boundTabs.has(tab)) {
          this.boundTabs.add(tab);
          // Direct listeners: belt & suspenders in case delegation misses.
          tab.addEventListener("mouseenter", this.onHoverIn, false);
          tab.addEventListener("mouseleave", this.onHoverOut, false);
        }
      }
      if (this.lastScanClaimed !== claimed) {
        this.lastScanClaimed = claimed;
        EPDiag.log("scan", "provider tab detection", { provider: "Gmail", scanned, matched: claimed });
      }
    }

    findGmailTabs() {
      return [...this.gmailTabs].filter(t => t.isConnected);
    }

    // ---------- hover handling ----------

    onHoverIn(e) {
      const tab = asTab(e.target) || asTab(e.currentTarget);
      if (!tab) {
        // Pointer over something tab-like that asTab can't resolve means the
        // markup changed under us — that's the "only a native tooltip shows"
        // failure users reported.
        const near = e.target?.closest?.(
          ".zen-essentials-container, tab, tabbrowser-tab, .tabbrowser-tab"
        );
        if (near) {
          EPDiag.log("hover", "unresolved hover target", {
            localName: e.target?.localName,
            cls: String(e.target?.className?.baseVal ?? e.target?.className ?? "").slice(0, 80),
            near: near.localName,
          });
        }
        return;
      }
      if (!this.isGmailTab(tab)) return;
      if (this.hoverTab === tab) return;
      this.enterTab(tab);
    }

    onHoverOut(e) {
      const tab = asTab(e.target) || asTab(e.currentTarget);
      if (!tab || tab !== this.hoverTab) return;
      if (e.relatedTarget && tab.contains(e.relatedTarget)) return;
      this.leaveTab();
    }

    enterTab(tab) {
      this.hoverTab = tab;
      this.currentTab = tab;
      this.stripTooltip(tab);
      this.suppressTooltip = true;
      clearTimeout(this.hoverTimer);
      EPDiag.log("hover", "enter", EPDiag.tabInfo(tab));
      this.hoverTimer = setTimeout(() => {
        this.show(tab).catch(err => {
          EPDiag.log("popup", "show failed", String(err?.message || err));
          console.warn(TAG, "show failed:", err);
        });
      }, iPref("mod.gmailpeek.hover_delay", 400));
    }

    leaveTab() {
      clearTimeout(this.hoverTimer);
      if (this.hoverTab) {
        EPDiag.log("hover", "leave", {
          panelState: this.panel?.state,
          tab: EPDiag.tabInfo(this.hoverTab),
        });
        this.restoreTooltip(this.hoverTab);
      }
      this.hoverTab = null;
      this.suppressTooltip = false;
      if (this.panel && this.panel.state !== "closed") this.scheduleHide();
    }

    stripTooltip(tab) {
      if (tab._gpTooltip === undefined) {
        tab._gpTooltip = {};
        for (const a of ["tooltip", "tooltiptext", "title", "data-tooltip"]) {
          if (tab.hasAttribute(a)) tab._gpTooltip[a] = tab.getAttribute(a);
        }
      }
      for (const a of Object.keys(tab._gpTooltip)) tab.removeAttribute(a);
    }

    restoreTooltip(tab) {
      if (!tab?._gpTooltip) return;
      for (const [a, v] of Object.entries(tab._gpTooltip)) {
        tab.setAttribute(a, v);
      }
      tab._gpTooltip = undefined;
    }

    onPopupShowing(e) {
      if (!this.suppressTooltip && !this.hoverTab) return;
      const t = e.target;
      if (t === this.panel || this.panel?.contains?.(t)) return;
      const id = `${t.localName || ""} ${t.id || ""} ${t.className || ""}`;
      const trigger =
        t.triggerNode || document.tooltipNode || null;
      const isOurs = trigger && (trigger === this.hoverTab ||
        this.hoverTab?.contains(trigger));
      if (/tooltip/i.test(id) || isOurs) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    // ---------- feed ----------

    // The mod fetches from the chrome context, whose cookie jar is the
    // DEFAULT one — a Gmail session that lives inside a container tab or a
    // private window is invisible to it and the feed 401s. Pass the tab's
    // own cookieJarSettings (and, when the tab is a live google page, its
    // principal so SameSite=Lax cookies attach) so the request rides the
    // same jar the tab uses.
    jarInitFor(tab) {
      const init = { credentials: "include", cache: "no-cache" };
      try {
        const bc = tab?.linkedBrowser?.browsingContext;
        const cjs =
          bc?.cookieJarSettings || bc?.currentWindowGlobal?.cookieJarSettings;
        if (cjs) {
          init.cookieJarSettings = cjs;
          const ucid = cjs.originAttributes?.userContextId;
          if (ucid) init._ucid = ucid; // diagnostic only
        }
        const tp = tab?.linkedBrowser?.contentPrincipal;
        if (tp && /(^|\.)google\.com$/i.test(tp.asciiHost || "")) {
          init.triggeringPrincipal = tp;
        }
      } catch {}
      return init;
    }

    async fetchFeed(acct, tab) {
      const init = this.jarInitFor(tab);
      const url = feedUrl(acct);
      const t0 = Date.now();
      EPDiag.log("feed", "request", {
        acct, url, ucid: init._ucid, jar: !!init.cookieJarSettings,
        tp: !!init.triggeringPrincipal,
      });
      let res;
      try {
        res = await fetch(url, init);
      } catch (e) {
        EPDiag.log("feed", "request threw", { acct, ms: Date.now() - t0, err: String(e) });
        throw e;
      }
      const ms = Date.now() - t0;
      const meta = {
        acct, status: res.status, ms,
        finalUrl: res.url !== url ? res.url.slice(0, 140) : undefined,
        ct: res.headers?.get?.("content-type") || undefined,
      };
      if (/ServiceLogin|accounts\.google\.com/.test(res.url)) {
        EPDiag.log("feed", "redirected to login", meta);
        throw new Error("signed-out");
      }
      if (!res.ok) {
        EPDiag.log("feed", "HTTP error", meta);
        throw new Error(
          `HTTP ${res.status}${init._ucid ? ` · ctx${init._ucid}` : ""}`
        );
      }
      const text = await res.text();
      const head = text.slice(0, 500);
      meta.len = text.length;
      meta.sig = /<feed[\s>]/.test(head) ? "feed"
        : /<html|<!doctype/i.test(head) ? "html"
        : /^[\s<]*\?xml/.test(head) ? "xml-other"
        : "other";
      const doc = new DOMParser().parseFromString(text, "text/xml");
      const parserErr = doc.getElementsByTagName("parsererror").length;
      if (parserErr) meta.parserError = true;
      const countEl = doc.getElementsByTagNameNS("*", "fullcount")[0];
      meta.fullcount = countEl?.textContent;
      meta.entries = doc.getElementsByTagNameNS("*", "entry").length;
      EPDiag.log("feed", "response", meta);
      if (parserErr) {
        throw new Error("signed-out");
      }
      const entries = [...doc.getElementsByTagNameNS("*", "entry")].map(e => ({
        title:
          e.getElementsByTagNameNS("*", "title")[0]?.textContent?.trim() ||
          "(no subject)",
        author:
          e.getElementsByTagNameNS("*", "name")[0]?.textContent?.trim() || "?",
        summary:
          e.getElementsByTagNameNS("*", "summary")[0]?.textContent?.trim() ||
          "",
        issued: e.getElementsByTagNameNS("*", "issued")[0]?.textContent || "",
        link:
          e.getElementsByTagNameNS("*", "link")[0]?.getAttribute("href") || "",
      }));
      const count =
        parseInt(countEl?.textContent ?? "", 10) || entries.length;
      return { count, entries };
    }

    getFeed(acct, force = false, tab = null) {
      let cache = this.caches.get(acct);
      if (!cache) {
        cache = { t: 0, data: null, error: null };
        this.caches.set(acct, cache);
      }
      if (!force && Date.now() - cache.t < 45000) {
        EPDiag.log("feed", "cache hit", { acct, ageMs: Date.now() - cache.t, hasData: !!cache.data, err: cache.error });
        return Promise.resolve(cache);
      }
      EPDiag.log("feed", "get", { acct, force });
      if (!this.inflights.has(acct)) {
        this.inflights.set(
          acct,
          this.fetchFeed(acct, tab)
            .then(data => {
              const t = Date.now();
              this.caches.set(acct, { t, refreshedAt: t, data, error: null });
            })
            .catch(err => {
              EPDiag.log("feed", "cache error", { acct, err: String(err?.message || err) });
              this.caches.set(acct, {
                t: Date.now(),
                refreshedAt: cache.refreshedAt || (cache.data ? cache.t : 0),
                data: null,
                error: String(err?.message || err),
              });
            })
            .then(() => this.caches.get(acct))
            .finally(() => {
              this.inflights.delete(acct);
            })
        );
      }
      return this.inflights.get(acct);
    }

    // ---------- panel ----------

    ensurePanel() {
      if (this.panel) return;
      const panel = document.createXULElement
        ? document.createXULElement("panel")
        : document.createElementNS(XUL, "panel");
      panel.id = "gmailpeek-panel";
      panel.setAttribute("noautofocus", "true");
      panel.setAttribute("consumeoutsideclicks", "false");
      panel.setAttribute("level", "top");
      const box = el("div", "gp-box");
      panel.appendChild(box);
      (document.getElementById("mainPopupSet") ||
        document.documentElement).appendChild(panel);
      panel.addEventListener("mouseenter", () => this.cancelHide());
      panel.addEventListener("mouseleave", () => this.scheduleHide());
      panel.addEventListener("popuphidden", () => this.onPanelHidden());
      box.addEventListener("click", this.onClick);
      this.panel = panel;
      this.box = box;
    }

    async show(tab) {
      this.ensurePanel();
      const acct = this.accountForTab(tab);
      const cached = this.caches.get(acct);
      EPDiag.log("popup", "show", { acct, cached: !!cached?.data, err: cached?.error });

      // Show what we have immediately — only cold cache gets the loader.
      if (cached?.data || cached?.error) {
        this.render(cached, acct);
      } else {
        this.renderLoading();
      }

      const r = tab.getBoundingClientRect();
      const sx = window.mozInnerScreenX ?? window.screenX;
      const sy = window.mozInnerScreenY ?? window.screenY;
      const x = sx + r.right + 6;
      const y = sy + r.top;
      if (this.panel.state === "closed") {
        try {
          this.panel.openPopupAtScreen(x, y, false);
        } catch (err) {
          EPDiag.log("popup", "openPopupAtScreen failed, trying anchor", String(err));
          console.warn(TAG, "openPopupAtScreen failed, trying anchor:", err);
          this.panel.openPopup(tab, "after_start", 4, 0, false, false);
        }
      }
      this.holdCompactSidebar();

      await this.refresh(tab);
    }

    // ---------- compact-mode sidebar hold ----------
    // Compact mode auto-hides the sidebar the moment the pointer leaves it —
    // which would vanish this popup too. zen-user-show is the attribute Zen
    // toggles for "user pinned this open": it is honoured only while compact
    // mode is active and no hover timer clears it.
    compactSidebar() {
      try {
        if (
          document.documentElement.getAttribute("zen-compact-mode") !== "true"
        )
          return null;
      } catch {
        return null;
      }
      return (
        window.gZenCompactModeManager?.sidebar ||
        document.getElementById("navigator-toolbox") ||
        null
      );
    }

    holdCompactSidebar() {
      const sb = this.compactSidebar();
      if (!sb || this._compactHold === sb) return;
      this._compactHold = sb;
      this._weSetUserShow = !sb.hasAttribute("zen-user-show");
      if (this._weSetUserShow) sb.setAttribute("zen-user-show", "true");
    }

    releaseCompactSidebar() {
      const sb = this._compactHold;
      if (!sb) return;
      this._compactHold = null;
      if (!this._weSetUserShow) return;
      this._weSetUserShow = false;
      // Pointer still on the strip? Hand back to Zen's own hover tracking so
      // it collapses naturally on mouse-leave instead of snapping shut.
      if (sb.matches(":hover")) {
        try {
          window.gZenCompactModeManager?._setElementExpandAttribute(sb, true);
        } catch {}
      }
      sb.removeAttribute("zen-user-show");
    }

    // Keep refresh progress and the last successful refresh time visible
    // alongside already-rendered content.
    setRefreshing(on) {
      this.refreshing = on;
      let status = this.box.querySelector(".gp-refreshing");
      if (!status) {
        status = el("div", "gp-refreshing");
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        this.box.appendChild(status);
      }
      clearInterval(this.dotsTimer);
      this.dotsTimer = null;
      const cache = this.currentTab && this.caches.get(this.accountForTab(this.currentTab));
      const refreshedAt = cache?.refreshedAt || (cache?.data && cache.t);
      const stamp = refreshedAt ? `Refreshed ${new Date(refreshedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : "";
      if (on) {
        this.refreshDots = 0;
        status.textContent = "Refreshing.";
        this.dotsTimer = setInterval(() => {
          const s = this.box?.querySelector(".gp-refreshing");
          if (!s) return;
          this.refreshDots = (this.refreshDots % 3) + 1;
          s.textContent = "Refreshing" + ".".repeat(this.refreshDots);
        }, 300);
      } else {
        status.textContent = cache?.error
          ? `Refresh failed${stamp ? " · " + stamp : ""}`
          : stamp;
      }
      this.box.querySelector(".gp-refresh")?.classList.toggle("gp-spin", on);
    }

    renderLoading() {
      this.box.replaceChildren(el("div", "gp-status", "Loading inbox…"));
    }

    render(cache, acct) {
      const box = this.box;
      box.replaceChildren();
      this.setRefreshing(this.refreshing);
      EPDiag.log("render", "paint", {
        acct,
        entries: cache?.data?.entries?.length,
        count: cache?.data?.count,
        error: cache?.error,
      });
      const max = iPref("mod.gmailpeek.max_items", 6);
      const multi = new Set(
        [...this.gmailTabs].map(t => this.accountForTab(t))
      ).size > 1;

      const header = el("div", "gp-header");
      header.appendChild(el("span", null, multi ? `Inbox · u/${acct}` : "Inbox"));
      const right = el("div", "gp-header-right");
      if (cache.data) {
        right.appendChild(
          el("span", null,
            cache.data.count > 0 ? `${cache.data.count} unread` : "all caught up")
        );
      }
      right.appendChild(this.refreshButton());
      const diagBtn = el("div", "gp-refresh");
      diagBtn.setAttribute("data-diag", "1");
      diagBtn.setAttribute("role", "button");
      diagBtn.setAttribute("aria-label", "About Email Peek");
      diagBtn.textContent = "i";
      right.appendChild(diagBtn);
      header.appendChild(right);
      box.appendChild(header);

      if (cache.error) {
        const msg =
          cache.error === "signed-out"
            ? "Couldn't reach your inbox — click to open Gmail and sign in."
            : `Couldn't load inbox (${cache.error}).`;
        const status = el("div", "gp-status gp-link", msg);
        status.setAttribute("data-open-inbox", "1");
        box.appendChild(status);
        box.appendChild(this.composeButton());
        return;
      }

      const { count, entries } = cache.data;
      if (!entries.length) {
        box.appendChild(el("div", "gp-status", "No unread mail"));
      } else {
        for (const entry of entries.slice(0, max)) {
          const row = el("div", "gp-row");
          row.setAttribute("data-link", entry.link);
          const top = el("div", "gp-topline");
          top.appendChild(el("span", "gp-author", entry.author));
          top.appendChild(el("span", "gp-time", timeAgo(entry.issued)));
          row.appendChild(top);
          row.appendChild(el("div", "gp-subject", entry.title));
          if (entry.summary) {
            row.appendChild(el("div", "gp-snippet", entry.summary));
          }
          box.appendChild(row);
        }
      }
      box.appendChild(this.composeButton());
    }

    composeButton() {
      const btn = el("div", "gp-compose");
      btn.setAttribute("data-compose", "1");
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-label", "Compose");
      btn.appendChild(makeIcon(["M6.5 2.5v8", "M2.5 6.5h8"], 13, 1.8));
      return btn;
    }

    refreshButton() {
      const btn = el("div", "gp-refresh");
      btn.setAttribute("data-refresh", "1");
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-label", "Refresh");
      btn.appendChild(
        makeIcon(
          [
            "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",
            "M21 3v5h-5",
          ],
          14,
          2,
          24
        )
      );
      return btn;
    }

    async refresh(tab) {
      if (!tab) return;
      const sequence = ++this.refreshSequence;
      const acct = this.accountForTab(tab);
      this.setRefreshing(true);
      try {
        const cache = await this.getFeed(acct, true, tab);
        if (sequence !== this.refreshSequence || this.currentTab !== tab || this.panel.state === "closed") return;
        if (cache.data) this.paintBadge(tab, cache.data.count);
        this.render(cache, acct);
      } finally {
        if (sequence === this.refreshSequence && this.currentTab === tab && this.panel.state !== "closed") {
          this.setRefreshing(false);
        }
      }
    }

    doRefresh() {
      return this.refresh(this.currentTab);
    }

    // ---------- interactions ----------

    onClick(e) {
      const tab = this.currentTab;
      if (!tab) return;
      const compose = e.target.closest("[data-compose]");
      const inboxLink = e.target.closest("[data-open-inbox]");
      const row = e.target.closest(".gp-row");
      const acct = this.accountForTab(tab);
      const refresh = e.target.closest("[data-refresh]");
      const diag = e.target.closest("[data-diag]");
      if (diag) {
        EPDiag.open(diag);
        return;
      }
      if (refresh) {
        this.doRefresh();
        return;
      }
      if (compose) {
        this.navigate(tab, composeUrl(acct));
        this.hideNow();
      } else if (inboxLink) {
        this.navigate(tab, inboxUrl(acct));
        this.hideNow();
      } else if (row) {
        this.navigate(tab, row.getAttribute("data-link") || inboxUrl(acct));
        this.hideNow();
      }
    }

    navigate(tab, url) {
      EPDiag.log("nav", "open", { url: String(url).split("?")[0].slice(0, 120) });
      try {
        gBrowser.selectedTab = tab;
        tab.linkedBrowser.loadURI(url, {
          triggeringPrincipal:
            Services.scriptSecurityManager.getSystemPrincipal(),
        });
      } catch (ex) {
        console.error(TAG, "navigate failed", ex);
        try {
          openWebLinkIn(url, "tab");
        } catch {}
      }
    }

    // ---------- badge ----------

    async refreshBadge() {
      this.scanTabs();
      const tabs = this.findGmailTabs();
      if (!tabs.length || !bPref("mod.gmailpeek.show_badge", true)) return;
      // Group tabs by account — one fetch per unique /u/N/.
      const byAccount = new Map();
      for (const tab of tabs) {
        const acct = this.accountForTab(tab);
        if (!byAccount.has(acct)) byAccount.set(acct, []);
        byAccount.get(acct).push(tab);
      }
      for (const [acct, acctTabs] of byAccount) {
        const cache = await this.getFeed(acct, false, acctTabs[0]);
        if (cache.error || !cache.data) continue;
        for (const tab of acctTabs) {
          this.paintBadge(tab, cache.data.count);
        }
      }
    }

    paintBadge(tab, count) {
      EPDiag.log("badge", "paint", { count, tab: EPDiag.tabInfo(tab) });
      const host =
        tab.shadowRoot?.querySelector(".tab-icon-stack") ||
        tab.shadowRoot?.querySelector(".tab-content") ||
        tab.querySelector(".tab-icon-stack") ||
        tab.querySelector(".tab-content");
      if (!host) return;
      let badge = host.querySelector(".gmailpeek-badge");
      if (count > 0) {
        if (getComputedStyle(host).position === "static") {
          host.style.position = "relative";
        }
        if (!badge) {
          badge = el("span", "gmailpeek-badge");
          badge.style.cssText = BADGE_STYLE;
          host.appendChild(badge);
        }
        badge.textContent = count > 99 ? "99+" : String(count);
      } else {
        badge?.remove();
      }
    }

    // ---------- show/hide timers ----------

    scheduleHide() {
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(
        () => this.hideNow(),
        iPref("mod.gmailpeek.hide_delay", 150)
      );
    }

    cancelHide() {
      clearTimeout(this.hideTimer);
    }

    hideNow() {
      clearTimeout(this.hideTimer);
      if (this.panel && this.panel.state !== "closed") {
        this.panel.hidePopup();
      } else {
        this.onPanelHidden();
      }
    }

    onPanelHidden() {
      EPDiag.log("popup", "hidden");
      this.refreshSequence++;
      this.refreshing = false;
      clearInterval(this.dotsTimer);
      this.dotsTimer = null;
      this.releaseCompactSidebar();
      if (this.hoverTab) this.restoreTooltip(this.hoverTab);
      this.hoverTab = null;
      this.currentTab = null;
      this.suppressTooltip = false;
    }
  }

  const boot = () => {
    try {
      if (!window.gBrowser) {
        setTimeout(boot, 500);
        return;
      }
      window.gmailPeek = new GmailPeek();
      window.gmailPeek.init();
    } catch (err) {
      EPDiag.log("boot", "gmail-peek boot failed", String(err?.stack || err));
      console.error(TAG, "boot failed:", err);
    }
  };

  if (document.readyState === "complete") {
    boot();
  } else {
    window.addEventListener("load", boot, { once: true });
    // In case load already fired before we were injected.
    setTimeout(() => {
      if (!window.gmailPeek) boot();
    }, 1500);
  }
})();
