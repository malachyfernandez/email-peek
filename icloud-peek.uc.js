// ==UserScript==
// @name           iCloud Peek
// @namespace      icloud-peek
// @description    Arc-style inbox preview when hovering a pinned/essential iCloud Mail tab
// @version        1.7.0
// @author         malachyfernandez + Devin
// @include        main
// @ignorecache
// ==/UserScript==

// Runs in chrome://browser/content/browser.xhtml (privileged chrome context).
// iCloud Mail is a client-side CloudOS app with no feed like Gmail's Atom, so
// we scrape the rendered DOM via a JSWindowActor — the same architecture as
// Proton Peek. The scrape target is NOT the pinned tab itself (pinned tabs
// sleep and can be navigated anywhere) — the mod owns a hidden 1x1 <browser>
// kept on https://www.icloud.com/mail/. It never sleeps and shares the
// normal cookie jar. The actor child module is written to
// <profile>/chrome/JS/icloud-peek/ at init so chrome://userscripts/ (mapped
// by the autoconfig / Sine chrome.manifest) can load it inside the content
// process.
//
// The mail UI lives inside a same-origin iframe
// (iframe.child-application[data-name="mail2"] -> /applications/mail2/...),
// so the child first descends into that frame's document.
//
// iCloud's inner DOM is Ember-era CloudOS with few test hooks, so
// extraction is deliberately generic and layered:
//   rows:    [data-message-id]/[data-guid] > [role=option|row|listitem|
//            treeitem] > li inside list-ish containers > ancestor of <time>
//   subject: [class*="subject"] > heading > aria-label segment
//   sender:  [class*="sender"|"from"] > span[title*="@"] > avatar/img labels
//   time:    <time datetime> > date-like [title]/text element
//   unread:  .unread/.read classes > "unread" in aria-label > dot markers
//   compose: compose-ish labels > "New message" affordances > "N" shortcut
//   unread count: "(N)" in the outer tab title ("Inbox (1) | iCloud Mail"),
//            else scraped rows
// Clicking an email asks the REAL tab's actor to row.click() inside the
// page (iCloud has no stable public deep-link format); if the tab is asleep
// we just focus it.

(() => {
  "use strict";

  if (window.icloudPeek) {
    return;
  }

  const XHTML = "http://www.w3.org/1999/xhtml";
  const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
  const TAG = "[icloud-peek]";
  const ACTOR = "ICloudPeek";
  const ICLOUD_HOSTS = /^(www\.|beta\.)?icloud\.com(\.cn)?$/i;

  const PREF = "mod.icloudpeek.";
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

  const PARENT_SOURCE = String.raw`export class ICloudPeekParent extends JSWindowActorParent {}`;

  const CHILD_SOURCE = String.raw`
const _PPBase =
  typeof JSWindowActorChild !== "undefined" ? JSWindowActorChild : class {};
export class ICloudPeekChild extends _PPBase {
  receiveMessage(message) {
    try {
      const data = message.data || {};
      if (message.name === "ICloudPeek:Ping") return { ok: true, diagnostics: this.diagnostics(this.doc()) };
      if (message.name === "ICloudPeek:Collect") return this.collect(data.max || 50);
      if (message.name === "ICloudPeek:Open") return { ok: this.openItem(data.id, data.index) };
      if (message.name === "ICloudPeek:Compose") return { ok: this.compose() };
      return { error: "unknown-message" };
    } catch (e) {
      return { error: String((e && e.message) || e) };
    }
  }

  // The mail app lives inside a same-origin CloudOS iframe
  // (iframe.child-application[data-name="mail2"]). Descend into it;
  // fall back to the top document if the iframe is absent or unreadable.
  mailFrame(doc) {
    try {
      const f = doc.querySelector(
        'iframe.child-application[data-name="mail2"], iframe#early-child, iframe.child-application, iframe[data-name*="mail" i]'
      );
      return (f && f.contentDocument) || null;
    } catch (e) {
      return null;
    }
  }

  appDoc(doc) {
    return this.mailFrame(doc) || doc;
  }

  diagnostics(doc) {
    if (!doc) return { hasDocument: false };
    const app = this.appDoc(doc);
    const inFrame = app !== doc;
    const selectors = [
      "[data-message-id]",
      "[data-guid]",
      '[role="option"]',
      '[role="row"]',
      '[role="listitem"]',
      '[role="treeitem"]',
      "time[datetime]",
      "time",
      "[class*='unread' i]",
      "[title]",
      "li[tabindex]",
      "ui-list-item",
    ];
    return {
      hasDocument: true,
      inFrame,
      readyState: doc.readyState,
      appReadyState: app && app.readyState,
      frameReady: !!inFrame,
      visibility: doc.visibilityState,
      appChildren: doc.querySelector("#root, .root-component")?.childElementCount || 0,
      compose: !!(app && app.querySelector(
        '[aria-label*="compose" i], [aria-label*="new message" i], [title*="compose" i], [class*="compose" i]'
      )),
      busy:
        !!doc.querySelector(
          '.init-spinner-container ui-activity-indicator, [aria-busy="true"], [role="progressbar"], iframe.unclaimed'
        ) ||
        !!(app && app !== doc && app.querySelector('[aria-busy="true"], [role="progressbar"]')),
      selectorCounts: Object.fromEntries(
        selectors.map(selector => {
          try {
            return [selector, app ? app.querySelectorAll(selector).length : 0];
          } catch (e) {
            return [selector, -1];
          }
        })
      ),
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
    const app = this.appDoc(doc);
    const rows = app ? this.findRows(app) : [];
    res.rowCount = rows.length;
    res.entries = rows.slice(0, max).map((row, i) => {
      const e = this.extractRow(row, app);
      e.index = i;
      return e;
    });
    return res;
  }

  findRows(doc) {
    const hasText = r => (r.textContent || "").trim().length > 0;
    let rows = [];
    const trySel = sel => {
      try {
        return Array.from(doc.querySelectorAll(sel)).filter(hasText);
      } catch (e) {
        return [];
      }
    };
    rows = trySel("[data-message-id], [data-guid], [data-item-id], [data-email-id]");
    if (!rows.length) rows = trySel('ui-list-item, [role="option"], [role="row"], [role="listitem"], [role="treeitem"]');
    if (!rows.length) rows = trySel('[class*="message" i][class*="item" i], [class*="mail" i][class*="item" i], [class*="conversation" i]');
    if (!rows.length) rows = trySel("ul li, ol li, [role='list'] > *, [role='listbox'] > *").filter(r =>
      r.querySelector("time, [datetime], [class*='date' i], [class*='sender' i]")
    );
    if (!rows.length) {
      const found = [];
      for (const t of doc.querySelectorAll("time[datetime], time, [datetime]")) {
        const row = t.closest("[role='option'], [role='row'], [role='listitem'], li, tr, [class*='item' i]");
        if (row && !found.includes(row)) found.push(row);
      }
      rows = found;
    }
    return Array.from(new Set(rows)).filter(r => {
      const tag = (r.localName || "").toLowerCase();
      const id = r.getAttribute("data-message-id") || r.getAttribute("data-guid") || r.id || "";
      return (
        tag !== "html" &&
        tag !== "body" &&
        !/^placeholder(?:-|$)|skeleton/i.test(id) &&
        r.getAttribute("aria-busy") !== "true" &&
        !/skeleton|placeholder|loading/i.test(r.className || "")
      );
    });
  }

  extractRow(row, doc) {
    const sender = this.findSender(row);
    const time = this.findTime(row);
    return {
      id:
        row.getAttribute("data-message-id") ||
        row.getAttribute("data-guid") ||
        row.getAttribute("data-item-id") ||
        row.id ||
        null,
      subject: this.findSubject(row, doc, sender, time.text),
      sender,
      time: time.text,
      fullDate: time.full,
      unread: this.isUnread(row),
    };
  }

  textOf(n) {
    return n ? (n.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  titled(n) {
    return n ? ((n.getAttribute("title") || n.textContent || "").trim()) : "";
  }

  // Date-ish element inside a row: <time>, [datetime], a [title] or class
  // hint that looks like a date, or short trailing text like "4:41 AM".
  findTimeNode(row) {
    let n = null;
    try { n = row.querySelector("time[datetime], time, [datetime]"); } catch (e) {}
    if (n) return n;
    for (const sel of ["[class*='date' i]", "[class*='time' i]", "[aria-label*='AM' i]", "[aria-label*='PM' i]"]) {
      try { n = row.querySelector(sel); } catch (e) { n = null; }
      if (n && this.textOf(n).length <= 60) return n;
    }
    let best = null;
    let bestLen = 1e9;
    for (const c of row.querySelectorAll("[title]")) {
      const v = (c.getAttribute("title") || "").trim();
      const text = this.textOf(c);
      if (!v || !text || text.length > 60) continue;
      if (
        /\b(?:AM|PM)\b|\d{1,2}:\d{2}|\bago\b|yesterday|\d{1,2}\/\d{1,2}\/\d{2,4}|\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(
          v + " " + text
        ) &&
        text.length < bestLen
      ) {
        best = c;
        bestLen = text.length;
      }
    }
    return best;
  }

  findSubject(row, doc, sender, timeText) {
    for (const sel of [
      "[class*='subject' i]",
      "[data-testid*='subject' i]",
      "[id*='subject' i]",
      '[role="heading"]',
      "h1,h2,h3,h4",
    ]) {
      let n = null;
      try { n = row.querySelector(sel); } catch (e) {}
      const s = this.titled(n);
      if (s) return s;
    }
    const t = this.findTimeNode(row);
    if (t && t.parentElement) {
      for (const sib of t.parentElement.children) {
        if (sib === t || (sib.contains && sib.contains(t))) continue;
        const s = this.textOf(sib);
        if (s) return s;
      }
    }
    return "";
  }

  findSender(row) {
    for (const sel of [
      "[class*='sender' i]",
      "[class*='from' i]",
      "[data-testid*='sender' i]",
      "[data-testid*='from' i]",
      "[class*='author' i]",
    ]) {
      let n = null;
      try { n = row.querySelector(sel); } catch (e) {}
      if (n) {
        const s = this.textOf(n) || (n.getAttribute("title") || "").trim();
        if (s) return s;
      }
    }
    for (const n of row.querySelectorAll("[title]")) {
      const v = (n.getAttribute("title") || "").trim();
      if (!v || v.indexOf("@") === -1) continue;
      const s = this.textOf(n);
      return s || v;
    }
    for (const sel of [
      "[role='img'][aria-label]",
      "img[alt]",
      "[class*='avatar' i][aria-label]",
      "[class*='avatar' i] [alt]",
    ]) {
      let n = null;
      try { n = row.querySelector(sel); } catch (e) {}
      const s = n
        ? (n.getAttribute("aria-label") || n.getAttribute("alt") || "").trim()
        : "";
      if (s) return s;
    }
    // aria-label fallback: "Sender, subject, ..." first segment.
    const label = (row.getAttribute("aria-label") || "").trim();
    if (label) {
      const seg = label.split(/[,\u2014\u2013]| - |\s\|\s/)[0].trim();
      if (seg && seg.length <= 80) return seg;
    }
    return "";
  }

  findTime(row) {
    const n = this.findTimeNode(row);
    if (!n) return { text: "", full: "" };
    return {
      text: this.textOf(n),
      full: n.getAttribute("title") || n.getAttribute("datetime") || "",
    };
  }

  isUnread(row) {
    const cls = row.classList;
    if (cls && cls.contains("unread")) return true;
    if (cls && cls.contains("read") && !cls.contains("unread")) return false;
    const clsName = typeof row.className === "string" ? row.className : "";
    if (/\bunread\b/i.test(clsName)) return true;
    if (/\bread\b/i.test(clsName)) return false;
    const aria = (row.getAttribute("aria-label") || "").trim();
    if (/^unread\b/i.test(aria)) return true;
    if (
      row.querySelector(
        "[class*='unread' i], [data-icon*='unread' i], [aria-label*='unread' i]"
      )
    )
      return true;
    if (
      row.querySelector(
        '[title="Mark as unread" i], [aria-label*="Mark as unread" i]'
      )
    )
      return false;
    if (
      row.querySelector(
        '[title="Mark as read" i], [aria-label*="Mark as read" i]'
      )
    )
      return true;
    if (/\bunread\b/i.test(aria)) return true;
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
    const doc = this.appDoc(this.doc());
    if (!doc) return false;
    let row = null;
    if (id) {
      for (const attr of ["data-message-id", "data-guid", "data-item-id"]) {
        try {
          row = doc.querySelector("[" + attr + '="' + this.cssEscape(id) + '"]');
        } catch (e) {}
        if (row) break;
      }
      if (!row && doc.getElementById) {
        try {
          row = doc.getElementById(id);
        } catch (e) {}
      }
    }
    if (!row && typeof index === "number" && index >= 0) {
      row = this.findRows(doc)[index] || null;
    }
    if (!row) return false;
    row.click();
    return true;
  }

  compose() {
    const doc = this.appDoc(this.doc());
    if (!doc) return false;
    const sels = [
      '[aria-label*="new message" i]',
      '[aria-label*="compose" i]',
      '[title*="compose" i]',
      '[title*="new message" i]',
      '[data-testid*="compose" i]',
      '[class*="compose" i]',
      '[aria-label*="write" i]',
    ];
    for (const sel of sels) {
      let b = null;
      try { b = doc.querySelector(sel); } catch (e) {}
      if (b) { b.click(); return true; }
    }
    const cands = doc.querySelectorAll("button, [role='button'], a, ui-button");
    for (const b of cands) {
      const name = (b.getAttribute("aria-label") || b.getAttribute("title") || b.textContent || "").trim();
      if (/new (message|mail|email)|compose|nouveau|escribir|verfassen|neu|scrivi/i.test(name)) {
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
    PathUtils.join(PathUtils.profileDir, "chrome", "JS", "icloud-peek"),
    PathUtils.join(PathUtils.profileDir, "chrome", "icloud-peek"),
  ];
  const ACTOR_BASES = [
    "chrome://userscripts/content/icloud-peek/",
    "chrome://userchromejs/content/icloud-peek/",
  ];
  const ACTOR_MATCHES = [
    "https://icloud.com/*",
    "https://www.icloud.com/*",
    "https://beta.icloud.com/*",
    "https://icloud.com.cn/*",
    "https://www.icloud.com.cn/*",
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
          PathUtils.join(dir, "ICloudPeekParent-20261001-release.sys.mjs"),
          PARENT_SOURCE
        );
        await IOUtils.writeUTF8(
          PathUtils.join(dir, "ICloudPeekChild-20261001-release.sys.mjs"),
          CHILD_SOURCE
        );
      } catch (err) {
        console.warn(TAG, "actor file write failed for", dir, err);
      }
    }

    let base = null;
    for (const b of ACTOR_BASES) {
      if (await probe(b + "ICloudPeekChild-20261001-release.sys.mjs")) {
        base = b;
        break;
      }
    }
    const dataUri = src =>
      "data:text/javascript;charset=utf-8," + encodeURIComponent(src);
    childModuleURI = base
      ? base + "ICloudPeekChild-20261001-release.sys.mjs"
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
          base + "ICloudPeekParent-20261001-release.sys.mjs",
          base + "ICloudPeekChild-20261001-release.sys.mjs"
        )
      : buildOptions(dataUri(PARENT_SOURCE), dataUri(CHILD_SOURCE));
    try {
      const parentModule = ChromeUtils.importESModule(options.parent.esModuleURI);
      const childModule = ChromeUtils.importESModule(options.child.esModuleURI);
      if (typeof parentModule.ICloudPeekParent !== "function" ||
          typeof childModule.ICloudPeekChild?.prototype.collect !== "function") {
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
    #icloudpeek-panel {
      --ip-bg: var(--panel-background, Field);
      --ip-fg: var(--panel-color, FieldText);
      --ip-dim: color-mix(in srgb, var(--ip-fg) 55%, transparent);
      --ip-hover: color-mix(in srgb, var(--ip-fg) 8%, transparent);
      --ip-border: color-mix(in srgb, var(--ip-fg) 15%, transparent);
    }
    #icloudpeek-panel .ip-box {
      width: 340px;
      font: menu;
      color: var(--ip-fg);
      padding: 4px 0 42px;
      position: relative;
    }
    #icloudpeek-panel .ip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--ip-dim);
      letter-spacing: 0.02em;
    }
    #icloudpeek-panel .ip-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 400;
    }
    #icloudpeek-panel .ip-refresh {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--ip-dim);
    }
    #icloudpeek-panel .ip-refresh:hover {
      background: var(--ip-hover);
      color: var(--ip-fg);
    }
    #icloudpeek-panel .ip-refresh.ip-spin svg {
      animation: ip-rot 0.7s linear infinite;
    }
    @keyframes ip-rot {
      to { transform: rotate(360deg); }
    }
    #icloudpeek-panel .ip-row {
      display: block;
      padding: 8px 14px;
      cursor: pointer;
      border-top: 1px solid transparent;
    }
    #icloudpeek-panel .ip-row:hover,
    #icloudpeek-panel .ip-row:focus-visible {
      background: var(--ip-hover);
    }
    #icloudpeek-panel .ip-topline {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    #icloudpeek-panel .ip-author {
      font-size: 13px;
      font-weight: 650;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #icloudpeek-panel .ip-time {
      font-size: 11px;
      color: var(--ip-dim);
      flex-shrink: 0;
      max-width: 40%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #icloudpeek-panel .ip-subject {
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #icloudpeek-panel .ip-row.ip-read .ip-author,
    #icloudpeek-panel .ip-row.ip-read .ip-subject {
      opacity: 0.55;
    }
    #icloudpeek-panel .ip-compose {
      position: absolute;
      right: 10px;
      bottom: 8px;
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 50%;
      border: 1px solid var(--ip-border);
      background: var(--ip-bg);
      color: var(--ip-fg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    #icloudpeek-panel .ip-compose svg {
      display: block;
    }
    #icloudpeek-panel .ip-compose:hover {
      background: var(--ip-hover);
    }
    #icloudpeek-panel .ip-status {
      padding: 18px 14px;
      font-size: 13px;
      color: var(--ip-dim);
      text-align: center;
    }
    #icloudpeek-panel .ip-status.ip-link {
      cursor: pointer;
      text-decoration: underline;
    }
    #icloudpeek-panel .ip-refreshing {
      position: absolute;
      left: 14px;
      bottom: 15px;
      font-size: 11px;
      font-weight: 400;
      color: var(--ip-dim);
    }
  `;

  const BADGE_STYLE =
    "position:absolute;top:-3px;right:-4px;min-width:14px;height:14px;" +
    "padding:0 3px;border-radius:7px;background:#0a84ff;color:#fff;" +
    "font-size:9.5px;font-weight:700;line-height:14px;text-align:center;" +
    "pointer-events:none;box-sizing:border-box;";

  class ICloudPeek {
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
      this.icloudTabs = new Set();
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
      for (const tab of this.icloudTabs) {
        (tab.shadowRoot || tab).querySelector(".icloudpeek-badge")?.remove();
      }
      for (const ph of this.phantoms.values()) {
        try {
          ph.browser?.remove();
        } catch {}
      }
      this.phantoms.clear();
      document.getElementById("icloudpeek-phantoms")?.remove();
      window.icloudPeek = null;
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
      return m ? m[1] : "www.icloud.com";
    }

    accountForTab(tab) {
      const specs = [
        tab._zenPinnedInitialState?.entry?.url,
        tab.linkedBrowser?.currentURI?.spec,
      ];
      for (const spec of specs) {
        const m =
          typeof spec === "string" ? spec.match(/\/mail\/(\d+)\//) : null;
        if (m) return m[1];
      }
      return defaultAccount();
    }

    // Resolved peek target: iCloud Mail always lives at /mail/ — the
    // folder/detail state lives inside the inner app iframe, not the URL —
    // so the phantom just lands on the mail root and we rely on the
    // unread-filtering in packageResult.
    peekParts(tab) {
      const home = tab?._zenPinnedInitialState?.entry?.url;
      const spec = home || this.tabUrl(tab);
      try {
        const u = new URL(spec);
        return {
          origin: u.origin,
          acct: this.accountForTab(tab),
          label: "inbox",
        };
      } catch {}
      return null;
    }

    labelForTab(tab) {
      const slug = this.peekParts(tab)?.label;
      if (!slug) return "iCloud Mail";
      return slug
        .split("-")
        .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
    }

    isICloudTab(tab) {
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
        try {
          const u = new URL(spec);
          return (
            ICLOUD_HOSTS.test(u.hostname) &&
            /^\/(?:[a-z]{2}-[a-z]{2}\/)?mail\d*\b/i.test(u.pathname)
          );
        } catch {
          return false;
        }
      });
    }

    scanTabs() {
      for (const tab of gBrowser.tabs) {
        if (!this.isICloudTab(tab)) continue;
        this.icloudTabs.add(tab);
        if (!this.boundTabs.has(tab)) {
          this.boundTabs.add(tab);
          tab.addEventListener("mouseenter", this.onHoverIn, false);
          tab.addEventListener("mouseleave", this.onHoverOut, false);
        }
      }
    }

    findICloudTabs() {
      return [...this.icloudTabs].filter(t => t.isConnected);
    }

    // ---------- hover handling ----------

    onHoverIn(e) {
      const tab = asTab(e.target) || asTab(e.currentTarget);
      if (!tab) return;
      if (!this.isICloudTab(tab)) return;
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
      if (tab._ipTooltip === undefined) {
        tab._ipTooltip = {};
        for (const a of ["tooltip", "tooltiptext", "title", "data-tooltip"]) {
          if (tab.hasAttribute(a)) tab._ipTooltip[a] = tab.getAttribute(a);
        }
      }
      for (const a of Object.keys(tab._ipTooltip)) tab.removeAttribute(a);
    }

    restoreTooltip(tab) {
      if (!tab?._ipTooltip) return;
      for (const [a, v] of Object.entries(tab._ipTooltip)) {
        tab.setAttribute(a, v);
      }
      tab._ipTooltip = undefined;
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

    // The mail app always boots at <origin>/mail/ regardless of which
    // folder the tab is sitting on — the inner iframe owns folder state.
    peekUrl(tab) {
      const p = this.peekParts(tab);
      if (p) return `${p.origin}/mail/`;
      return this.inboxUrl(tab);
    }

    phantomContainer() {
      let c = document.getElementById("icloudpeek-phantoms");
      if (!c) {
        c = document.createXULElement
          ? document.createXULElement("box")
          : document.createElementNS(XUL, "box");
        c.id = "icloudpeek-phantoms";
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
        if (!doc || !doc.body || !ICLOUD_HOSTS.test(doc.location?.hostname || "")) return null;
        if (!childModuleURI) return null;
        const mod = ChromeUtils.importESModule(childModuleURI);
        const s = Object.create(mod.ICloudPeekChild.prototype);
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
                const ping = await this.queryActor(actor, "ICloudPeek:Ping", {}, Math.min(3000, deadline - Date.now()));
                if (!ping?.ok) throw new Error(ping?.error || "actor-ping-invalid");
                this.readyActors.add(actor);
              }
              if (Date.now() >= deadline) continue;
              res = await this.queryActor(actor, "ICloudPeek:Collect", { max }, Math.min(3000, deadline - Date.now()));
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

    // iCloud puts the unread count mid-title: "Inbox (1) | iCloud Mail".
    // A leading "(N)" shape (as other providers use) is accepted too.
    countFromTitle(tab, scrapedTitle) {
      const title =
        scrapedTitle || tab.linkedBrowser?.contentTitle || tab.label || "";
      const m =
        title.match(/^\s*\((\d[\d\s.,']*)\)/) ||
        title.match(/\b(?:Inbox|Mail)\s*\((\d[\d\s.,']*)\)/i);
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
              const t = Date.now();
              this.caches.set(tab, { t, refreshedAt: t, data, error: null });
            })
            .catch(err => {
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
      panel.id = "icloudpeek-panel";
      panel.setAttribute("noautofocus", "true");
      panel.setAttribute("consumeoutsideclicks", "false");
      panel.setAttribute("level", "top");
      const box = el("div", "ip-box");
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
        try {
          this.panel.openPopupAtScreen(x, y, false);
        } catch (err) {
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

    setRefreshing(on) {
      this.refreshing = on;
      let status = this.box.querySelector(".ip-refreshing");
      if (!status) {
        status = el("div", "ip-refreshing");
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
          const s = this.box?.querySelector(".ip-refreshing");
          if (!s) return;
          this.refreshDots = (this.refreshDots % 3) + 1;
          s.textContent = "Refreshing" + ".".repeat(this.refreshDots);
        }, 300);
      } else {
        status.textContent = cache?.error
          ? `Refresh failed${stamp ? " · " + stamp : ""}`
          : stamp;
      }
      this.box.querySelector(".ip-refresh")?.classList.toggle("ip-spin", on);
    }

    renderLoading() {
      this.box.replaceChildren(el("div", "ip-status", "Loading inbox…"));
    }

    render(cache, tab) {
      const box = this.box;
      box.replaceChildren();
      this.setRefreshing(this.refreshing);
      const max = iPref(PREF + "max_items", 6);
      const multi =
        new Set([...this.icloudTabs].map(t => this.accountForTab(t))).size > 1;

      const header = el("div", "ip-header");
      const label = this.labelForTab(tab);
      header.appendChild(
        el(
          "span",
          null,
          multi ? `${label} · u/${this.accountForTab(tab)}` : label
        )
      );
      const right = el("div", "ip-header-right");
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
      header.appendChild(right);
      box.appendChild(header);

      if (cache.error) {
        const loading =
          cache.error === "phantom-timeout" ||
          cache.error === "empty-document" ||
          cache.error === "no-response";
        const msg = loading
          ? "iCloud Mail is still loading — hover again in a few seconds."
          : `Couldn't read inbox (${cache.error}). Click to open.`;
        const status = el("div", "ip-status ip-link", msg);
        status.setAttribute("data-open-inbox", "1");
        box.appendChild(status);
        box.appendChild(this.composeButton());
        return;
      }

      const { entries } = cache.data;
      if (!entries.length) {
        box.appendChild(
          el("div", "ip-status", "No unread mail — you're all caught up.")
        );
        const status = box.lastChild;
        status.classList.add("ip-link");
        status.setAttribute("data-open-inbox", "1");
      } else {
        entries.slice(0, max).forEach((entry, i) => {
          const row = el("div", "ip-row");
          if (entry.unread === false) row.classList.add("ip-read");
          if (entry.id) row.setAttribute("data-id", entry.id);
          row.setAttribute("data-index", String(entry.index ?? i));
          const top = el("div", "ip-topline");
          top.appendChild(el("span", "ip-author", entry.sender || "?"));
          top.appendChild(
            el("span", "ip-time", entry.time || entry.fullDate || "")
          );
          row.appendChild(top);
          row.appendChild(
            el("div", "ip-subject", entry.subject || "(no subject)")
          );
          box.appendChild(row);
        });
      }
      box.appendChild(this.composeButton());
    }

    composeButton() {
      const btn = el("div", "ip-compose");
      btn.setAttribute("data-compose", "1");
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-label", "Compose");
      btn.appendChild(makeIcon(["M6.5 2.5v8", "M2.5 6.5h8"], 13, 1.8));
      return btn;
    }

    refreshButton() {
      const btn = el("div", "ip-refresh");
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
      const row = e.target.closest(".ip-row");
      const refresh = e.target.closest("[data-refresh]");
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
        this.openEntry(
          tab,
          row.getAttribute("data-id"),
          Number(row.getAttribute("data-index"))
        );
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
      return `https://${this.hostForTab(tab)}/mail/`;
    }

    composeUrl(tab) {
      return `https://${this.hostForTab(tab)}/mail/`;
    }

    navigate(tab, url) {
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

    // iCloud has no stable public deep-link to a message, so we ask the
    // real tab's actor to click the row inside the live app — works only
    // while the pinned tab is awake. Asleep or actorless: just focus it.
    async openEntry(tab, id, index) {
      const actor = this.actorFor(tab);
      if (actor) {
        try {
          const res = await this.queryActor(
            actor,
            "ICloudPeek:Open",
            { id, index },
            3000
          );
          if (res?.ok) {
            this.focusTab(tab);
            return;
          }
        } catch {}
      }
      this.navigate(tab, this.inboxUrl(tab));
    }

    async composeIn(tab) {
      const actor = this.actorFor(tab);
      let ok = false;
      if (actor) {
        try {
          const res = await actor.sendQuery("ICloudPeek:Compose", {});
          ok = !!res?.ok;
        } catch {}
      }
      this.focusTab(tab);
      if (!ok) this.navigate(tab, this.composeUrl(tab));
    }

    // ---------- badge ----------

    async refreshBadge() {
      this.scanTabs();
      const tabs = this.findICloudTabs();
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
      let badge = host.querySelector(".icloudpeek-badge");
      if (count > 0) {
        if (getComputedStyle(host).position === "static") {
          host.style.position = "relative";
        }
        if (!badge) {
          badge = el("span", "icloudpeek-badge");
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
      window.icloudPeek = new ICloudPeek();
      window.icloudPeek.init().catch(err =>
        console.error(TAG, "init failed:", err)
      );
    } catch (err) {
      console.error(TAG, "boot failed:", err);
    }
  };

  if (document.readyState === "complete") {
    boot();
  } else {
    window.addEventListener("load", boot, { once: true });
    setTimeout(() => {
      if (!window.icloudPeek) boot();
    }, 1500);
  }
})();
