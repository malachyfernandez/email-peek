// ==UserScript==
// @name           Proton Peek
// @namespace      proton-peek
// @description    Arc-style inbox preview when hovering a pinned/essential Proton Mail tab
// @version        1.4.0
// @author         malachyfernandez + Devin
// @include        main
// @ignorecache
// ==/UserScript==

// Runs in chrome://browser/content/browser.xhtml (privileged chrome context).
// Proton Mail is end-to-end encrypted and has no Atom feed like Gmail, so
// instead of fetching a feed we scrape rendered DOM via a JSWindowActor.
// The scrape target is NOT the pinned tab itself (pinned tabs sleep and can
// be navigated anywhere) — the mod owns a hidden 1x1 <browser> per account,
// kept on the same mailbox view the pinned tab points at. It never sleeps,
// shares the normal cookie jar, and always shows a list view. The actor
// child module is written to <profile>/chrome/JS/proton-peek/ at init so
// chrome://userscripts/ (mapped by the autoconfig / Sine chrome.manifest)
// can load it inside the content process.
//
// Row extraction deliberately avoids styling classnames and anchors on
// Proton's semantic/test hooks instead, layered so a UI change degrades
// rather than breaks:
//   rows:    [data-element-id] > [data-shortcut-target=item-container] >
//            [role=region][data-testorder] > ancestor of <time>
//   subject: [data-testid$=":subject"] > #message-subject-* > aria-labelledby >
//            [role=heading] > data-testid="message-item:<subject>"
//   sender:  [data-testid$="sender-address"] > [data-testid*="sender"] >
//            [data-testid*="recipient"] > title attr containing "@"
//   time:    <time datetime>/<data-testid^="item-date"> (text shown verbatim,
//            no parsing)
//   unread:  .unread/.read classes, .item-unread-dot, data-testid="true",
//            aria-label
//   compose: [data-testid="sidebar:compose"] > compose-ish testids/labels >
//            "N" keyboard shortcut
//   unread count: "(N)" prefix in the tab title, else scraped rows
// Clicking an email calls row.click() inside the page — React's own handler
// routes it, so there is no URL-format guessing.

(() => {
  "use strict";

  if (window.protonPeek) {
    return;
  }

  const XHTML = "http://www.w3.org/1999/xhtml";
  const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
  const TAG = "[proton-peek]";
  // ---------- shared diagnostics ----------
  // Identical in every email-peek script: whoever loads first owns the
  // singleton on window.__EPDiag, so diagnostics survive even if sibling
  // scripts fail to boot. Consecutive repeats dedupe (xN), everything flushes
  // to <profile>/email-peek.log every few seconds and on unload, and "open"
  // renders the whole report into a real browser tab — plain HTML, plain
  // links, no chrome APIs required at click time.
  const EPDiag = (window.__EPDiag ||= (() => {
    const VERSION = "1.7.5";
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

  const ACTOR = "ProtonPeek";
  const PROTON_HOSTS = /^(mail\.proton\.me|mail\.protonmail\.com)$/i;

  const PREF = "mod.protonpeek.";
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

  const defaultAccount = () => sPref(PREF + "account", "0").trim() || "0";

  // ---------- actor modules ----------
  // Kept as strings so a single .uc.js stays self-contained; written to disk
  // at init. Child source must avoid backticks/${} so it embeds cleanly.

  const PARENT_SOURCE = String.raw`export class ProtonPeekParent extends JSWindowActorParent {}`;

  const CHILD_SOURCE = String.raw`
const _PPBase =
  typeof JSWindowActorChild !== "undefined" ? JSWindowActorChild : class {};
export class ProtonPeekChild extends _PPBase {
  receiveMessage(message) {
    try {
      const data = message.data || {};
      if (message.name === "ProtonPeek:Ping") return { ok: true, diagnostics: this.diagnostics(this.doc()) };
      if (message.name === "ProtonPeek:Collect") return this.collect(data.max || 50);
      if (message.name === "ProtonPeek:Open") return { ok: this.openItem(data.id, data.index) };
      if (message.name === "ProtonPeek:Compose") return { ok: this.compose() };
      return { error: "unknown-message" };
    } catch (e) {
      return { error: String((e && e.message) || e) };
    }
  }

  diagnostics(doc) {
    if (!doc) return { hasDocument: false };
    const selectors = [
      "[data-element-id]",
      '[data-shortcut-target="item-container"]',
      '[role="region"][data-testorder]',
      '[data-testid$=":subject"]',
      '[data-testid$="sender-address"]',
      "time[datetime]",
    ];
    return {
      hasDocument: true,
      readyState: doc.readyState,
      visibility: doc.visibilityState,
      width: doc.defaultView && doc.defaultView.innerWidth,
      height: doc.defaultView && doc.defaultView.innerHeight,
      appChildren: doc.querySelector(".app-root")?.childElementCount || 0,
      compose: !!doc.querySelector('[data-testid="sidebar:compose"]'),
      busy: !!doc.querySelector('[aria-busy="true"], [role="progressbar"], [data-element-id^="placeholder-"]'),
      selectorCounts: Object.fromEntries(selectors.map(selector => [selector, doc.querySelectorAll(selector).length])),
    };
  }

  doc() {
    if (this.document) return this.document;
    try { return this.contentWindow && this.contentWindow.document; } catch (e) { return null; }
  }

  collect(max) {
    const doc = this.doc();
    const res = { title: "", url: "", rowCount: 0, entries: [], error: null };
    if (!doc || !doc.body) {
      res.error = "empty-document";
      return res;
    }
    try { res.title = doc.title || ""; } catch (e) {}
    try { res.url = doc.location ? doc.location.href : ""; } catch (e) {}
    res.diagnostics = this.diagnostics(doc);
    const rows = this.findRows(doc);
    res.rowCount = rows.length;
    res.entries = rows.slice(0, max).map((row, i) => {
      const e = this.extractRow(row, doc);
      e.index = i;
      return e;
    });
    return res;
  }

  findRows(doc) {
    let rows = Array.from(doc.querySelectorAll("[data-element-id]"));
    if (!rows.length) {
      rows = Array.from(doc.querySelectorAll('[data-shortcut-target="item-container"]'));
    }
    if (!rows.length) {
      rows = Array.from(doc.querySelectorAll('[role="region"][data-testorder]'));
    }
    if (!rows.length) {
      const found = [];
      for (const t of doc.querySelectorAll("time[datetime]")) {
        const row = t.closest('[draggable="true"], [role="row"], [role="region"], li, tr');
        if (row && !found.includes(row)) found.push(row);
      }
      rows = found;
    }
    return Array.from(new Set(rows)).filter(r => {
      const tag = (r.localName || "").toLowerCase();
      const id = r.getAttribute("data-element-id") || "";
      return tag !== "html" && tag !== "body" && !/^placeholder(?:-|$)/i.test(id) && r.getAttribute("aria-busy") !== "true";
    });
  }

  extractRow(row, doc) {
    const time = this.findTime(row);
    return {
      id: row.getAttribute("data-element-id") || null,
      subject: this.findSubject(row, doc),
      sender: this.findSender(row),
      time: time.text,
      fullDate: time.full,
      unread: this.isUnread(row),
    };
  }

  textOf(n) {
    return n ? (n.textContent || "").trim() : "";
  }

  titled(n) {
    return n ? ((n.getAttribute("title") || n.textContent || "").trim()) : "";
  }

  findSubject(row, doc) {
    const sels = ['[data-testid$=":subject"]', '[id^="message-subject-"]'];
    for (const sel of sels) {
      let n = null;
      try { n = row.querySelector(sel); } catch (e) {}
      const s = this.titled(n);
      if (s) return s;
    }
    const led = row.getAttribute("aria-labelledby");
    if (led) {
      const s = this.titled(doc.getElementById(led));
      if (s) return s;
    }
    const s = this.textOf(row.querySelector('[role="heading"]'));
    if (s) return s;
    const tid = row.getAttribute("data-testid") || "";
    if (tid.indexOf("message-item:") === 0) {
      return tid.slice("message-item:".length).trim();
    }
    return "";
  }

  findSender(row) {
    const sels = ['[data-testid$="sender-address"]', '[data-testid*="sender"]', '[data-testid*="recipient"]'];
    for (const sel of sels) {
      let n = null;
      try { n = row.querySelector(sel); } catch (e) {}
      if (n) {
        const s = this.textOf(n) || (n.getAttribute("title") || "").trim();
        if (s) return s;
      }
    }
    for (const n of row.querySelectorAll("[title]")) {
      const v = (n.getAttribute("title") || "").trim();
      if (v && v.indexOf("@") !== -1) return v;
    }
    return "";
  }

  findTime(row) {
    const n = row.querySelector('time[datetime], [data-testid^="item-date"], time');
    if (!n) return { text: "", full: "" };
    return {
      text: (n.textContent || "").trim(),
      full: n.getAttribute("title") || n.getAttribute("datetime") || "",
    };
  }

  isUnread(row) {
    const cls = row.classList;
    if (cls && cls.contains("read")) return false;
    if (cls && cls.contains("unread")) return true;
    if (row.querySelector(".item-unread-dot")) return true;
    if (row.querySelector('[data-testid="true"]')) return true;
    if (/\bunread\b/i.test(row.getAttribute("aria-label") || "")) return true;
    return null;
  }

  cssEscape(s) {
    try {
      const w = this.contentWindow || (this.document && this.document.defaultView);
      if (w && w.CSS && w.CSS.escape) return w.CSS.escape(s);
    } catch (e) {}
    return String(s).replace(/[^a-zA-Z0-9_-]/g, function (ch) { return "\\" + ch; });
  }

  openItem(id, index) {
    const doc = this.doc();
    if (!doc) return false;
    let row = null;
    if (id) {
      row = doc.querySelector('[data-element-id="' + this.cssEscape(id) + '"]');
    }
    if (!row && typeof index === "number" && index >= 0) {
      row = this.findRows(doc)[index] || null;
    }
    if (!row) return false;
    row.click();
    return true;
  }

  compose() {
    const doc = this.doc();
    if (!doc) return false;
    const sels = [
      '[data-testid="sidebar:compose"]',
      '[data-testid*="compose" i]',
      'button[aria-label*="compose" i]',
      'button[title*="compose" i]',
    ];
    for (const sel of sels) {
      let b = null;
      try { b = doc.querySelector(sel); } catch (e) {}
      if (b) { b.click(); return true; }
    }
    const cands = doc.querySelectorAll("button, [role='button'], a");
    for (const b of cands) {
      const name = (b.getAttribute("aria-label") || b.getAttribute("title") || b.textContent || "").trim();
      if (/new message|compose|composer|nouveau|escribir|verfassen/i.test(name)) {
        b.click();
        return true;
      }
    }
    try {
      const win = doc.defaultView;
      const target = doc.body || doc.documentElement;
      if (win && target) {
        for (const type of ["keydown", "keypress", "keyup"]) {
          target.dispatchEvent(new win.KeyboardEvent(type, { key: "n", code: "KeyN", bubbles: true, cancelable: true }));
        }
        return true;
      }
    } catch (e) {}
    return false;
  }
}
`;

  // Where the actor files land vs. which chrome:// URI maps there. The Sine /
  // fx-autoconfig chrome.manifest maps chrome://userscripts/ to chrome/JS/ and
  // (Sine) chrome://userchromejs/ to chrome/. We write into both candidate
  // directories and probe which URI resolves.
  const actorDirs = () => [
    PathUtils.join(PathUtils.profileDir, "chrome", "JS", "proton-peek"),
    PathUtils.join(PathUtils.profileDir, "chrome", "proton-peek"),
  ];
  const ACTOR_BASES = [
    "chrome://userscripts/content/proton-peek/",
    "chrome://userchromejs/content/proton-peek/",
  ];
  const ACTOR_MATCHES = [
    "https://mail.proton.me/*",
    "https://mail.protonmail.com/*",
  ];
  // Remote types are matched as *prefixes* of the process-type KIND (the
  // part before "="). "web" therefore also covers "webIsolated",
  // "webCOOP+COEP" and "webServiceWorker"; a full "webIsolated=<origin>"
  // string can never match and must not be listed. "parent" allows the
  // actor to attach if a browser ever ends up in-process.
  const ACTOR_REMOTE_TYPES = [
    "web",
    "webIsolated",
    "webCOOP+COEP",
    "webServiceWorker",
    "file",
    "parent",
  ];
  let childModuleURI = null;
  let actorReady = null;

  const probe = async uri => {
    try {
      const res = await fetch(uri, { credentials: "omit", cache: "no-store" });
      if (res.ok) {
        res.body?.cancel?.();
        return true;
      }
    } catch {}
    try {
      return await new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () =>
          resolve(xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300));
        xhr.onerror = () => resolve(false);
        xhr.ontimeout = () => resolve(false);
        xhr.open("GET", uri);
        xhr.send();
      });
    } catch {
      return false;
    }
  };

  const ensureActor = async () => {
    for (const dir of actorDirs()) {
      try {
        await IOUtils.makeDirectory(dir, {
          createAncestors: true,
          ignoreExisting: true,
        });
        await IOUtils.writeUTF8(
          PathUtils.join(dir, "ProtonPeekParent-20260930-release.sys.mjs"),
          PARENT_SOURCE
        );
        await IOUtils.writeUTF8(
          PathUtils.join(dir, "ProtonPeekChild-20260930-release.sys.mjs"),
          CHILD_SOURCE
        );
      } catch (err) {
        console.warn(TAG, "actor file write failed for", dir, err);
      }
    }

    let base = null;
    for (const b of ACTOR_BASES) {
      if (await probe(b + "ProtonPeekChild-20260930-release.sys.mjs")) {
        base = b;
        break;
      }
    }
    const dataUri = src =>
      "data:text/javascript;charset=utf-8," + encodeURIComponent(src);
    childModuleURI = base
      ? base + "ProtonPeekChild-20260930-release.sys.mjs"
      : dataUri(CHILD_SOURCE);
    // matches/remoteTypes/allFrames/safeForUntrustedWebProcess are TOP-LEVEL
    // WindowActorOptions fields — nested under `child` they are silently
    // dropped by WebIDL dictionary conversion. safeForUntrustedWebProcess
    // defaults to false and dom.jsipc.check_safeForUntrustedWebProcess
    // defaults to true, so omitting it rejects every web remoteType with
    // "doesn't match remote type" — that was the blocker.
    const buildOptions = (parentURI, childURI) => ({
      parent: { esModuleURI: parentURI },
      child: { esModuleURI: childURI },
      matches: ACTOR_MATCHES,
      remoteTypes: ACTOR_REMOTE_TYPES,
      allFrames: false,
      includeChrome: false,
      safeForUntrustedWebProcess: true,
    });
    const options = base
      ? buildOptions(
          base + "ProtonPeekParent-20260930-release.sys.mjs",
          base + "ProtonPeekChild-20260930-release.sys.mjs"
        )
      : buildOptions(dataUri(PARENT_SOURCE), dataUri(CHILD_SOURCE));
    try {
      const parentModule = ChromeUtils.importESModule(options.parent.esModuleURI);
      const childModule = ChromeUtils.importESModule(options.child.esModuleURI);
      if (typeof parentModule.ProtonPeekParent !== "function" ||
          typeof childModule.ProtonPeekChild?.prototype.collect !== "function") {
        throw new Error("missing actor exports");
      }
    } catch (err) {
      console.error(TAG, "actor module preflight failed:", err);
      throw new Error(`actor-module-invalid: ${err?.message || err}`);
    }
    try {
      ChromeUtils.registerWindowActor(ACTOR, options);
    } catch (err) {
      // A second browser window re-runs this file — a duplicate registration
      // error is fine, the actor is already there.
      if (!/already.*(registered|exists)/i.test(String(err?.message || err))) throw err;
    }
  };

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
    #protonpeek-panel {
      --pp-bg: var(--panel-background, Field);
      --pp-fg: var(--panel-color, FieldText);
      --pp-dim: color-mix(in srgb, var(--pp-fg) 55%, transparent);
      --pp-hover: color-mix(in srgb, var(--pp-fg) 8%, transparent);
      --pp-border: color-mix(in srgb, var(--pp-fg) 15%, transparent);
    }
    #protonpeek-panel {
      /* The native macOS menu shape can't be re-rounded, so draw the frame
         ourselves: inner radius = --panel-border-radius, outer = inner + the
         gap between the edges (shadow margin + border). */
      appearance: none;
      background-color: Menu;
      border-radius: calc(var(--panel-border-radius, 10px) + var(--panel-box-shadow-margin, 0px) + 1px);
    }
    #protonpeek-panel::part(content) {
      border-radius: var(--panel-border-radius, 10px);
    }
    #protonpeek-panel .pp-box {
      width: 340px;
      font: menu;
      color: var(--pp-fg);
      padding: 4px 0 42px;
      position: relative;
    }
    #protonpeek-panel .pp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--pp-dim);
      letter-spacing: 0.02em;
    }
    #protonpeek-panel .pp-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 400;
    }
    #protonpeek-panel .pp-refresh {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--pp-dim);
    }
    #protonpeek-panel .pp-refresh:hover {
      background: var(--pp-hover);
      color: var(--pp-fg);
    }
    #protonpeek-panel .pp-refresh.pp-spin svg {
      animation: pp-rot 0.7s linear infinite;
    }
    @keyframes pp-rot {
      to { transform: rotate(360deg); }
    }
    #protonpeek-panel .pp-row {
      display: block;
      padding: 8px 14px;
      cursor: pointer;
      border-top: 1px solid transparent;
    }
    #protonpeek-panel .pp-row:hover,
    #protonpeek-panel .pp-row:focus-visible {
      background: var(--pp-hover);
    }
    #protonpeek-panel .pp-topline {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    #protonpeek-panel .pp-author {
      font-size: 13px;
      font-weight: 650;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #protonpeek-panel .pp-time {
      font-size: 11px;
      color: var(--pp-dim);
      flex-shrink: 0;
      max-width: 40%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #protonpeek-panel .pp-subject {
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #protonpeek-panel .pp-row.pp-read .pp-author,
    #protonpeek-panel .pp-row.pp-read .pp-subject {
      opacity: 0.55;
    }
    #protonpeek-panel .pp-compose {
      position: absolute;
      right: 10px;
      bottom: 8px;
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 50%;
      border: 1px solid var(--pp-border);
      background: var(--pp-bg);
      color: var(--pp-fg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    #protonpeek-panel .pp-compose svg {
      display: block;
    }
    #protonpeek-panel .pp-compose:hover {
      background: var(--pp-hover);
    }
    #protonpeek-panel .pp-status {
      padding: 18px 14px;
      font-size: 13px;
      color: var(--pp-dim);
      text-align: center;
    }
    #protonpeek-panel .pp-status.pp-link {
      cursor: pointer;
      text-decoration: underline;
    }
    #protonpeek-panel .pp-refreshing {
      position: absolute;
      left: 14px;
      bottom: 15px;
      font-size: 11px;
      font-weight: 400;
      color: var(--pp-dim);
    }
  `;

  const BADGE_STYLE =
    "position:absolute;top:-3px;right:-4px;min-width:14px;height:14px;" +
    "padding:0 3px;border-radius:7px;background:#6d4aff;color:#fff;" +
    "font-size:9.5px;font-weight:700;line-height:14px;text-align:center;" +
    "pointer-events:none;box-sizing:border-box;";

  class ProtonPeek {
    constructor() {
      this.hoverTab = null;
      this.currentTab = null;
      this.hoverTimer = null;
      this.hideTimer = null;
      this.suppressTooltip = false;
      this.panel = null;
      this.box = null;
      this.caches = new WeakMap(); // tab -> { t, data, error }
      this.inflights = new WeakMap(); // tab -> Promise
      this.phantoms = new Map(); // "host|account" -> { browser, url }
      this.protonTabs = new Set();
      this.boundTabs = new WeakSet();
      this.refreshSequence = 0;
      this.refreshing = false;
      this.dotsTimer = null;
      this.refreshDots = 0;
      this._compactHold = null;
      this._weSetUserShow = false;
      this.readyActors = new WeakSet();
      this.querySequence = 0;

      this.onHoverIn = this.onHoverIn.bind(this);
      this.onHoverOut = this.onHoverOut.bind(this);
      this.onPopupShowing = this.onPopupShowing.bind(this);
      this.onClick = this.onClick.bind(this);
    }

    async init() {
      EPDiag.boot("proton-peek");
      const style = el("style");
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);

      for (const evt of ["mouseover", "pointerover"]) {
        document.addEventListener(evt, this.onHoverIn, true);
      }
      for (const evt of ["mouseout", "pointerout"]) {
        document.addEventListener(evt, this.onHoverOut, true);
      }
      document.addEventListener("popupshowing", this.onPopupShowing, true);

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

      actorReady = ensureActor();
      await actorReady;
      this.scanTabs();
      this.refreshBadge();
    }

    destroy() {
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
      for (const tab of this.protonTabs) {
        (tab.shadowRoot || tab).querySelector(".protonpeek-badge")?.remove();
      }
      for (const ph of this.phantoms.values()) {
        try {
          ph.browser?.remove();
        } catch {}
      }
      this.phantoms.clear();
      document.getElementById("protonpeek-phantoms")?.remove();
      window.protonPeek = null;
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

    hostForTab(tab) {
      const m = this.tabUrl(tab).match(/^https?:\/\/([^/]+)/i);
      return m ? m[1] : "mail.proton.me";
    }

    accountForTab(tab) {
      const specs = [
        tab._zenPinnedInitialState?.entry?.url,
        tab.linkedBrowser?.currentURI?.spec,
      ];
      for (const spec of specs) {
        const m =
          typeof spec === "string" ? spec.match(/\/u\/(\d+)\//) : null;
        if (m) return m[1];
      }
      return defaultAccount();
    }

    // Resolved peek target: Zen stores a pinned tab's true home in
    // _zenPinnedInitialState (set at pin time, user-editable, restored
    // across sessions). Pinned tabs wander — Sent, a conversation, a
    // settings page — so we peek at the home view, not wherever the tab is
    // sitting. Without pinned state we trust only the account number and
    // fall back to the canonical all-mail unread view.
    peekParts(tab) {
      const home = tab?._zenPinnedInitialState?.entry?.url;
      const spec = home || this.tabUrl(tab);
      try {
        const u = new URL(spec);
        const m = u.pathname.match(/^\/u\/\d+\/([a-z0-9-]+)/i);
        // The label is only trusted from the pinned home view; a wandering
        // tab (Sent, settings, ...) gets the canonical unread view instead.
        const label = home ? (m ? m[1] : "inbox") : "almost-all-mail";
        const params = new URLSearchParams(
          home ? u.hash.replace(/^#/, "") : ""
        );
        params.set("filter", "unread");
        return {
          origin: u.origin,
          acct: this.accountForTab(tab),
          label,
          hash: params.toString(),
        };
      } catch {}
      return null;
    }

    // Pretty view name for the popup header — matches the view the peek is
    // actually listing (e.g. /u/1/almost-all-mail -> "Almost all mail").
    labelForTab(tab) {
      const slug = this.peekParts(tab)?.label;
      if (!slug) return "Proton Mail";
      return slug
        .split("-")
        .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
    }

    isProtonTab(tab) {
      if (!tab) return false;
      const pinnedLike =
        tab.pinned || tab.hasAttribute("zen-essential") || tab.hasAttribute("pinned");
      if (!pinnedLike) return false;
      const specs = [
        tab._zenPinnedInitialState?.entry?.url,
        tab.linkedBrowser?.currentURI?.spec,
      ];
      return specs.some(spec => {
        if (typeof spec !== "string") return false;
        const m = spec.match(/^https?:\/\/([^/]+)/i);
        return m && PROTON_HOSTS.test(m[1]);
      });
    }

    scanTabs() {
      let scanned = 0, claimed = 0;
      this.scanMisses ||= new WeakSet();
      for (const tab of gBrowser.tabs) {
        scanned++;
        if (!this.isProtonTab(tab)) {
          const info = EPDiag.tabInfo(tab);
          const candidate = /mail\.proton\.me|mail\.protonmail\.com/i.test(info.url);
          if ((tab.pinned || tab.hasAttribute("zen-essential")) && candidate && !this.scanMisses.has(tab)) {
            EPDiag.log("scan", "pinned provider URL not matched", { provider: "Proton", tab: info });
            this.scanMisses.add(tab);
          } else if (!candidate) this.scanMisses.delete(tab);
          continue;
        }
        this.scanMisses.delete(tab);
        claimed++;
        this.protonTabs.add(tab);
        if (!this.boundTabs.has(tab)) {
          this.boundTabs.add(tab);
          tab.addEventListener("mouseenter", this.onHoverIn, false);
          tab.addEventListener("mouseleave", this.onHoverOut, false);
        }
      }
      if (this.lastScanClaimed !== claimed) {
        this.lastScanClaimed = claimed;
        EPDiag.log("scan", "provider tab detection", { provider: "Proton", scanned, matched: claimed });
      }
    }

    findProtonTabs() {
      return [...this.protonTabs].filter(t => t.isConnected);
    }

    // ---------- hover handling ----------

    onHoverIn(e) {
      const tab = asTab(e.target) || asTab(e.currentTarget);
      if (!tab) {
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
      if (!this.isProtonTab(tab)) return;
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
        this.show(tab).catch(err =>
          console.warn(TAG, "show failed:", err)
        );
      }, iPref(PREF + "hover_delay", 400));
    }

    leaveTab() {
      clearTimeout(this.hoverTimer);
      if (this.hoverTab) this.restoreTooltip(this.hoverTab);
      this.hoverTab = null;
      this.suppressTooltip = false;
      if (this.panel && this.panel.state !== "closed") this.scheduleHide();
    }

    stripTooltip(tab) {
      if (tab._ppTooltip === undefined) {
        tab._ppTooltip = {};
        for (const a of ["tooltip", "tooltiptext", "title", "data-tooltip"]) {
          if (tab.hasAttribute(a)) tab._ppTooltip[a] = tab.getAttribute(a);
        }
      }
      for (const a of Object.keys(tab._ppTooltip)) tab.removeAttribute(a);
    }

    restoreTooltip(tab) {
      if (!tab?._ppTooltip) return;
      for (const [a, v] of Object.entries(tab._ppTooltip)) {
        tab.setAttribute(a, v);
      }
      tab._ppTooltip = undefined;
    }

    onPopupShowing(e) {
      if (!this.suppressTooltip && !this.hoverTab) return;
      const t = e.target;
      if (t === this.panel || this.panel?.contains?.(t)) return;
      const id = `${t.localName || ""} ${t.id || ""} ${t.className || ""}`;
      const trigger = t.triggerNode || document.tooltipNode || null;
      const isOurs =
        trigger &&
        (trigger === this.hoverTab || this.hoverTab?.contains(trigger));
      if (/tooltip/i.test(id) || isOurs) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    // ---------- phantom browser + content scraping ----------
    //
    // The pinned tab sleeps and can be navigated to Sent / a conversation /
    // anywhere, so we never scrape it. Instead each account gets a hidden
    // 1x1 <browser> kept on that tab's mailbox view. It never sleeps, shares
    // the default cookie jar (no auth setup), and its WindowGlobal hosts the
    // actor that reads the rendered DOM.

    phantomKey(tab) {
      return `${this.hostForTab(tab)}|${this.accountForTab(tab)}`;
    }

    // Normalized list URL: <origin>/u/N/<label>#hash — conversation/message
    // id segments and query params are stripped so the phantom always lands
    // on a list view, filter=unread is always in the hash, and the target is
    // the pinned tab's home view (see peekParts).
    peekUrl(tab) {
      const p = this.peekParts(tab);
      if (p) return `${p.origin}/u/${p.acct}/${p.label}#${p.hash}`;
      return `${this.inboxUrl(tab)}#filter=unread`;
    }

    phantomContainer() {
      let c = document.getElementById("protonpeek-phantoms");
      if (!c) {
        c = document.createXULElement
          ? document.createXULElement("box")
          : document.createElementNS(XUL, "box");
        c.id = "protonpeek-phantoms";
        c.setAttribute(
          "style",
          "position:fixed;top:0;left:0;width:1px;height:1px;" +
            "overflow:hidden;opacity:0;pointer-events:none;"
        );
        document.documentElement.appendChild(c);
      }
      return c;
    }

    createPhantom(url) {
      const b = document.createXULElement
        ? document.createXULElement("browser")
        : document.createElementNS(XUL, "browser");
      b.setAttribute("type", "content");
      b.setAttribute("remote", "true");
      b.setAttribute("remoteType", "web");
      b.setAttribute("maychangeremoteness", "true");
      b.setAttribute("disableglobalhistory", "true");
      // Render at a real viewport size (clipped by the 1x1 container) so the
      // SPA doesn't fall back to a narrow/mobile layout.
      b.setAttribute("style", "width:1100px;height:750px;");
      // src is the most reliable way to kick off the load on a bare browser
      b.setAttribute("src", url || "about:blank");
      this.phantomContainer().appendChild(b);
      try {
        b.docShellIsActive = true;
      } catch {}
      return b;
    }

    phantomFor(tab) {
      const key = this.phantomKey(tab);
      const target = this.peekUrl(tab);
      let ph = this.phantoms.get(key);
      if (!ph) {
        ph = { browser: null, url: null };
        this.phantoms.set(key, ph);
      }
      if (!ph.browser || !ph.browser.isConnected) {
        try {
          ph.browser = this.createPhantom(target);
          ph.url = target;
        } catch (e) {
          console.warn(TAG, "phantom create failed:", e);
          return null;
        }
      }
      if (ph.url !== target) {
        ph.url = target;
        try {
          ph.browser.loadURI(target, {
            triggeringPrincipal:
              Services.scriptSecurityManager.getSystemPrincipal(),
          });
        } catch (e) {
          try {
            ph.browser.src = target;
          } catch (e2) {
            console.warn(TAG, "phantom navigate failed:", e2);
          }
        }
      }
      return ph;
    }

    actorDiag(browser) {
      const wg = browser?.browsingContext?.currentWindowGlobal;
      if (!wg) return { actor: null, why: "no-wg" };
      if (!wg.getActor) return { actor: null, why: "no-getActor" };
      try {
        const actor = wg.getActor(ACTOR);
        return { actor: actor || null, why: actor ? "ok" : "getActor-null" };
      } catch (err) {
        return { actor: null, why: `getActor-threw:${err?.name || ""}:${err?.message || err}` };
      }
    }

    actorForBrowser(browser) {
      return this.actorDiag(browser).actor;
    }

    actorFor(tab) {
      return this.actorForBrowser(tab?.linkedBrowser);
    }

    sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

    async queryActor(actor, name, data = {}, timeout = 3000) {
      const requestId = ++this.querySequence;
      let timer;
      try {
        const result = await Promise.race([
          actor.sendQuery(name, { ...data, requestId }),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`actor-query-timeout: ${name}`)), timeout);
          }),
        ]);
        return result;
      } finally {
        clearTimeout(timer);
      }
    }

    // If the phantom ended up in-process (remote attr ignored), its DOM is
    // reachable directly — reuse the child module's extraction code in chrome.
    directScrape(browser, max) {
      try {
        const doc = browser.contentDocument;
        if (!doc || !doc.body || !PROTON_HOSTS.test(doc.location?.hostname || "")) return null;
        if (!childModuleURI) return null;
        const mod = ChromeUtils.importESModule(childModuleURI);
        const s = Object.create(mod.ProtonPeekChild.prototype);
        s.doc = () => doc;
        return s.collect(max);
      } catch {
        return null;
      }
    }

    // Polls the phantom until the SPA has rendered (title present) and rows
    // exist — or until we've waited a moment after render, so an empty
    // mailbox or a sign-in page doesn't spin forever.
    async scrapeTab(tab) {
      await actorReady;
      const ph = this.phantomFor(tab);
      if (!ph?.browser) throw new Error("phantom-unavailable");
      const deadline = Date.now() + iPref(PREF + "load_timeout", 20000);
      const max = Math.max(iPref(PREF + "max_items", 6) * 2, 12);
      let last = null;
      let lastError = "phantom-timeout";
      while (Date.now() < deadline) {
        const sources = [ph.browser, tab.linkedBrowser];
        for (const browser of sources) {
          if (!browser || Date.now() >= deadline) continue;
          let res = this.directScrape(browser, max);
          if (!res) {
            const { actor, why } = this.actorDiag(browser);
            if (!actor) {
              lastError = why;
              continue;
            }
            try {
              if (!this.readyActors.has(actor)) {
                const ping = await this.queryActor(actor, "ProtonPeek:Ping", {}, Math.min(3000, deadline - Date.now()));
                if (!ping?.ok) throw new Error(ping?.error || "actor-ping-invalid");
                this.readyActors.add(actor);
              }
              if (Date.now() >= deadline) continue;
              res = await this.queryActor(actor, "ProtonPeek:Collect", { max }, Math.min(3000, deadline - Date.now()));
            } catch (err) {
              lastError = String(err?.message || err);
              continue;
            }
          }
          if (res?.error) {
            lastError = res.error;
          } else if (res) {
            last = res;
            if (res.entries?.length) return this.packageResult(tab, res);
          }
        }
        await this.sleep(Math.min(400, Math.max(0, deadline - Date.now())));
      }
      if (last?.diagnostics?.compose && !last.diagnostics.busy) return this.packageResult(tab, last);
      if (last) lastError = "mailbox-not-rendered";
      EPDiag.log("peek", "scrape failed", { err: lastError, diag: last?.diagnostics });
      throw new Error(lastError);
    }

    packageResult(tab, res) {
      // Unread only: rows proven read are dropped. Undetermined (null) rows
      // are kept — better to show one extra row than hide real unread mail.
      const entries = (res.entries || []).filter(e => e.unread !== false);
      const count =
        this.countFromTitle(tab, res.title) ?? entries.length;
      return { count, entries, title: res.title, url: res.url };
    }

    // Proton prefixes the document title with "(N) " for unread count.
    // Anchored at the start so a label like "Receipts (2026)" can't miscount.
    countFromTitle(tab, scrapedTitle) {
      const title =
        scrapedTitle || tab.linkedBrowser?.contentTitle || tab.label || "";
      const m = title.match(/^\s*\((\d[\d\s.,']*)\)/);
      if (!m) return null;
      const n = parseInt(m[1].replace(/[^\d]/g, ""), 10);
      return Number.isFinite(n) ? n : null;
    }

    getPeek(tab, force = false) {
      let cache = this.caches.get(tab);
      if (!cache) {
        cache = { t: 0, data: null, error: null };
        this.caches.set(tab, cache);
      }
      // Successful scrapes are served for 45s; errors are retried after 5s
      // so a stale failure doesn't linger once the page finishes loading.
      const age = Date.now() - cache.t;
      const fresh = cache.data ? age < 45000 : age < 5000;
      if (!force && fresh && (cache.data || cache.error)) {
        return Promise.resolve(cache);
      }
      if (!this.inflights.has(tab)) {
        this.inflights.set(
          tab,
          this.scrapeTab(tab)
            .then(data => {
              EPDiag.log("peek", "scraped", { entries: data?.entries?.length, count: data?.count, title: String(data?.title || "").slice(0, 60) });
              const t = Date.now();
              this.caches.set(tab, { t, refreshedAt: t, data, error: null });
            })
            .catch(err => {
              EPDiag.log("peek", "error", String(err?.message || err));
              this.caches.set(tab, {
                t: Date.now(),
                refreshedAt: cache.refreshedAt || (cache.data ? cache.t : 0),
                data: null,
                error: String(err?.message || err),
              });
            })
            .then(() => this.caches.get(tab))
            .finally(() => {
              this.inflights.delete(tab);
            })
        );
      }
      return this.inflights.get(tab);
    }

    // ---------- panel ----------

    ensurePanel() {
      if (this.panel) return;
      const panel = document.createXULElement
        ? document.createXULElement("panel")
        : document.createElementNS(XUL, "panel");
      panel.id = "protonpeek-panel";
      panel.setAttribute("noautofocus", "true");
      panel.setAttribute("consumeoutsideclicks", "false");
      panel.setAttribute("level", "top");
      const box = el("div", "pp-box");
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
      const cached = this.caches.get(tab);

      if (cached?.data || cached?.error) {
        this.render(cached, tab);
      } else {
        this.renderLoading();
      }

      const r = tab.getBoundingClientRect();
      const sx = window.mozInnerScreenX ?? window.screenX;
      const sy = window.mozInnerScreenY ?? window.screenY;
      const x = sx + r.right + 6;
      const y = sy + r.top;
      if (this.panel.state === "closed") {
        this.openPanel(tab, x, y);
      }
      this.holdCompactSidebar();

      await this.refresh(tab);
    }

    // Wayland exposes no usable global screen coordinates, so on Linux the
    // panel anchors to the tab; other platforms keep the screen-positioned
    // open the frame styling was tuned for. The other method is always the
    // fallback if the primary throws.
    openPanel(tab, x, y) {
      const anchorFirst = Services.appinfo?.OS === "Linux";
      try {
        if (anchorFirst) {
          this.panel.openPopup(tab, "after_start", 4, 0, false, false);
        } else {
          this.panel.openPopupAtScreen(x, y, false);
        }
      } catch (err) {
        EPDiag.log("popup", "primary open failed, retrying", String(err));
        try {
          if (anchorFirst) {
            this.panel.openPopupAtScreen(x, y, false);
          } else {
            this.panel.openPopup(tab, "after_start", 4, 0, false, false);
          }
        } catch (e2) {
          EPDiag.log("popup", "open failed", String(e2));
          console.warn(TAG, "openPopup failed:", e2);
        }
      }
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

    setRefreshing(on) {
      this.refreshing = on;
      let status = this.box.querySelector(".pp-refreshing");
      if (!status) {
        status = el("div", "pp-refreshing");
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        this.box.appendChild(status);
      }
      clearInterval(this.dotsTimer);
      this.dotsTimer = null;
      const cache = this.currentTab && this.caches.get(this.currentTab);
      const refreshedAt = cache?.refreshedAt || (cache?.data && cache.t);
      const stamp = refreshedAt ? `Refreshed ${new Date(refreshedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : "";
      if (on) {
        this.refreshDots = 0;
        status.textContent = "Refreshing.";
        this.dotsTimer = setInterval(() => {
          const s = this.box?.querySelector(".pp-refreshing");
          if (!s) return;
          this.refreshDots = (this.refreshDots % 3) + 1;
          s.textContent = "Refreshing" + ".".repeat(this.refreshDots);
        }, 300);
      } else {
        status.textContent = cache?.error
          ? `Refresh failed${stamp ? " · " + stamp : ""}`
          : stamp;
      }
      this.box.querySelector(".pp-refresh")?.classList.toggle("pp-spin", on);
    }

    renderLoading() {
      this.box.replaceChildren(el("div", "pp-status", "Loading inbox…"));
    }

    render(cache, tab) {
      const box = this.box;
      box.replaceChildren();
      this.setRefreshing(this.refreshing);
      const max = iPref(PREF + "max_items", 6);
      const multi =
        new Set([...this.protonTabs].map(t => this.accountForTab(t))).size > 1;

      const header = el("div", "pp-header");
      const label = this.labelForTab(tab);
      header.appendChild(
        el(
          "span",
          null,
          multi ? `${label} · u/${this.accountForTab(tab)}` : label
        )
      );
      const right = el("div", "pp-header-right");
      if (cache.data) {
        right.appendChild(
          el(
            "span",
            null,
            cache.data.count > 0
              ? `${cache.data.count} unread`
              : "all caught up"
          )
        );
      }
      right.appendChild(this.refreshButton());
      const diagBtn = el("div", "pp-refresh");
      diagBtn.setAttribute("data-diag", "1");
      diagBtn.setAttribute("role", "button");
      diagBtn.setAttribute("aria-label", "About Email Peek");
      diagBtn.textContent = "i";
      right.appendChild(diagBtn);
      header.appendChild(right);
      box.appendChild(header);

      if (cache.error) {
        const loading =
          cache.error === "phantom-timeout" ||
          cache.error === "empty-document" ||
          cache.error === "no-response";
        const msg = loading
          ? "Proton Mail is still loading — hover again in a few seconds."
          : `Couldn't read inbox (${cache.error}). Click to open.`;
        const status = el("div", "pp-status pp-link", msg);
        status.setAttribute("data-open-inbox", "1");
        box.appendChild(status);
        box.appendChild(this.composeButton());
        return;
      }

      const { entries } = cache.data;
      if (!entries.length) {
        box.appendChild(
          el("div", "pp-status", "No unread mail — you're all caught up.")
        );
        const status = box.lastChild;
        status.classList.add("pp-link");
        status.setAttribute("data-open-inbox", "1");
      } else {
        entries.slice(0, max).forEach((entry, i) => {
          const row = el("div", "pp-row");
          if (entry.unread === false) row.classList.add("pp-read");
          if (entry.id) row.setAttribute("data-id", entry.id);
          row.setAttribute("data-index", String(entry.index ?? i));
          const top = el("div", "pp-topline");
          top.appendChild(el("span", "pp-author", entry.sender || "?"));
          top.appendChild(
            el("span", "pp-time", entry.time || entry.fullDate || "")
          );
          row.appendChild(top);
          row.appendChild(
            el("div", "pp-subject", entry.subject || "(no subject)")
          );
          box.appendChild(row);
        });
      }
      box.appendChild(this.composeButton());
    }

    composeButton() {
      const btn = el("div", "pp-compose");
      btn.setAttribute("data-compose", "1");
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-label", "Compose");
      btn.appendChild(makeIcon(["M6.5 2.5v8", "M2.5 6.5h8"], 13, 1.8));
      return btn;
    }

    refreshButton() {
      const btn = el("div", "pp-refresh");
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
      this.setRefreshing(true);
      try {
        const cache = await this.getPeek(tab, true);
        if (sequence !== this.refreshSequence || this.currentTab !== tab || this.panel.state === "closed") return;
        if (cache.data) this.paintBadge(tab, cache.data.count);
        this.render(cache, tab);
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
      const row = e.target.closest(".pp-row");
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
        this.composeIn(tab);
        this.hideNow();
      } else if (inboxLink) {
        this.focusTab(tab);
        this.hideNow();
      } else if (row) {
        this.openEntry(tab, row.getAttribute("data-id"));
        this.hideNow();
      }
    }

    focusTab(tab) {
      try {
        gBrowser.selectedTab = tab;
      } catch (ex) {
        console.error(TAG, "focusTab failed", ex);
      }
    }

    inboxUrl(tab) {
      return `https://${this.hostForTab(tab)}/u/${this.accountForTab(tab)}/inbox`;
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

    // Clicks the message row inside the page so React does the routing —
    // no URL guessing. Falls back to loading the inbox if the actor is gone.
    // /u/N/<label>/<elementId> is Proton's canonical detail route, so we
    // just navigate the real pinned tab there — works whether it's awake
    // or discarded, for conversations and messages alike.
    entryUrl(tab, id) {
      const base = this.peekUrl(tab).replace(/[?#].*$/, "");
      return id ? `${base}/${encodeURIComponent(id)}` : base;
    }

    async openEntry(tab, id) {
      this.navigate(tab, this.entryUrl(tab, id));
    }

    async composeIn(tab) {
      const actor = this.actorFor(tab);
      let ok = false;
      if (actor) {
        try {
          const res = await actor.sendQuery("ProtonPeek:Compose", {});
          ok = !!res?.ok;
        } catch {}
      }
      this.focusTab(tab);
      if (!ok) this.navigate(tab, this.inboxUrl(tab));
    }

    // ---------- badge ----------

    async refreshBadge() {
      this.scanTabs();
      const tabs = this.findProtonTabs();
      if (!tabs.length || !bPref(PREF + "show_badge", true)) return;
      for (const tab of tabs) {
        let count = this.countFromTitle(tab);
        if (count == null) {
          const ph = this.phantoms.get(this.phantomKey(tab));
          count = ph?.browser ? this.countFromTitle(tab, ph.browser.contentTitle) : null;
        }
        if (count != null) {
          this.paintBadge(tab, count);
          continue;
        }
        const cache = await this.getPeek(tab);
        if (cache.data) this.paintBadge(tab, cache.data.count);
      }
    }

    paintBadge(tab, count) {
      const host =
        tab.shadowRoot?.querySelector(".tab-icon-stack") ||
        tab.shadowRoot?.querySelector(".tab-content") ||
        tab.querySelector(".tab-icon-stack") ||
        tab.querySelector(".tab-content");
      if (!host) return;
      let badge = host.querySelector(".protonpeek-badge");
      if (count > 0) {
        if (getComputedStyle(host).position === "static") {
          host.style.position = "relative";
        }
        if (!badge) {
          badge = el("span", "protonpeek-badge");
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
        iPref(PREF + "hide_delay", 150)
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
      if (!bPref(PREF + "enabled", true)) return;
      if (!window.gBrowser) {
        setTimeout(boot, 500);
        return;
      }
      window.protonPeek = new ProtonPeek();
      window.protonPeek.init().catch(err =>
        console.error(TAG, "init failed:", err)
      );
    } catch (err) {
      EPDiag.log("boot", "proton-peek boot failed", String(err?.stack || err));
      console.error(TAG, "boot failed:", err);
    }
  };

  if (document.readyState === "complete") {
    boot();
  } else {
    window.addEventListener("load", boot, { once: true });
    setTimeout(() => {
      if (!window.protonPeek) boot();
    }, 1500);
  }
})();
