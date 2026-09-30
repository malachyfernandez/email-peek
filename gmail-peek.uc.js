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
      for (const tab of gBrowser.tabs) {
        if (!this.isGmailTab(tab)) continue;
        this.gmailTabs.add(tab);
        if (!this.boundTabs.has(tab)) {
          this.boundTabs.add(tab);
          // Direct listeners: belt & suspenders in case delegation misses.
          tab.addEventListener("mouseenter", this.onHoverIn, false);
          tab.addEventListener("mouseleave", this.onHoverOut, false);
        }
      }
    }

    findGmailTabs() {
      return [...this.gmailTabs].filter(t => t.isConnected);
    }

    // ---------- hover handling ----------

    onHoverIn(e) {
      const tab = asTab(e.target) || asTab(e.currentTarget);
      if (!tab) return;
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
      this.hoverTimer = setTimeout(() => {
        this.show(tab).catch(err =>
          console.warn(TAG, "show failed:", err)
        );
      }, iPref("mod.gmailpeek.hover_delay", 400));
    }

    leaveTab() {
      clearTimeout(this.hoverTimer);
      if (this.hoverTab) this.restoreTooltip(this.hoverTab);
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
      const res = await fetch(feedUrl(acct), init);
      if (/ServiceLogin|accounts\.google\.com/.test(res.url)) {
        throw new Error("signed-out");
      }
      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}${init._ucid ? ` · ctx${init._ucid}` : ""}`
        );
      }
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "text/xml");
      if (doc.getElementsByTagName("parsererror").length) {
        throw new Error("signed-out");
      }
      const countEl = doc.getElementsByTagNameNS("*", "fullcount")[0];
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
        return Promise.resolve(cache);
      }
      if (!this.inflights.has(acct)) {
        this.inflights.set(
          acct,
          this.fetchFeed(acct, tab)
            .then(data => {
              const t = Date.now();
              this.caches.set(acct, { t, refreshedAt: t, data, error: null });
            })
            .catch(err => {
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
