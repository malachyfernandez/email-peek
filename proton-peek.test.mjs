import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("./proton-peek.uc.js", import.meta.url), "utf8");
const context = {
  window: {},
  console,
  setTimeout,
  clearTimeout,
  // unref so a leftover interval can't keep the test process alive
  setInterval: (fn, ms) => setInterval(fn, ms).unref(),
  clearInterval,
  Services: { prefs: { getPrefType: () => 0 } },
};
vm.runInNewContext(source.replace(
  "  const boot = () => {",
  "  globalThis.subject = { CHILD_SOURCE, PARENT_SOURCE, ProtonPeek, ensureActor }; return;\n  const boot = () => {"
), context);
const { CHILD_SOURCE, PARENT_SOURCE, ProtonPeek } = context.subject;
const gmailContext = { window: {}, console, setTimeout, clearTimeout, setInterval: context.setInterval, clearInterval, Services: context.Services };
vm.runInNewContext(readFileSync(new URL("./gmail-peek.uc.js", import.meta.url), "utf8").replace(
  "  const boot = () => {",
  "  globalThis.GmailPeek = GmailPeek; return;\n  const boot = () => {"
), gmailContext);
const { GmailPeek } = gmailContext;

function uiNode() {
  return {
    children: [],
    textContent: "",
    className: "",
    attributes: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute(name, value) { this.attributes[name] = value; },
    appendChild(child) { this.children.push(child); return child; },
    replaceChildren(...children) { this.children = children; },
    get lastChild() { return this.children.at(-1); },
    querySelector(selector) {
      const name = selector.slice(1);
      for (const child of this.children) {
        if (child.className.split(" ").includes(name)) return child;
        const match = child.querySelector(selector);
        if (match) return match;
      }
      return null;
    },
  };
}
context.document = gmailContext.document = { createElementNS: () => uiNode() };

for (const [name, Peek, prefix, get, load] of [
  ["Gmail", GmailPeek, "gp", "getFeed", "fetchFeed"],
  ["Proton", ProtonPeek, "pp", "getPeek", "scrapeTab"],
]) {
  function fixture() {
    const peek = new Peek();
    const tab = { getBoundingClientRect: () => ({ right: 1, top: 1 }) };
    peek.currentTab = peek.hoverTab = tab;
    peek.accountForTab = () => "0";
    peek.labelForTab = () => "Inbox";
    peek.box = uiNode();
    peek.panel = { state: "open" };
    peek.paintBadge = () => {};
    return { peek, tab, key: name === "Gmail" ? "0" : tab };
  }

  test(`${name} refreshes on every opening, even inside the cache TTL`, async () => {
    const { peek, tab, key } = fixture();
    let requests = 0;
    peek[load] = async () => { requests++; return { count: 0, entries: [] }; };
    peek.caches.set(key, { t: Date.now(), data: { count: 0, entries: [] }, error: null });
    await peek.show(tab);
    await peek.show(tab);
    assert.equal(requests, 2);
    assert.match(peek.box.querySelector(`.${prefix}-refreshing`).textContent, /^Refreshed /);
  });

  test(`${name} displays progress and finishes after the pointer enters the popup`, async () => {
    const { peek, tab } = fixture();
    let finish;
    peek[load] = () => new Promise(resolve => { finish = resolve; });
    const opening = peek.show(tab);
    assert.match(peek.box.querySelector(`.${prefix}-refreshing`).textContent, /^Refreshing\.{1,3}$/);
    await new Promise(resolve => setTimeout(resolve, 700));
    const dots = peek.box.querySelector(`.${prefix}-refreshing`).textContent.match(/\.+$/)[0].length;
    assert.ok(dots >= 2 && dots <= 3, "refresh dots animate from . to .. to ...");
    peek.hoverTab = null;
    finish({ count: 0, entries: [] });
    await opening;
    assert.match(peek.box.querySelector(`.${prefix}-refreshing`).textContent, /^Refreshed /);
    assert.ok(peek.box.querySelector(`.${prefix}-compose`));
  });

  test(`${name} manual refresh shares an in-flight request and shows progress`, async () => {
    const { peek, tab } = fixture();
    let finish;
    let requests = 0;
    peek[load] = () => { requests++; return new Promise(resolve => { finish = resolve; }); };
    const opening = peek.show(tab);
    const manual = peek.doRefresh();
    assert.equal(requests, 1);
    assert.match(peek.box.querySelector(`.${prefix}-refreshing`).textContent, /^Refreshing\.{1,3}$/);
    finish({ count: 0, entries: [] });
    await Promise.all([opening, manual]);
    assert.match(peek.box.querySelector(`.${prefix}-refreshing`).textContent, /^Refreshed /);
  });

  test(`${name} failures preserve the last successful refresh timestamp`, async () => {
    const { peek, tab, key } = fixture();
    const refreshedAt = Date.now() - 60000;
    peek.caches.set(key, { t: refreshedAt, refreshedAt, data: { count: 0, entries: [] }, error: null });
    peek[load] = async () => { throw new Error("offline"); };
    await peek.show(tab);
    assert.equal(peek.caches.get(key).refreshedAt, refreshedAt);
    assert.match(peek.box.querySelector(`.${prefix}-refreshing`).textContent, /^Refresh failed · Refreshed /);
  });

  test(`${name} a late refresh cannot overwrite another tab's panel`, async () => {
    const { peek, tab } = fixture();
    let finish;
    peek[load] = () => new Promise(resolve => { finish = resolve; });
    const opening = peek.show(tab);
    peek.currentTab = {};
    peek.box.replaceChildren();
    finish({ count: 0, entries: [] });
    await opening;
    assert.equal(peek.box.children.length, 0);
  });
}

function scraper(document) {
  const scope = { JSWindowActorChild: class {}, console };
  vm.runInNewContext(CHILD_SOURCE.replace("export class ProtonPeekChild", "globalThis.ProtonPeekChild = class ProtonPeekChild"), scope);
  const child = new scope.ProtonPeekChild();
  child.document = document;
  return child;
}

test("runtime-generated actor modules parse, not just their outer wrapper", () => {
  for (const module of [PARENT_SOURCE, CHILD_SOURCE]) {
    const result = spawnSync(process.execPath, ["--input-type=module", "--check"], { input: module, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  assert.equal(CHILD_SOURCE.includes("\b"), false, "no backspace characters in embedded regexes");
});

test("unread ARIA fallback preserves regex word boundaries", () => {
  const child = scraper(null);
  const row = label => ({ querySelector: () => null, getAttribute: () => label });
  assert.equal(child.isUnread(row("Unread message")), true);
  assert.equal(child.isUnread(row("notunread")), null);
});

test("CSS escape fallback preserves the literal backslash", () => {
  assert.equal(scraper(null).cssEscape('id"/a'), 'id\\"\\/a');
});

test("collect and message errors return structured responses", () => {
  const child = scraper(null);
  assert.equal(child.receiveMessage({ name: "ProtonPeek:Collect", data: {} }).error, "empty-document");
  assert.equal(child.receiveMessage({ name: "unknown" }).error, "unknown-message");
  child.collect = () => { throw new Error("fixture failure"); };
  assert.equal(child.receiveMessage({ name: "ProtonPeek:Collect" }).error, "fixture failure");
});

test("collect extracts sender, full subject, displayed date and unread state", () => {
  const node = (textContent, title) => ({ textContent, getAttribute: name => name === "title" ? title : null });
  const row = {
    localName: "div",
    classList: { contains: name => name === "unread" },
    getAttribute: name => name === "data-element-id" ? "fixture-id" : null,
    querySelector: selector => {
      if (selector === '[data-testid$=":subject"]') return node("Short", "Full subject");
      if (selector === '[data-testid$="sender-address"]') return node("Alice", "alice@example.test");
      if (selector.startsWith("time[datetime]")) return node("12:34", "Full date");
      return null;
    },
  };
  const doc = {
    body: {},
    title: "(1) Inbox | Proton Mail",
    location: { href: "https://mail.proton.me/u/1/inbox" },
    querySelector: () => null,
    querySelectorAll: selector => selector === "[data-element-id]" ? [row] : [],
  };
  const result = scraper(doc).collect(6);
  assert.equal(result.rowCount, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(result.entries[0])), {
    id: "fixture-id", subject: "Full subject", sender: "Alice", time: "12:34", fullDate: "Full date", unread: true, index: 0,
  });
});

test("list URL normalization forces unread filter and keeps other params", () => {
  context.URL = URL;
  context.URLSearchParams = URLSearchParams;
  const peek = new ProtonPeek();
  const stub = spec => ({ linkedBrowser: { currentURI: { spec } } });
  assert.equal(
    peek.peekUrl(stub("https://mail.proton.me/u/1/almost-all-mail/message-id#filter=unread")),
    "https://mail.proton.me/u/1/almost-all-mail#filter=unread"
  );
  assert.equal(
    peek.peekUrl(stub("https://mail.proton.me/u/1/inbox#category=primary")),
    "https://mail.proton.me/u/1/inbox#category=primary&filter=unread"
  );
  assert.equal(
    peek.peekUrl(stub("https://mail.proton.me/u/0/inbox")),
    "https://mail.proton.me/u/0/inbox#filter=unread"
  );
});

test("read rows are dropped so only unread mail is listed", () => {
  const peek = new ProtonPeek();
  const tab = { linkedBrowser: { contentTitle: "Inbox | Proton Mail" }, label: "Inbox" };
  const res = peek.packageResult(tab, {
    title: "Inbox",
    entries: [
      { id: "a", unread: true },
      { id: "b", unread: false },
      { id: "c", unread: null },
    ],
  });
  assert.deepEqual(res.entries.map(e => e.id), ["a", "c"]);
});

test("ping verifies document access without emitting trace messages", () => {
  const child = scraper({ querySelector: () => null, querySelectorAll: () => [] });
  const traces = [];
  child.sendAsyncMessage = (name, data) => traces.push({ name, data });
  const result = child.receiveMessage({ name: "ProtonPeek:Ping", data: { requestId: 7 } });
  assert.equal(result.ok, true);
  assert.equal(result.diagnostics.hasDocument, true);
  assert.equal(traces.length, 0);
});

test("release builds have no routine or debug console logging", () => {
  const gmailSource = readFileSync(new URL("./gmail-peek.uc.js", import.meta.url), "utf8");
  for (const code of [source, gmailSource, CHILD_SOURCE, PARENT_SOURCE]) {
    assert.doesNotMatch(code, /console\.log|\bdebug\(|ProtonPeek:Trace/);
  }
  const theme = JSON.parse(readFileSync(new URL("./theme.json", import.meta.url), "utf8"));
  const preferences = JSON.parse(readFileSync(new URL("./preferences.json", import.meta.url), "utf8"));
  assert.equal(theme.version, "1.5.0");
  assert.ok(theme.scripts["gmail-peek.uc.js"]);
  assert.ok(theme.scripts["proton-peek.uc.js"]);
  assert.equal(preferences.some(pref => pref.property.endsWith(".debug")), false);
});

test("query timeouts are explicit; successful and rejected queries are handled", async () => {
  const peek = new ProtonPeek();
  await assert.rejects(peek.queryActor({ sendQuery: () => new Promise(() => {}) }, "ProtonPeek:Ping", {}, 5), /actor-query-timeout: ProtonPeek:Ping/);
  const value = await peek.queryActor({ sendQuery: (_, data) => Promise.resolve({ ok: true, requestId: data.requestId }) }, "ProtonPeek:Ping", {}, 20);
  assert.equal(value.ok, true);
  assert.equal(value.requestId, 2);
  await assert.rejects(peek.queryActor({ sendQuery: () => Promise.reject(new Error("disconnected")) }, "ProtonPeek:Ping", {}, 20), /disconnected/);
});

test("startup imports actual emitted sources before registering restricted actors", async () => {
  const files = new Map();
  let options;
  context.PathUtils = { profileDir: "/fixture", join: (...parts) => parts.join("/") };
  context.IOUtils = { makeDirectory: async () => {}, writeUTF8: async (path, content) => files.set(path.split("/").pop(), content) };
  context.fetch = async () => ({ ok: true });
  context.ChromeUtils = {
    importESModule: uri => {
      const code = files.get(uri.split("/").pop());
      assert.ok(code, "preflight loads a file written by ensureActor");
      const scope = { JSWindowActorParent: class {}, JSWindowActorChild: class {}, Services: context.Services };
      vm.runInNewContext(code.replace(/export class (\w+)/, "globalThis.$1 = class $1"), scope);
      return scope;
    },
    registerWindowActor: (name, value) => { assert.equal(name, "ProtonPeek"); options = value; },
  };
  await context.subject.ensureActor();
  assert.equal(options.safeForUntrustedWebProcess, true);
  assert.equal(options.allFrames, false);
  assert.equal(options.child.matches, undefined);
  assert.equal(options.child.remoteTypes, undefined);
  assert.deepEqual(Array.from(options.matches), ["https://mail.proton.me/*", "https://mail.protonmail.com/*"]);
  assert.ok(options.remoteTypes.includes("web"));
  assert.ok(options.remoteTypes.every(type => !type.includes("=")));
  const child = scraper(null);
  const doc = { body: {}, location: { hostname: "mail.proton.me" }, querySelector: () => null, querySelectorAll: () => [] };
  Object.defineProperty(Object.getPrototypeOf(child), "document", { get() { throw new Error("native getter on non-actor"); } });
  context.ChromeUtils.importESModule = () => ({ ProtonPeekChild: child.constructor });
  assert.equal(new ProtonPeek().directScrape({ contentDocument: doc }, 6).rowCount, 0);
});

test("startup fails before registration if a generated module cannot import", async () => {
  let registered = false;
  context.ChromeUtils = {
    importESModule: () => { throw new SyntaxError("fixture invalid module"); },
    registerWindowActor: () => { registered = true; },
  };
  const previous = context.console;
  let reported = false;
  context.console = { ...console, error: () => { reported = true; } };
  try {
    await assert.rejects(context.subject.ensureActor(), /actor-module-invalid: fixture invalid module/);
    assert.equal(registered, false);
    assert.equal(reported, true);
  } finally {
    context.console = previous;
  }
});

test("empty phantom results do not starve a working real-tab fallback", async () => {
  const peek = new ProtonPeek();
  const phantom = {};
  const real = {};
  peek.phantomFor = () => ({ browser: phantom });
  peek.directScrape = browser => browser === phantom
    ? { entries: [], diagnostics: { compose: true } }
    : { entries: [{ unread: true }], rowCount: 1 };
  const result = await peek.scrapeTab({ linkedBrowser: real });
  assert.equal(result.entries.length, 1);
});

test("Proton loading skeleton IDs are never treated as mail", () => {
  const row = id => ({ localName: "div", getAttribute: name => name === "data-element-id" ? id : null });
  const rows = [row("placeholder-0"), row("placeholder-11"), row("real-message")];
  const child = scraper({ querySelectorAll: () => rows });
  assert.equal(child.findRows(child.document).length, 1);
  assert.equal(child.findRows(child.document)[0].getAttribute("data-element-id"), "real-message");
});

test("an SPA shell is not accepted as a successfully empty mailbox", async () => {
  const peek = new ProtonPeek();
  const previous = context.Services.prefs;
  context.Services.prefs = {
    PREF_INT: 2,
    getPrefType: name => name.endsWith("load_timeout") ? 2 : 0,
    getIntPref: () => 5,
  };
  peek.phantomFor = () => ({ browser: {} });
  peek.directScrape = () => ({ title: "Proton Mail", entries: [], diagnostics: { compose: false, appChildren: 0 } });
  try {
    await assert.rejects(peek.scrapeTab({}), /mailbox-not-rendered/);
  } finally {
    context.Services.prefs = previous;
  }
});
