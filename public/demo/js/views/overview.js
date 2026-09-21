// The first page. It belongs to no single system: it is the one place that shows all three at once
// — what notifications are doing, what the router is doing, and what the agents are spending — each
// as a band with its own chart, and each linking to the pages that own the detail. Nothing here is
// editable, so it stays a summary rather than a second copy of Attention, Router, Usage, and Quota.

import { api } from "../api.js";
import { h, mount, icon, card, pageHead, badge, notice, button, duration } from "../dom.js";

const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
const precise = new Intl.NumberFormat();
const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const sourceNames = { claude_code: "Claude Code", codex: "Codex", opencode: "OpenCode", kilo: "Kilo", muse: "Muse Code", gemini_cli: "Gemini CLI" };
const providerNames = { claude_code: "Claude Code", codex: "Codex", opencode: "OpenCode" };
const sourceColors = { claude_code: "#8b5cf6", codex: "#3b82f6", opencode: "#14b8a6", kilo: "#f59e0b", muse: "#ec4899", gemini_cli: "#22c55e" };

const tokens = (value) => compact.format(value || 0);
const money = (value) => currency.format(value || 0);
const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const tone = (value) => value < 20 ? "danger" : value < 40 ? "warn" : "ok";
const when = (value) => value ? new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "unknown";

// A panel that cannot reach its route says so in place; the rest of the page still renders.
const safely = (promise) => promise.then((value) => value, () => null);

const stillMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- motion --------------------------------------------------------------------------------

/**
 * A number that counts up to its value once, on first paint. The final text is written first so a
 * reader that never runs the animation — reduced motion, a detached node — still sees the value.
 */
function countUp(value, format = precise.format) {
  const element = h("strong", { class: "dashboard-metric-value", text: format(value) });
  if (stillMotion() || !Number.isFinite(value) || value === 0) return element;

  const started = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - started) / 650);
    // Ease out, so the number decelerates into its final value rather than stopping dead.
    element.textContent = format(Math.round(value * (1 - Math.pow(1 - progress, 3))));
    if (progress < 1) requestAnimationFrame(step);
    else element.textContent = format(value);
  };
  requestAnimationFrame(step);
  return element;
}

const svg = (name, attributes = {}, children = []) => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  for (const child of [children].flat()) if (child) node.append(child);
  return node;
};

/**
 * A filled sparkline over a series of numbers. The line draws itself in left to right, which is the
 * one thing a static bar chart cannot show: the shape arriving in the order the days happened.
 */
function sparkline(values, { color = "var(--accent)", label }) {
  const width = 240;
  const height = 56;
  const points = values.length > 1 ? values : [...values, ...values];
  const max = Math.max(1, ...points);
  const step = width / (points.length - 1);
  const at = (value, index) => [index * step, height - (value / max) * (height - 6) - 3];
  const line = points.map((value, index) => at(value, index).join(",")).join(" ");
  const area = `${line} ${width},${height} 0,${height}`;

  const stroke = svg("polyline", {
    points: line, fill: "none", stroke: color, "stroke-width": 2,
    "stroke-linecap": "round", "stroke-linejoin": "round", class: "spark-line",
  });

  return h("div", { class: "spark", role: "img", "aria-label": label },
    svg("svg", { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none", class: "spark-svg" }, [
      svg("polygon", { points: area, fill: color, class: "spark-area" }),
      stroke,
    ]));
}

/** A ring showing one percentage, drawn clockwise from the top. */
function ring(percent, { label, caption, colorClass = "ok" }) {
  const value = clamp(percent);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const track = svg("circle", { cx: 32, cy: 32, r: radius, class: "ring-track" });
  const fill = svg("circle", {
    cx: 32, cy: 32, r: radius, class: `ring-fill ring-${colorClass}`,
    "stroke-dasharray": circumference,
    "stroke-dashoffset": circumference - (value / 100) * circumference,
    style: `--ring-length:${circumference}`,
  });
  return h("div", { class: "ring", role: "img", "aria-label": label },
    svg("svg", { viewBox: "0 0 64 64", class: "ring-svg" }, [track, fill]),
    h("div", { class: "ring-center" },
      h("strong", { text: `${pct.format(value)}%` }),
      caption ? h("span", { text: caption }) : null));
}

/** A column chart over day buckets, each bar rising in turn. */
function dayColumns(buckets, { label, format = compact.format }) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.value));
  return h("div", { class: "dashboard-chart", role: "img", "aria-label": label },
    buckets.map((bucket, index) =>
      h("div", { class: "chart-column", title: `${bucket.label}: ${precise.format(bucket.value)}` },
        h("span", { class: "chart-value", text: bucket.value ? format(bucket.value) : "" }),
        h("span", { class: "chart-bar", style: { height: `${Math.max(2, bucket.value / max * 100)}%`, "--delay": `${index * 26}ms` } }),
        h("span", { class: "chart-label", text: bucket.short }))));
}

/** Ranked horizontal bars, widest first. */
function ranking(rows, { empty: emptyText }) {
  if (!rows.length) return h("p", { class: "muted small", text: emptyText });
  const max = Math.max(1, ...rows.map((row) => row.value));
  return h("div", { class: "project-ranking" }, rows.map((row, index) =>
    h("div", { class: "project-rank" },
      h("div", { class: "row-between" },
        h("span", { class: "truncate", text: row.label }),
        h("span", { class: "muted small", text: row.detail })),
      h("div", { class: "rank-track" },
        h("span", { class: "rank-fill", style: { width: `${row.value / max * 100}%`, "--delay": `${index * 45}ms` } })))));
}

// ---- shared shapes -------------------------------------------------------------------------

function metric(label, iconName, value, detail, href) {
  return h("a", { class: "card dashboard-metric reveal", href },
    h("span", { class: "dashboard-metric-icon" }, icon(iconName)),
    h("div", null,
      h("span", { class: "stat-label", text: label }),
      typeof value === "string" ? h("strong", { class: "dashboard-metric-value", text: value }) : value,
      h("span", { class: "stat-sub", text: detail })));
}

/** The heading that names one system and links to where its detail lives. */
function band(title, description, href, linkText) {
  return h("div", { class: "dashboard-panel-head" },
    h("div", null, h("h2", { text: title }), h("p", { class: "muted small", text: description })),
    h("a", { class: "small", href, text: linkText }));
}

/** The last `count` days, oldest first, as empty buckets ready to be counted into. */
function dayBuckets(count) {
  const buckets = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let offset = count - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    buckets.push({
      key: date.toDateString(),
      label: date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      short: date.toLocaleDateString(undefined, { day: "numeric" }),
      value: 0,
    });
  }
  return buckets;
}

// ---- notifications ---------------------------------------------------------------------------

/** What the recent feed says about the last fortnight: volume, who sent it, how fast it was answered. */
function notificationShape(items) {
  const buckets = dayBuckets(14);
  const index = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  const byProject = new Map();
  const answered = [];

  for (const item of items) {
    const created = new Date(item.created_at);
    const bucket = index.get(created.toDateString());
    if (bucket) bucket.value++;

    const project = item.project || item.agent || "unattributed";
    byProject.set(project, (byProject.get(project) || 0) + 1);

    if (item.resolved_at) {
      const seconds = (new Date(item.resolved_at) - created) / 1000;
      if (seconds >= 0) answered.push(seconds);
    }
  }

  // Median, not mean: one notification left open over a weekend should not describe the rest.
  answered.sort((left, right) => left - right);
  const median = answered.length ? answered[Math.floor(answered.length / 2)] : null;

  return {
    buckets,
    total: items.length,
    today: buckets[buckets.length - 1].value,
    median,
    projects: [...byProject.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([name, value]) => ({ label: name, value, detail: precise.format(value) })),
  };
}

function notificationsBand(overview, shape) {
  const delivery = overview.delivery;
  const queued = delivery.pending + delivery.processing + delivery.retry;
  const cell = (value, label, danger = false) =>
    h("div", null,
      h("strong", { class: danger && value > 0 ? "balance-danger" : "", text: precise.format(value) }),
      h("span", { text: label }));

  return h("section", { class: "card dashboard-panel reveal" },
    band("Notifications", "What agents have sent you, and what left this computer.", "#/attention", "Attention →"),
    shape
      ? h("div", { class: "overview-split" },
        h("div", { class: "grow" },
          dayColumns(shape.buckets, { label: "Notifications received per day over the last fortnight" }),
          h("p", { class: "muted small", text: shape.total
            ? `${precise.format(shape.total)} in the recent feed · ${precise.format(shape.today)} today · typically answered in ${shape.median === null ? "—" : duration(shape.median)}.`
            : "No notifications have been recorded yet." })),
        h("div", { class: "overview-aside" },
          h("span", { class: "eyebrow", text: "Busiest projects" }),
          ranking(shape.projects, { empty: "Nothing recorded yet." })))
      : notice("The notification feed is not available from this broker.", "warn"),
    h("div", { class: "health-grid" },
      cell(overview.counts.active_notifications, "Active"),
      cell(overview.counts.pending_questions, "Questions"),
      cell(delivery.delivered, "Delivered"),
      cell(queued, "Queued"),
      cell(delivery.dead_letter, "Failed", true)),
    h("p", { class: "muted small", text: `${overview.counts.enabled_providers} of ${overview.counts.providers} channels enabled · ${overview.counts.enabled_routes} of ${overview.counts.routes} routes on.` }),
    delivery.dead_letter > 0
      ? notice(`${delivery.dead_letter} ${delivery.dead_letter === 1 ? "delivery has" : "deliveries have"} failed permanently. Check the channel settings and send a test.`, "warn")
      : null);
}

// ---- model router ------------------------------------------------------------------------------

function routerBand(router, ledger) {
  if (!router) {
    return h("section", { class: "card dashboard-panel reveal" },
      band("Model router", "Provider routing for the agents here.", "#/router", "Router →"),
      notice("The router is not available from this broker.", "warn"));
  }

  const upstreams = router.upstreams || [];
  const routes = router.routes || [];
  const summary = ledger?.summary || [];
  const totals = summary.reduce((sum, entry) => ({
    requests: sum.requests + entry.count,
    ok: sum.ok + entry.ok_count,
    tokens: sum.tokens + entry.input_tokens_sum + entry.output_tokens_sum + entry.reasoning_tokens_sum,
  }), { requests: 0, ok: 0, tokens: 0 });
  const success = totals.requests ? totals.ok / totals.requests * 100 : null;

  const top = summary
    .slice()
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
    .map((entry) => ({
      label: `${entry.upstream_slug}/${entry.model}`,
      value: entry.count,
      detail: `${precise.format(entry.count)} · ${tokens(entry.input_tokens_sum + entry.output_tokens_sum + entry.reasoning_tokens_sum)} tok`,
    }));

  return h("section", { class: "card dashboard-panel reveal" },
    band("Model router", "Where agent model requests go.", "#/router", "Router →"),
    h("div", { class: "row-between" },
      badge(router.enabled ? "Routing" : "Off", router.enabled ? "ok" : "warn"),
      h("span", { class: "muted small", text: router.enabled
        ? `${upstreams.filter((upstream) => upstream.enabled).length} of ${upstreams.length} upstreams · ${routes.filter((route) => route.enabled).length} of ${routes.length} routes`
        : "Nothing is sent to a model provider until you turn it on." })),
    totals.requests
      ? h("div", { class: "overview-split" },
        ring(success, {
          label: `${pct.format(success)} percent of routed requests succeeded this week`,
          caption: "served",
          colorClass: success < 80 ? "danger" : success < 95 ? "warn" : "ok",
        }),
        h("div", { class: "grow" },
          h("span", { class: "eyebrow", text: "Busiest targets, 7 days" }),
          ranking(top, { empty: "No routed requests yet." })))
      : h("p", { class: "muted small", text: router.enabled
        ? "No requests have been routed in the last seven days."
        : "Turn the router on to route model requests through this broker." }),
    totals.requests
      ? h("p", { class: "muted small", text: `${precise.format(totals.requests)} requests · ${tokens(totals.tokens)} tokens through the router this week. Default route: ${router.default_route || "none"}.` })
      : null);
}

// ---- insights ----------------------------------------------------------------------------------

function lowestOf(providers) {
  let lowest = null;
  for (const provider of providers) {
    for (const window of provider.windows || []) {
      if (!lowest || window.remaining_percent < lowest.window.remaining_percent) lowest = { provider, window };
    }
  }
  return lowest;
}

function insightsBand(usage, quota) {
  if (!usage) {
    return h("section", { class: "card dashboard-panel reveal" },
      band("Insights", "What the agents on this machine are spending.", "#/usage", "Usage →"),
      notice("Local usage is not available from this broker.", "warn"));
  }

  const recent = (usage.daily || []).slice(-14);
  const sources = (usage.sources || []).slice().sort((left, right) => right.counts.total - left.counts.total);
  const mixTotal = Math.max(1, sources.reduce((sum, source) => sum + source.counts.total, 0));
  const accounts = (quota?.providers || []).filter((provider) =>
    provider.provider !== "opencode" && (provider.status === "ok" || provider.status === "stale"));
  const windows = accounts
    .flatMap((provider) => (provider.windows || []).map((window) => ({ provider, window })))
    .sort((left, right) => left.window.remaining_percent - right.window.remaining_percent)
    .slice(0, 4);

  return h("section", { class: "card dashboard-panel reveal" },
    band("Insights", "What the agents on this machine are spending, and what is left.", "#/usage", "Usage →"),
    h("div", { class: "overview-trio" },
      h("div", null,
        h("span", { class: "eyebrow", text: "Tokens, last 14 active days" }),
        recent.length
          ? sparkline(recent.map((day) => day.counts.total), { label: "Token usage trend over the last 14 active days" })
          : h("p", { class: "muted small", text: "No usage recorded yet." }),
        h("p", { class: "muted small", text: `${tokens(usage.totals.total)} tokens · ${money(usage.cost.priced_usd)} over 30 days` })),

      h("div", null,
        h("span", { class: "eyebrow", text: "Agent mix" }),
        h("div", { class: "source-legend" }, sources.slice(0, 5).map((source) =>
          h("div", { class: "source-legend-row" },
            h("span", { class: "legend-dot", style: { background: sourceColors[source.source] || "#71717a" } }),
            h("span", { class: "grow truncate", text: sourceNames[source.source] || source.source }),
            h("strong", { text: `${pct.format(source.counts.total / mixTotal * 100)}%` }))))),

      h("div", null,
        h("div", { class: "row-between" },
          h("span", { class: "eyebrow", text: "Tightest balances" }),
          h("a", { class: "small", href: "#/quota", text: "Live quota →" })),
        windows.length
          ? h("div", { class: "stack" }, windows.map(({ provider, window }) => {
            const remaining = clamp(window.remaining_percent);
            return h("div", { class: "dashboard-balance" },
              h("div", { class: "row-between" },
                h("span", { class: "small truncate", text: `${providerNames[provider.provider] || provider.provider} · ${window.label.replace(/^Codex · /, "")}` }),
                h("strong", { class: `balance-${tone(remaining)}`, text: `${pct.format(remaining)}%` })),
              // Provider and account both, on separate lines: one email can hold a Claude Code and a
              // Codex account, and both report a 7-day window, so neither name alone tells rows apart.
              h("span", { class: "muted small truncate", text: provider.account_label || "Current account" }),
              h("div", { class: "balance-track", role: "progressbar", "aria-label": `${provider.account_label} ${window.label} remaining`,
                "aria-valuenow": remaining, "aria-valuemin": "0", "aria-valuemax": "100" },
                h("span", { class: `balance-fill balance-${tone(remaining)}`, style: { width: `${remaining}%` } })));
          }))
          : h("p", { class: "muted small", text: "No Codex or Claude Code account reported a quota window." }))));
}

// ---- getting started ---------------------------------------------------------------------------

function steps(ctx) {
  const step = (number, title, text, to) =>
    h("a", { class: "step", href: `#/${to}` },
      h("span", { class: "badge", text: `Step ${number}` }),
      h("strong", { text: title }),
      h("p", { class: "muted small", text }));

  return card({
    title: "Get an agent connected",
    description: "The skill teaches an agent when to notify you; a harness routes host approvals through it.",
    actions: button("Open agents", { iconName: "bot", onClick: () => ctx.navigate("agents") }),
    body: h("div", { class: "grid-3" },
      step("1", "Install the skill", "Teaches an agent when to notify you and how to ask a question.", "agents"),
      step("2", "Add a channel", "Optional. Reach your phone, chat, or mail when you are away from this screen.", "channels"),
      step("3", "Route what matters", "Decide which notifications leave this computer, by priority, type, project, or agent.", "routes")),
  });
}

// ---- page --------------------------------------------------------------------------------------

export default {
  async render(page, ctx) {
    const draw = (data) => {
      const { overview, usage, quota, router, ledger, feed } = data;
      if (!overview) {
        mount(page, pageHead("Overview", "The broker is not answering."),
          notice("The AgentNotify broker is not responding. Is it still running?", "danger"));
        return;
      }

      const shape = Array.isArray(feed) ? notificationShape(feed) : null;
      const lowest = lowestOf((quota?.providers || []).filter((provider) =>
        provider.provider !== "opencode" && (provider.status === "ok" || provider.status === "stale")));
      const routed = (ledger?.summary || []).reduce((sum, entry) => sum + entry.count, 0);
      const topSource = (usage?.sources || []).reduce(
        (top, source) => !top || source.counts.total > top.counts.total ? source : top, null);
      const nothingYet = !overview.counts.providers && !router?.enabled && !usage?.totals?.total;

      mount(page,
        pageHead("Overview", "All three systems at a glance: notifications, the model router, and insights.",
          button("Refresh", { iconName: "refresh", onClick: () => refresh() })),

        h("div", { class: "dashboard-metrics" },
          metric("Waiting on you", "bell", countUp(overview.counts.active_notifications),
            `${overview.counts.pending_questions} waiting for an answer`, "#/attention"),
          metric("Routed this week", "router", router?.enabled ? countUp(routed, compact.format) : "Off",
            router?.enabled ? `${(router.upstreams || []).filter((upstream) => upstream.enabled).length} upstreams enabled` : "The router is turned off", "#/router"),
          metric("30-day tokens", "pulse", usage ? tokens(usage.totals.total) : "—",
            usage ? `${precise.format(usage.session_count)} sessions · ${precise.format(usage.projects.length)} projects` : "Usage unavailable", "#/usage"),
          metric("Lowest balance", "gauge", lowest ? `${pct.format(lowest.window.remaining_percent)}%` : "—",
            lowest ? `${providerNames[lowest.provider.provider] || lowest.provider.provider} · ${lowest.window.label.replace(/^Codex · /, "")} · ${lowest.provider.account_label}` : "No live quota window", "#/quota")),

        notificationsBand(overview, shape),
        routerBand(router, ledger),
        insightsBand(usage, quota),

        nothingYet ? steps(ctx) : null,

        h("p", { class: "muted small page-footnote", text: [
          `Usage scanned ${when(usage?.scanned_at)}`,
          `quota checked ${when(quota?.checked_at)}`,
          topSource ? `top agent ${sourceNames[topSource.source] || topSource.source}` : null,
          `broker up ${Math.round(overview.uptime_seconds / 60)} min`,
        ].filter(Boolean).join(" · ") + ". Account quotas, local usage, and router requests are separate sources and are never added together." }));
    };

    const load = async () => {
      const overview = (await safely(ctx.refreshOverview())) ?? (await safely(api.get("overview")));
      const [usage, quota, router, ledger, feed] = await Promise.all([
        safely(api.get("usage?days=30")),
        safely(api.get("quota")),
        safely(api.get("router")),
        safely(api.get("router/summary?days=7")),
        safely(api.get("notifications?view=recent&limit=500")),
      ]);
      return { overview, usage, quota, router, ledger, feed };
    };

    let data = await load();
    if (ctx.isCurrent()) draw(data);

    const refresh = async () => {
      mount(page, pageHead("Overview", "Refreshing…"));
      data = await load();
      if (ctx.isCurrent()) draw(data);
    };

    // The shell already polls /overview every 10s for the navigation counts; this re-reads the
    // panels less often so the page stays current without adding request pressure.
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible" || !ctx.isCurrent()) return;
      data = await load();
      if (ctx.isCurrent()) draw(data);
    }, 60000);
    return () => clearInterval(timer);
  },
};
