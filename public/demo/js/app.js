import { api } from "./api.js";
import { h, mount, icon, clear, button, brandMark, notice, toast } from "./dom.js";
import overview from "./views/overview.js";
import attention from "./views/attention.js";
import questions from "./views/questions.js";
import channels from "./views/channels.js";
import routes from "./views/routes.js";
import notifications from "./views/notifications.js";
import sounds from "./views/sounds.js";
import agents from "./views/agents.js";
import about from "./views/about.js";
import usage from "./views/usage.js";
import quota from "./views/quota.js";
import routerProviders from "./views/router-providers.js";
import routerRouting from "./views/router-routing.js";
import routerAgents from "./views/router-agents.js";
import routerActivity from "./views/router-activity.js";
import routerEffort from "./views/router-effort.js";
import insights from "./views/insights.js";

// The broker runs three systems: notifications, the model router, and insights. The navigation says
// so directly — one block per system — so a page's owner is visible from where it sits. Overview
// summarises all three and About describes the install, so neither belongs to a system.
//
// An entry with `tabs` is one place in the navigation holding several pages that answer the same
// question — what is waiting on me, where does a notification go, how does it behave. Each tab is
// still its own route, so a link to #/questions or #/routes lands on the right tab.
const NAV = [
  { solo: true, items: [
    { path: "overview", title: "Overview", icon: "home", view: overview },
  ] },
  { label: "Notifications", icon: "bell", items: [
    { title: "Inbox", icon: "inbox", tabs: [
      { path: "attention", title: "Attention", view: attention, count: "active_notifications" },
      { path: "questions", title: "Questions", view: questions, count: "pending_questions" },
    ] },
    { title: "Delivery", icon: "send", tabs: [
      { path: "channels", title: "Channels", view: channels },
      { path: "routes", title: "Routes", view: routes },
    ] },
    { title: "Settings", icon: "sliders", tabs: [
      { path: "notifications", title: "General", view: notifications },
      { path: "sounds", title: "Sounds", view: sounds },
    ] },
    { path: "agents", title: "Agents", icon: "plug", view: agents },
  ] },
  { label: "Model router", icon: "router", items: [
    { path: "router", title: "Providers", icon: "server", view: routerProviders },
    { path: "router-routing", title: "Routing", icon: "shuffle", view: routerRouting },
    { path: "router-agents", title: "Agents", icon: "bot", view: routerAgents },
    { path: "router-activity", title: "Activity", icon: "pulse", view: routerActivity },
    { path: "router-effort", title: "Effort mapping", icon: "zap", view: routerEffort },
  ] },
  { label: "Insights", icon: "chart", items: [
    { path: "insights", title: "Dashboard", icon: "grid", view: insights },
    { path: "usage", title: "Usage", icon: "coins", view: usage },
    { path: "quota", title: "Live quota", icon: "gauge", view: quota },
  ] },
  { solo: true, items: [
    { path: "about", title: "About", icon: "info", view: about },
  ] },
];

/** Every routable page, with the navigation entry and system it sits under. */
const ROUTES = new Map(NAV.flatMap((block) => block.items.flatMap((item) =>
  (item.tabs ?? [item]).map((page) => [page.path, { ...page, entry: item, system: block.label }]))));

/** The count keys an entry's badge adds up: its own, or all of its tabs'. */
const countKeys = (item) => (item.tabs ?? [item]).map((page) => page.count).filter(Boolean);

const state = {
  overview: null,
  cleanup: null,
  root: document.getElementById("app"),
  navLinks: new Map(),
  countBadges: [],
  crumbs: null,
  tabHost: null,
  statusDot: null,
  statusText: null,
  shell: null,
  main: null,
  renderToken: 0,
};

// ---- theme ---------------------------------------------------------------------------------

function storedTheme() {
  try { return localStorage.getItem("nokoo-theme"); } catch { return null; }
}

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
}

function currentTheme() {
  return document.documentElement.dataset.theme
    || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

applyTheme(storedTheme());

// ---- shell ---------------------------------------------------------------------------------

function navLink(item) {
  const keys = countKeys(item);
  const count = keys.length ? h("span", { class: "nav-count", hidden: true }) : null;
  const path = item.path ?? item.tabs[0].path;
  const link = h("a", { class: "nav-link", href: `#/${path}`, onClick: closeNav },
    icon(item.icon), h("span", { text: item.title }), count);
  state.navLinks.set(item, link);
  if (count) state.countBadges.push({ keys, el: count });
  return link;
}

/** Writes the shell's counts: navigation badges and, when the page has tabs, the tab badges. */
function paintCounts() {
  const counts = state.overview?.counts || {};
  for (const { keys, el } of state.countBadges) {
    const value = keys.reduce((sum, key) => sum + (counts[key] || 0), 0);
    el.textContent = String(value);
    el.hidden = value === 0;
  }
}

function buildShell() {
  const nav = h("nav", { "aria-label": "Main" });
  for (const block of NAV) {
    if (block.solo) {
      nav.append(h("div", { class: "nav-group nav-solo" }, block.items.map(navLink)));
      continue;
    }
    // A system block is a labelled region, so a screen reader announces which system a link belongs
    // to rather than reading every link in a row.
    const heading = h("div", { class: "nav-system-label" }, icon(block.icon), h("span", { text: block.label }));
    heading.id = `nav-system-${block.label.toLowerCase().replace(/\s+/g, "-")}`;
    nav.append(h("div", { class: "nav-system", role: "group", "aria-labelledby": heading.id },
      heading, h("div", { class: "nav-group" }, block.items.map(navLink))));
  }

  state.statusDot = h("span", { class: "dot" });
  state.statusText = h("span", { text: "Connected" });
  const themeButton = button("", { variant: "ghost", size: "sm", iconName: currentTheme() === "dark" ? "sun" : "moon", title: "Switch theme" });
  themeButton.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("nokoo-theme", next); } catch { /* per-viewer convenience only */ }
    themeButton.replaceChildren(icon(next === "dark" ? "sun" : "moon"));
  });

  const sidebar = h("aside", { class: "sidebar" },
    h("a", { class: "brand", href: "#/overview", onClick: closeNav }, brandMark(),
      h("span", null, h("span", { class: "brand-name", text: "Nokoo" }), h("br"), h("span", { class: "brand-sub", text: "Agent control plane" }))),
    nav);

  // The top bar is the page's own frame: where you are, the tabs of the entry you are in, and —
  // at the right, where status sits in most applications — the broker connection and the theme.
  state.main = h("main", { class: "main", id: "main", tabindex: "-1" });
  state.crumbs = h("div", { class: "crumbs" });
  state.tabHost = h("nav", { class: "page-tabs", "aria-label": "Sections" });
  const topbar = h("header", { class: "topbar" },
    button("", { variant: "ghost", iconName: "menu", title: "Open navigation", onClick: () => state.shell.classList.add("nav-open") }),
    h("div", { class: "topbar-where" }, state.crumbs, state.tabHost),
    h("div", { class: "topbar-status" },
      h("span", { class: "status-pill", role: "status" }, state.statusDot, state.statusText),
      themeButton));

  state.shell = h("div", { class: "shell" }, sidebar, h("div", { class: "grow" }, topbar, state.main));
  const scrim = h("div", { class: "scrim", onClick: closeNav });
  const observer = new MutationObserver(() => {
    if (state.shell.classList.contains("nav-open")) state.shell.append(scrim); else scrim.remove();
  });
  observer.observe(state.shell, { attributes: true, attributeFilter: ["class"] });

  clear(state.root);
  state.root.className = "";
  state.root.removeAttribute("aria-busy");
  state.root.append(state.shell);
}

function closeNav() {
  state.shell?.classList.remove("nav-open");
}

// ---- data shared by the shell --------------------------------------------------------------

export async function refreshOverview() {
  try {
    state.overview = await api.get("overview");
    setConnected(true);
    paintCounts();
    return state.overview;
  } catch (error) {
    setConnected(false);
    return state.overview;
  }
}

function setConnected(connected) {
  if (!state.statusDot) return;
  state.statusDot.classList.toggle("off", !connected);
  state.statusText.textContent = connected ? "Broker connected" : "Broker unreachable";
}

/** Fills the top bar for the current page: its place, and its sibling tabs when it has any. */
function drawFrame(route) {
  const entry = route.entry;
  mount(state.crumbs,
    route.system ? h("span", { class: "crumb", text: route.system }) : null,
    route.system ? icon("chevron", "crumb-sep") : null,
    h("span", { class: "crumb crumb-current", text: entry.title }));

  // Tab badges are rebuilt with the tabs; drop the previous page's before adding this page's.
  state.countBadges = state.countBadges.filter((badge) => !badge.tab);
  if (!entry.tabs) { clear(state.tabHost); state.tabHost.hidden = true; return; }

  state.tabHost.hidden = false;
  mount(state.tabHost, entry.tabs.map((tab) => {
    const count = tab.count ? h("span", { class: "nav-count", hidden: true }) : null;
    if (count) state.countBadges.push({ keys: [tab.count], el: count, tab: true });
    return h("a", { class: "page-tab", href: `#/${tab.path}`, "aria-current": tab.path === route.path ? "page" : null },
      h("span", { text: tab.title }), count);
  }));
  paintCounts();
}

// ---- routing -------------------------------------------------------------------------------

function currentPath() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [path, query] = hash.split("?");
  return { path: path || "overview", params: new URLSearchParams(query || "") };
}

async function render() {
  const { path, params } = currentPath();
  if (!state.shell) {
    buildShell();
    refreshOverview();
  }

  const route = ROUTES.get(path) || ROUTES.get("overview");
  for (const [entry, link] of state.navLinks) {
    if (entry === route.entry) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
  }
  drawFrame(route);
  document.title = `${route.title} · Nokoo`;

  if (state.cleanup) { try { state.cleanup(); } catch { /* view already gone */ } state.cleanup = null; }
  const token = ++state.renderToken;
  clear(state.main);
  const page = h("div", { class: "page" }, h("div", { class: "skeleton" }));
  state.main.append(page);

  const ctx = {
    params,
    overview: () => state.overview,
    refreshOverview,
    isCurrent: () => token === state.renderToken,
    navigate: (to) => { location.hash = `#/${to}`; },
  };
  try {
    const cleanup = await route.view.render(page, ctx);
    if (token === state.renderToken) state.cleanup = typeof cleanup === "function" ? cleanup : null;
    else if (typeof cleanup === "function") cleanup();
  } catch (error) {
    if (token !== state.renderToken) return;
    mount(page, notice(error.message || "Something went wrong loading this page.", "danger"));
  }
}

// ---- start ---------------------------------------------------------------------------------

async function start() {
  await refreshOverview();
  if (!state.overview) {
    mount(state.root, h("div", { class: "boot" }, notice("The Nokoo broker is not responding. Is it still running?", "danger")));
    state.root.removeAttribute("aria-busy");
  } else {
    await render();
  }

  window.addEventListener("hashchange", render);

  // Keeps the navigation counts and the connection indicator honest while the page is open.
  setInterval(() => {
    if (document.visibilityState === "visible" && state.shell) refreshOverview();
  }, 10000);
}

window.addEventListener("unhandledrejection", (event) => {
  toast(event.reason?.message || "Unexpected error.", "error");
});

start();
