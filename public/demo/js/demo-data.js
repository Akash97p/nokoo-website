// Dummy state for the hosted demo. Every value here is invented: no account, project, path, key, or
// message in this file came from a real installation. The shapes match what the broker returns, so
// the demo runs the real web UI unmodified — see demo/api.js, which serves this instead of fetching.

const DAY = 86_400_000;
const now = Date.now();
const iso = (offsetMs) => new Date(now - offsetMs).toISOString();
const ahead = (offsetMs) => new Date(now + offsetMs).toISOString();
const dateOnly = (daysAgo) => new Date(now - daysAgo * DAY).toISOString().slice(0, 10);

/** A deterministic 0..1 from an integer, so every visitor sees the same shape. */
const wobble = (seed) => (Math.sin(seed * 12.9898) * 43758.5453) % 1;
const spread = (seed, low, high) => Math.round(low + Math.abs(wobble(seed)) * (high - low));

const counts = (input, output, cacheRead = 0, cacheWrite = 0, reasoning = 0) => ({
  input, output, cache_read: cacheRead, cache_write: cacheWrite, reasoning,
  total: input + output + cacheRead + cacheWrite,
});

const cost = (usd, complete = true) => ({ priced_usd: usd, complete, unpriced_events: complete ? 0 : 4 });

// ---- notifications ---------------------------------------------------------------------------

const projects = ["checkout-service", "nokoo", "mobile-client", "infra-terraform", "docs-site"];
const agentsList = ["claude", "codex", "opencode"];

const seedNotifications = [
  {
    id: "n-1", type: "permission_required", priority: "critical", status: "active",
    title: "Run database migration on staging?",
    message: "0042_add_refund_ledger.sql adds two tables and backfills 18,400 rows. It cannot be rolled back automatically.",
    agent: "claude", agent_instance: "session-7f21", project: "checkout-service",
    cwd: "~/work/checkout-service", created_at: iso(4 * 60_000), resolved_at: null,
  },
  {
    id: "n-2", type: "input_required", priority: "high", status: "active",
    title: "Which payment provider should the retry path use?",
    message: "Both adapters are configured. I need one before I can finish the failover branch.",
    agent: "codex", agent_instance: "codex-3ab9", project: "checkout-service",
    cwd: "~/work/checkout-service", created_at: iso(21 * 60_000), resolved_at: null,
  },
  {
    id: "n-3", type: "blocked", priority: "high", status: "active",
    title: "Integration suite needs a Redis instance",
    message: "docker compose up redis failed: port 6379 already in use by another process.",
    agent: "claude", agent_instance: "session-1c40", project: "mobile-client",
    cwd: "~/work/mobile-client", created_at: iso(52 * 60_000), resolved_at: null,
  },
  {
    id: "n-4", type: "error", priority: "critical", status: "active",
    title: "Terraform plan failed: 3 resources would be destroyed",
    message: "aws_rds_cluster.primary is marked for replacement. Stopping before apply.",
    agent: "opencode", agent_instance: "oc-88d2", project: "infra-terraform",
    cwd: "~/work/infra-terraform", created_at: iso(96 * 60_000), resolved_at: null,
  },
  {
    id: "n-5", type: "completed", priority: "normal", status: "resolved",
    title: "Refund ledger endpoint shipped — 64 tests green",
    message: "POST /refunds/ledger with idempotency keys. Coverage on the module is 91%.",
    agent: "claude", agent_instance: "session-7f21", project: "checkout-service",
    cwd: "~/work/checkout-service", created_at: iso(3 * 3_600_000), resolved_at: iso(2.6 * 3_600_000),
  },
  {
    id: "n-6", type: "warning", priority: "normal", status: "resolved",
    title: "Docs build emitted 12 broken-link warnings",
    message: "All twelve point at /guides/legacy-*, which was removed in the last release.",
    agent: "codex", agent_instance: "codex-3ab9", project: "docs-site",
    cwd: "~/work/docs-site", created_at: iso(6 * 3_600_000), resolved_at: iso(5 * 3_600_000),
  },
  {
    id: "n-7", type: "completed", priority: "low", status: "dismissed",
    title: "Dependency bump merged",
    message: "23 packages updated, lockfile regenerated, no audit advisories.",
    agent: "opencode", agent_instance: "oc-88d2", project: "nokoo",
    cwd: "~/work/nokoo", created_at: iso(26 * 3_600_000), resolved_at: iso(25 * 3_600_000),
  },
];

/** A fortnight of history so the Overview chart and the medians have something to describe. */
function historicalFeed() {
  const items = [...seedNotifications];
  const titles = [
    ["completed", "Test suite finished", "normal"],
    ["completed", "Build published to the staging bucket", "low"],
    ["info", "Long-running task checkpointed", "low"],
    ["warning", "Lint found 4 new issues", "normal"],
    ["input_required", "Pick a name for the new migration", "high"],
    ["error", "Type check failed in the payments module", "high"],
  ];
  let id = 100;
  for (let day = 0; day < 14; day++) {
    const perDay = spread(day + 1, 1, 9);
    for (let index = 0; index < perDay; index++) {
      const [type, title, priority] = titles[(day + index) % titles.length];
      const created = day * DAY + spread(day * 10 + index, 1, 20) * 3_600_000 / 3;
      items.push({
        id: `n-${id++}`, type, priority, status: "resolved",
        title, message: null,
        agent: agentsList[(day + index) % agentsList.length],
        agent_instance: null,
        project: projects[(day * 3 + index) % projects.length],
        cwd: null,
        created_at: iso(created),
        resolved_at: iso(Math.max(0, created - spread(index + day, 40, 5400) * 1000)),
      });
    }
  }
  return items;
}

const feed = historicalFeed();

const interactions = [
  {
    id: "q-1", kind: "permission", status: "pending",
    prompt: "Allow the agent to force-push the rebased branch to origin/feature/refund-ledger?",
    agent: "claude", agent_instance: "session-7f21", project: "checkout-service",
    created_at: iso(3 * 60_000), updated_at: iso(3 * 60_000), expires_at: ahead(11 * 60_000),
    request_digest: "sha256:demo-1", response: null,
    choices: [{ id: "allow", label: "Allow", detail: null }, { id: "deny", label: "Deny", detail: null }],
  },
  {
    id: "q-2", kind: "single_choice", status: "pending",
    prompt: "Which retry strategy should the payment worker use?",
    agent: "codex", agent_instance: "codex-3ab9", project: "checkout-service",
    created_at: iso(14 * 60_000), updated_at: iso(14 * 60_000), expires_at: ahead(26 * 60_000),
    request_digest: "sha256:demo-2", response: null,
    choices: [
      { id: "exponential", label: "Exponential backoff", detail: "1s, 2s, 4s, 8s — capped at five attempts." },
      { id: "fixed", label: "Fixed interval", detail: "Every 5 seconds, capped at ten attempts." },
      { id: "none", label: "No retries", detail: "Fail immediately and record the attempt." },
    ],
  },
  {
    id: "q-3", kind: "text", status: "pending",
    prompt: "What should the release note for 2.4.0 say about the refund ledger?",
    agent: "claude", agent_instance: "session-1c40", project: "docs-site",
    created_at: iso(38 * 60_000), updated_at: iso(38 * 60_000), expires_at: ahead(52 * 60_000),
    request_digest: "sha256:demo-3", response: null, text_max_length: 500, choices: [],
  },
  {
    id: "q-4", kind: "permission", status: "answered",
    prompt: "Allow the agent to install the missing dev dependency?",
    agent: "opencode", agent_instance: "oc-88d2", project: "mobile-client",
    created_at: iso(2 * 3_600_000), updated_at: iso(1.9 * 3_600_000), answered_at: iso(1.9 * 3_600_000),
    expires_at: iso(1.5 * 3_600_000), request_digest: "sha256:demo-4",
    response: { choice_id: "allow", source: "phone", device_id: "Pixel" },
    choices: [{ id: "allow", label: "Allow", detail: null }, { id: "deny", label: "Deny", detail: null }],
  },
];

// ---- channels and routes ----------------------------------------------------------------------

const providerKinds = [
  {
    kind: "relay", display_name: "Nokoo Relay", category: "Phone", summary: "Push to the Nokoo app on your phone.",
    supports_pairing: true, paid: false,
    fields: [
      { key: "sender_name", label: "This computer's name", type: "text", required: true, default: "Studio", help: "Shown on the phone so you can tell your machines apart." },
    ],
    notes: ["Pairing stores a device credential, encrypted on this computer."],
  },
  {
    kind: "telegram", display_name: "Telegram", category: "Chat", summary: "Send to a Telegram chat through a bot.",
    supports_pairing: false, paid: false,
    fields: [
      { key: "chat_id", label: "Chat ID", type: "text", required: true, placeholder: "-1001234567890" },
      { key: "bot_token", label: "Bot token", type: "secret", required: true, clearable: true, help: "From @BotFather. Stored encrypted." },
      { key: "silent", label: "Send silently", type: "checkbox", advanced: true, help: "Delivers without a sound on the phone." },
    ],
    notes: [],
  },
  {
    kind: "slack", display_name: "Slack", category: "Chat", summary: "Post into a Slack channel with an incoming webhook.",
    supports_pairing: false, paid: false,
    fields: [
      { key: "webhook_url", label: "Webhook URL", type: "secret", required: true, clearable: true },
      { key: "channel", label: "Channel override", type: "text", advanced: true, placeholder: "#builds" },
    ],
    notes: ["Anyone in the channel can read the notification title and message."],
  },
  {
    kind: "webhook", display_name: "Webhook", category: "Custom", summary: "POST a JSON body to any HTTPS endpoint.",
    supports_pairing: false, paid: false,
    fields: [
      { key: "url", label: "Endpoint URL", type: "url", required: true, placeholder: "https://example.com/hooks/agent" },
      { key: "secret", label: "Signing secret", type: "secret", clearable: true, help: "Sent as an HMAC header so the receiver can verify the body." },
      { key: "method", label: "Method", type: "select", advanced: true, options: [{ value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }] },
    ],
    notes: [],
  },
  {
    kind: "smtp", display_name: "Email (SMTP)", category: "Mail", summary: "Send mail through your own SMTP server.",
    supports_pairing: false, paid: false,
    fields: [
      { key: "host", label: "Server", type: "text", required: true, placeholder: "smtp.example.com" },
      { key: "port", label: "Port", type: "number", default: "587" },
      { key: "to", label: "Send to", type: "text", required: true, placeholder: "you@example.com" },
      { key: "password", label: "Password", type: "secret", clearable: true },
    ],
    notes: [],
  },
  {
    kind: "ntfy", display_name: "ntfy", category: "Phone", summary: "Publish to a self-hosted or public ntfy topic.",
    supports_pairing: false, paid: false,
    fields: [
      { key: "server", label: "Server", type: "text", default: "https://ntfy.sh" },
      { key: "topic", label: "Topic", type: "text", required: true, placeholder: "my-agents" },
      { key: "token", label: "Access token", type: "secret", clearable: true },
    ],
    notes: [],
  },
  {
    kind: "twilio_sms", display_name: "Twilio SMS", category: "Phone", summary: "Text message through Twilio.",
    supports_pairing: false, paid: true,
    fields: [
      { key: "from", label: "From number", type: "text", required: true },
      { key: "to", label: "To number", type: "text", required: true },
      { key: "auth_token", label: "Auth token", type: "secret", required: true, clearable: true },
    ],
    warning: "Twilio bills per message. Route only what you need to reach you by SMS.",
    notes: [],
  },
];

let providerProfiles = [
  {
    id: "p-relay", kind: "relay", name: "Phone (Relay)", enabled: true,
    values: { sender_name: "Studio" }, secret_names: ["device_credential"],
    updated_at: iso(2 * DAY), relay: { connected: true, relay_name: "Pixel" },
  },
  {
    id: "p-slack", kind: "slack", name: "#builds", enabled: true,
    values: { channel: "#builds" }, secret_names: ["webhook_url"], updated_at: iso(9 * DAY),
  },
  {
    id: "p-mail", kind: "smtp", name: "Email digest", enabled: false,
    values: { host: "smtp.example.com", port: "587", to: "you@example.com" },
    secret_names: ["password"], updated_at: iso(21 * DAY),
  },
];

let routeList = [
  { id: "r-1", name: "Critical to phone", provider_id: "p-relay", enabled: true, minimum_priority: "critical", type_id: null, project: null, agent: null, include_message: true },
  { id: "r-2", name: "Approvals to phone", provider_id: "p-relay", enabled: true, minimum_priority: "high", type_id: "permission_required", project: null, agent: null, include_message: true },
  { id: "r-3", name: "Checkout builds to Slack", provider_id: "p-slack", enabled: true, minimum_priority: "normal", type_id: null, project: "checkout-service", agent: null, include_message: false },
  { id: "r-4", name: "Nightly digest", provider_id: "p-mail", enabled: false, minimum_priority: "low", type_id: null, project: null, agent: null, include_message: true },
];

const delivery = { delivered: 1_284, pending: 0, processing: 0, retry: 1, dead_letter: 0 };

const types = {
  built_in: ["permission_required", "input_required", "blocked", "error", "warning", "completed", "success", "info"],
  custom: [
    { id: "deploy_ready", display_name: "Deploy ready", accent_color: "#22c55e", default_priority: "high", duration_seconds: 0, enabled: true },
    { id: "review_wanted", display_name: "Review wanted", accent_color: "#a855f7", default_priority: "normal", duration_seconds: 20, enabled: true },
  ],
};

let settings = {
  port: 8765,
  history_retention_days: 90,
  pause_notifications: false,
  do_not_disturb: false,
  toast_location: "BottomRight",
  max_visible_toasts: 3,
  toast_durations: { permission_required: 0, input_required: 0, blocked: 30, error: 20, warning: 12, completed: 7, success: 7, info: 5 },
  sounds_enabled: true,
  sound_volume: 60,
  play_critical_sounds_during_do_not_disturb: true,
  default_sound_file: "chime.wav",
  type_sound_files: { permission_required: "alert.wav", error: "alert.wav" },
};

const sounds = {
  built_in: [
    { file_name: "chime.wav", display_name: "Chime" },
    { file_name: "alert.wav", display_name: "Alert" },
    { file_name: "ping.wav", display_name: "Ping" },
    { file_name: "knock.wav", display_name: "Knock" },
  ],
  imported: ["studio-bell.wav"],
};

// ---- agents -------------------------------------------------------------------------------------

const agents = {
  accounts: [
    {
      id: "acc-claude-personal", kind: "claude_code", display_name: "Claude Code", label: "Personal",
      directory: "~/.claude", display_directory: "~/.claude",
      skill: { id: "claude", state: "up_to_date", destination: "~/.claude/skills/nokoo", shared: false },
      harness: { installed: true, command: "nokoo harness claude --ask", ask_command: "nokoo harness claude --ask" },
    },
    {
      id: "acc-claude-work", kind: "claude_code", display_name: "Claude Code", label: "Work",
      directory: "~/.claude-work", display_directory: "~/.claude-work",
      skill: { id: "claude-work", state: "outdated", destination: "~/.claude-work/skills/nokoo", shared: false },
      harness: { installed: false, command: "CLAUDE_CONFIG_DIR=~/.claude-work nokoo harness claude --ask", ask_command: "CLAUDE_CONFIG_DIR=~/.claude-work nokoo harness claude --ask" },
    },
    {
      id: "acc-codex-personal", kind: "codex", display_name: "Codex", label: "Personal",
      directory: "~/.codex", display_directory: "~/.codex",
      skill: { id: "codex", state: "up_to_date", destination: "~/.agents/skills/nokoo", shared: true },
      harness: { installed: true, command: "nokoo harness codex --ask", ask_command: "nokoo harness codex --ask" },
    },
  ],
  skills: [
    { id: "opencode", display_name: "OpenCode", state: "up_to_date", note: "Installed in the personal skills folder.", destination: "~/.config/opencode/skills/nokoo", environment: null, wsl: null },
    { id: "gemini", display_name: "Gemini CLI", state: "not_installed", note: "Not installed yet. One click writes the skill file.", destination: "~/.gemini/skills/nokoo", environment: null, wsl: null },
    { id: "kilo", display_name: "Kilo", state: "outdated", note: "An older copy of the skill is installed.", destination: "~/.kilo/skills/nokoo", environment: null, wsl: null },
    { id: "muse", display_name: "Muse Code", state: "unavailable", note: "No home folder was found for this agent.", destination: null, environment: null, wsl: null },
  ],
  harnesses: [
    { id: "aider", display_name: "Aider", note: "Reports completions and errors from the host itself.", command: "nokoo harness aider", ask_command: null },
    { id: "opencode", display_name: "OpenCode", note: "Reports completions and can wait for your approval.", command: "nokoo harness opencode --ask", ask_command: "nokoo harness opencode --ask" },
    { id: "gemini", display_name: "Gemini CLI", note: "Reports completions and errors.", command: "nokoo harness gemini", ask_command: null },
    { id: "kilo", display_name: "Kilo", note: "Reports completions and errors.", command: "nokoo harness kilo", ask_command: null },
  ],
};

// ---- usage ---------------------------------------------------------------------------------------

const usageModels = [
  { source: "claude_code", provider: "anthropic", model: "claude-sonnet-5", counts: counts(1_240_000, 186_000, 9_640_000, 412_000), cost: cost(38.42) },
  { source: "claude_code", provider: "anthropic", model: "claude-opus-5", counts: counts(268_000, 74_000, 1_980_000, 96_000), cost: cost(41.15) },
  { source: "codex", provider: "openai", model: "gpt-5.1-codex", counts: counts(940_000, 212_000, 5_120_000, 0, 96_000), cost: cost(24.80) },
  { source: "codex", provider: "openai", model: "gpt-5.1-codex-mini", counts: counts(410_000, 88_000, 1_640_000, 0, 21_000), cost: cost(3.94) },
  { source: "opencode", provider: "opencode-go", model: "kimi-k3", counts: counts(302_000, 61_000, 880_000), cost: cost(2.11) },
  { source: "opencode", provider: "zai", model: "glm-5.3", counts: counts(184_000, 44_000, 520_000), cost: cost(1.24) },
  { source: "kilo", provider: "kilo", model: "kilo-free", counts: counts(96_000, 22_000), cost: cost(0) },
  { source: "gemini_cli", provider: "google", model: "gemini-3-pro", counts: counts(142_000, 38_000, 310_000), cost: cost(1.86) },
  { source: "muse", provider: "xiaomi", model: "muse-code-1", counts: counts(58_000, 14_000), cost: cost(0.42, false) },
];

/** Thirty daily buckets with a working-week shape, so the charts look like real activity. */
const usageDaily = Array.from({ length: 30 }, (_, index) => {
  const daysAgo = 29 - index;
  const date = new Date(now - daysAgo * DAY);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const base = weekend ? spread(index + 1, 40_000, 260_000) : spread(index + 1, 420_000, 1_650_000);
  return {
    date: dateOnly(daysAgo),
    counts: counts(base, Math.round(base / 6), Math.round(base * 3.4), Math.round(base / 4)),
    cost: cost(Number((base / 58_000).toFixed(2))),
  };
});

/**
 * Per-agent and per-project totals are shares of the same 30-day total the daily buckets add up to.
 * Writing them as independent numbers made the agent-mix donut disagree with the headline figure.
 */
const usageTotals = usageDaily.reduce((total, day) => counts(
  total.input + day.counts.input,
  total.output + day.counts.output,
  total.cache_read + day.counts.cache_read,
  total.cache_write + day.counts.cache_write,
  117_000,
), counts(0, 0, 0, 0, 0));

const TOTAL_COST = 113.94;
const shareOf = (fraction) => counts(
  Math.round(usageTotals.input * fraction),
  Math.round(usageTotals.output * fraction),
  Math.round(usageTotals.cache_read * fraction),
  Math.round(usageTotals.cache_write * fraction),
  Math.round(usageTotals.reasoning * fraction),
);
const costOf = (fraction, complete = true) => cost(Number((TOTAL_COST * fraction).toFixed(2)), complete);

const usageSources = [
  { source: "claude_code", fraction: 0.556 },
  { source: "codex", fraction: 0.337 },
  { source: "opencode", fraction: 0.062 },
  { source: "gemini_cli", fraction: 0.029 },
  { source: "kilo", fraction: 0.011 },
  { source: "muse", fraction: 0.005 },
].map(({ source, fraction }) => ({
  source,
  counts: shareOf(fraction),
  cost: source === "kilo" ? cost(0) : costOf(fraction, source !== "muse"),
}));

const usageProjects = [
  { id: "prj-checkout-9f21", name: "checkout-service", fraction: 0.41, models: usageModels.slice(0, 4) },
  { id: "prj-nokoo-4c08", name: "nokoo", fraction: 0.27, models: usageModels.slice(0, 3) },
  { id: "prj-mobile-2b77", name: "mobile-client", fraction: 0.16, models: usageModels.slice(2, 6) },
  { id: "prj-infra-8ad3", name: "infra-terraform", fraction: 0.1, models: usageModels.slice(4, 8) },
  { id: "prj-docs-1e50", name: "docs-site", fraction: 0.06, models: usageModels.slice(5, 9) },
].map(({ fraction, ...project }) => ({ ...project, counts: shareOf(fraction), cost: costOf(fraction) }));

const usageSessions = Array.from({ length: 8 }, (_, index) => {
  const source = ["claude_code", "codex", "claude_code", "opencode", "codex", "claude_code", "gemini_cli", "codex"][index];
  const project = usageProjects[index % usageProjects.length];
  const ended = (index * 7 + 3) * 3_600_000;
  const input = spread(index + 2, 40_000, 260_000);
  return {
    id: `ses-${(index + 11).toString(16)}a4${index}c`, source, project_name: project.name,
    started_at: iso(ended + 5_400_000), ended_at: iso(ended),
    counts: counts(input, Math.round(input / 5), input * 4, Math.round(input / 3)),
    cost: cost(Number((input / 42_000).toFixed(2))),
    events: spread(index + 9, 40, 420),
    models: usageModels.slice(index % 4, (index % 4) + 3),
  };
});


const usage = {
  contract_version: "4",
  totals: usageTotals,
  // The headline cost is what the per-agent rows add up to: Kilo's free models cost nothing,
  // so it is below TOTAL_COST rather than equal to it.
  cost: cost(Number(usageSources.reduce((sum, source) => sum + source.cost.priced_usd, 0).toFixed(2)), false),
  events: 18_442,
  session_count: 164,
  files_scanned: 27,
  files_skipped: 0,
  scanned_at: iso(6 * 60_000),
  pricing_as_of: dateOnly(12),
  wsl_distributions: [],
  daily: usageDaily,
  sources: usageSources,
  projects: usageProjects,
  sessions: usageSessions,
  models: usageModels,
};

// ---- quota ----------------------------------------------------------------------------------------

const quotaWindow = (label, remaining, resetsInHours) => ({
  key: label.toLowerCase().replace(/[^a-z]+/g, "_"),
  label,
  remaining_percent: remaining,
  used_percent: Number((100 - remaining).toFixed(1)),
  resets_at: ahead(resetsInHours * 3_600_000),
});

const quota = {
  contract_version: "3",
  checked_at: iso(90_000),
  providers: [
    {
      provider: "claude_code", account_label: "Personal", status: "ok", source: "~/.claude",
      plan: "Max 20x", fetched_at: iso(90_000), credit_balance: null,
      windows: [quotaWindow("Five hours", 62.4, 3.2), quotaWindow("Seven days", 41.8, 96), quotaWindow("Seven days · Opus", 18.6, 96)],
    },
    {
      provider: "claude_code", account_label: "Work", status: "ok", source: "~/.claude-work",
      plan: "Pro", fetched_at: iso(90_000), credit_balance: null,
      windows: [quotaWindow("Five hours", 88.1, 4.6), quotaWindow("Seven days", 73.2, 112)],
    },
    {
      provider: "codex", account_label: "Personal", status: "ok", source: "~/.codex",
      plan: "ChatGPT Pro", fetched_at: iso(120_000), credit_balance: null,
      windows: [quotaWindow("Codex · Five hours", 34.7, 1.4), quotaWindow("Codex · Seven days", 57.9, 82)],
    },
    {
      provider: "codex", account_label: "Second profile", status: "stale", source: "~/.codex-second",
      plan: "ChatGPT Plus", fetched_at: iso(52 * 60_000), credit_balance: 4.18,
      windows: [quotaWindow("Codex · Five hours", 91.0, 4.9), quotaWindow("Codex · Seven days", 80.4, 128)],
    },
  ],
  open_code_go: {
    renewal_day: 14,
    pricing_as_of: dateOnly(12),
    message: "Estimated from local records against OpenCode's published per-model caps.",
    models: [
      {
        model: "kimi-k3",
        windows: [
          { key: "five_hour", label: "Five hours", estimated_used_percent: 22.4, observed_usd: 1.12, limit_usd: 5, resets_at: ahead(2.1 * 3_600_000), unpriced_records: 0 },
          { key: "seven_day", label: "Seven days", estimated_used_percent: 48.9, observed_usd: 12.22, limit_usd: 25, resets_at: ahead(74 * 3_600_000), unpriced_records: 0 },
          { key: "monthly", label: "Billing month", estimated_used_percent: 61.3, observed_usd: 30.65, limit_usd: 50, resets_at: ahead(9 * DAY), unpriced_records: 0 },
        ],
      },
      {
        model: "glm-5.3",
        windows: [
          { key: "five_hour", label: "Five hours", estimated_used_percent: 8.1, observed_usd: 0.4, limit_usd: 5, resets_at: ahead(2.1 * 3_600_000), unpriced_records: 0 },
          { key: "seven_day", label: "Seven days", estimated_used_percent: null, observed_usd: 0, limit_usd: 25, resets_at: ahead(74 * 3_600_000), unpriced_records: 6 },
        ],
      },
    ],
  },
};

const quotaAccounts = {
  accounts: [
    { id: "acc-claude-personal", provider: "claude_code", label: "Personal", directory: "~/.claude", is_default: true, wsl: null },
    { id: "acc-claude-work", provider: "claude_code", label: "Work", directory: "~/.claude-work", is_default: false, wsl: null },
    { id: "acc-codex-personal", provider: "codex", label: "Personal", directory: "~/.codex", is_default: true, wsl: null },
    { id: "acc-codex-second", provider: "codex", label: "Second profile", directory: "~/.codex-second", is_default: false, wsl: null },
  ],
  removed: [
    { id: "acc-codex-old", provider: "codex", label: "Old contractor profile", directory: "~/.codex-old" },
  ],
};

let menuBar = { enabled: true, refresh_minutes: 10, account_ids: [], supported: true };

// ---- API billing -----------------------------------------------------------------------------------

const billing = {
  contract_version: "1",
  accounts: [
    {
      provider: "deepseek", label: "DeepSeek", status: "ok", fetched_at: iso(4 * 60_000), available: true,
      balances: [{ kind: "total", amount: 18.42, currency: "USD" }, { kind: "granted", amount: 5, currency: "USD" }, { kind: "topped_up", amount: 13.42, currency: "USD" }],
      spend: [{ period: "this_month", amount: 6.58, currency: "USD" }],
      daily: Array.from({ length: 12 }, (_, index) => ({ date: dateOnly(11 - index), amount: Number((Math.abs(wobble(index + 4)) * 1.4).toFixed(3)), currency: "USD" })),
    },
    {
      provider: "openrouter", label: "OpenRouter", status: "ok", fetched_at: iso(4 * 60_000), available: true,
      balances: [{ kind: "limit_remaining", amount: 42.06, currency: "USD" }, { kind: "usage", amount: 7.94, currency: "USD" }],
      spend: [{ period: "all_time", amount: 7.94, currency: "USD" }],
      daily: [],
    },
    {
      provider: "moonshot", label: "Moonshot", status: "unauthorized", message: "The provider rejected the stored key. Replace it under Manage API accounts.",
      fetched_at: iso(4 * 60_000), balances: [], spend: [], daily: [],
    },
  ],
};

const billingAccounts = {
  accounts: [
    { id: "ba-1", provider: "deepseek", label: "DeepSeek" },
    { id: "ba-2", provider: "openrouter", label: "OpenRouter" },
    { id: "ba-3", provider: "moonshot", label: "Moonshot" },
  ],
  providers: [
    { id: "deepseek", display_name: "DeepSeek", host: "api.deepseek.com", docs_url: "https://platform.deepseek.com/api_keys" },
    { id: "openrouter", display_name: "OpenRouter", host: "openrouter.ai", docs_url: "https://openrouter.ai/keys" },
    { id: "moonshot", display_name: "Moonshot", host: "api.moonshot.ai", docs_url: "https://platform.moonshot.ai/console/api-keys" },
    { id: "siliconflow", display_name: "SiliconFlow", host: "api.siliconflow.cn", docs_url: "https://cloud.siliconflow.cn/account/ak" },
    { id: "openai_admin", display_name: "OpenAI (admin key)", host: "api.openai.com", docs_url: "https://platform.openai.com/settings/organization/admin-keys" },
    { id: "anthropic_admin", display_name: "Anthropic (admin key)", host: "api.anthropic.com", docs_url: "https://platform.claude.com/settings/admin-keys" },
  ],
};

// ---- model router ------------------------------------------------------------------------------------

const routerPresets = [
  { id: "codex-plan", display_name: "ChatGPT plan (Codex)", base_url: "https://chatgpt.com/backend-api/codex", auth: "codex_chatgpt", kind: "subscription", blurb: "The models your ChatGPT plan already includes.", needs_key: false, signin_ready: true },
  { id: "claude-plan", display_name: "Claude plan", base_url: "https://api.anthropic.com", auth: "claude_oauth", kind: "subscription", blurb: "Your Claude subscription, used by any connected agent.", needs_key: false, signin_ready: true },
  { id: "muse", display_name: "Muse Code", base_url: "https://muse.example.com/v1", auth: "muse_code", kind: "subscription", blurb: "Xiaomi's Muse Code plan.", needs_key: false, unofficial: true, signin_ready: false },
  { id: "anthropic", display_name: "Anthropic", base_url: "https://api.anthropic.com", auth: "api_key", kind: "api", blurb: "Claude models billed per token.", needs_key: true },
  { id: "openai", display_name: "OpenAI", base_url: "https://api.openai.com/v1", auth: "api_key", kind: "api", blurb: "GPT models billed per token.", needs_key: true },
  { id: "deepseek", display_name: "DeepSeek", base_url: "https://api.deepseek.com", auth: "api_key", kind: "api", blurb: "DeepSeek's own API.", needs_key: true },
  { id: "openrouter", display_name: "OpenRouter", base_url: "https://openrouter.ai/api/v1", auth: "api_key", kind: "api", blurb: "One key, many providers.", needs_key: true },
  { id: "opencode-go", display_name: "OpenCode Go", base_url: "https://opencode.ai/go/v1", auth: "api_key", kind: "subscription", blurb: "The OpenCode Go plan.", needs_key: true, opencode_key: true },
  { id: "ollama", display_name: "Ollama", base_url: "http://127.0.0.1:11434/v1", auth: "none", kind: "local", blurb: "Models running on this computer.", needs_key: false },
];

let routerState = {
  enabled: true,
  has_key: true,
  base_url: "http://127.0.0.1:8765/router/v1",
  anthropic_base_url: "http://127.0.0.1:8765/router/anthropic",
  default_route: "fast",
  switch_strategy: "ordered",
  smart_routing: true,
  claude_fallback_route: "combo/fast",
  presets: routerPresets,
  accounts: {
    codex_accounts: [{ id: "acc-codex-personal", label: "Personal", signed_in: true }, { id: "acc-codex-second", label: "Second profile", signed_in: true }],
    api_accounts: [{ id: "ba-1", preset_id: "deepseek", label: "DeepSeek" }, { id: "ba-2", preset_id: "openrouter", label: "OpenRouter" }],
  },
  upstreams: [
    { id: "u-1", slug: "codex-plan", label: "ChatGPT plan · Personal", wire: "openai_responses", base_url: "https://chatgpt.com/backend-api/codex", auth: "codex_chatgpt", enabled: true, has_key: false, credential_ref: null, models: ["gpt-5.1-codex", "gpt-5.1-codex-mini", "gpt-5.1"] },
    { id: "u-2", slug: "claude-plan", label: "Claude plan · Personal", wire: "anthropic_messages", base_url: "https://api.anthropic.com", auth: "claude_oauth", enabled: true, has_key: false, credential_ref: null, models: ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"] },
    { id: "u-3", slug: "deepseek", label: "DeepSeek", wire: "openai_chat", base_url: "https://api.deepseek.com", auth: "api_key", enabled: true, has_key: true, credential_ref: "api_account:ba-1", models: ["deepseek-chat", "deepseek-reasoner"] },
    { id: "u-4", slug: "opencode-go", label: "OpenCode Go", wire: "openai_chat", base_url: "https://opencode.ai/go/v1", auth: "api_key", enabled: true, has_key: true, credential_ref: null, models: ["kimi-k3", "glm-5.3", "qwen3-max"] },
    { id: "u-5", slug: "ollama", label: "Ollama (this computer)", wire: "openai_chat", base_url: "http://127.0.0.1:11434/v1", auth: "none", enabled: false, has_key: false, credential_ref: null, models: ["qwen3-coder:30b"] },
  ],
  routes: [
    { id: "rt-1", name: "fast", kind: "combo", enabled: true, targets: ["opencode-go/kimi-k3", "deepseek/deepseek-chat", "codex-plan/gpt-5.1-codex-mini"] },
    { id: "rt-2", name: "deep", kind: "alias", enabled: true, targets: ["claude-plan/claude-opus-5"] },
    { id: "rt-3", name: "cheap", kind: "combo", enabled: false, targets: ["opencode-go/glm-5.3", "deepseek/deepseek-chat"] },
  ],
  adaptive: {
    enabled: true,
    engine: "heuristics",
    skip_agent_traffic: true,
    tiers: {
      light: "claude-plan/claude-haiku-4-5",
      standard: "claude-plan/claude-sonnet-5",
      deep: "claude-plan/claude-opus-5",
    },
    week: { decisions: 1_284, light: 512, standard: 598, deep: 174, tokens_saved_pct: 17.8 },
    recent: [
      { at: iso(3 * 60_000), prompt: "hi, how are you?", requested: "claude-opus-5", tier: "light", chosen: "claude-plan/claude-haiku-4-5", confidence: 0.98 },
      { at: iso(9 * 60_000), prompt: "write a commit message for the staged changes", requested: "claude-opus-5", tier: "light", chosen: "claude-plan/claude-haiku-4-5", confidence: 0.95 },
      { at: iso(26 * 60_000), prompt: "why does this test fail only on CI? [trace attached]", requested: "claude-sonnet-5", tier: "standard", chosen: "claude-plan/claude-sonnet-5", confidence: 0.81 },
      { at: iso(48 * 60_000), prompt: "migrate billing to the new ledger schema, update every caller, keep tests green", requested: "claude-haiku-4-5", tier: "deep", chosen: "claude-plan/claude-opus-5", confidence: 0.93 },
      { at: iso(71 * 60_000), prompt: "rename getUser to fetchUser across the repo", requested: "claude-opus-5", tier: "standard", chosen: "claude-plan/claude-sonnet-5", confidence: 0.77 },
    ],
  },
  smart_groups: [
    { model: "claude-sonnet-5", targets: ["claude-plan/claude-sonnet-5", "openrouter/claude-sonnet-5"] },
    { model: "kimi-k3", targets: ["opencode-go/kimi-k3", "deepseek/deepseek-chat"] },
  ],
};

const selectableModels = routerState.upstreams
  .filter((upstream) => upstream.enabled)
  .flatMap((upstream) => upstream.models.map((model) => `${upstream.slug}/${model}`))
  .concat(["fast", "deep", "combo/fast"]);

const routerAgents = {
  slots: ["default", "opus", "sonnet", "haiku", "small_fast"],
  selectable: selectableModels,
  claude_native_selectable: ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"],
  agents: [
    {
      id: "acc-claude-personal", kind: "claude_code", display_name: "Claude Code", account_label: "Personal",
      config_path: "~/.claude/settings.json", detected: true, connected: true,
      selected_model: "claude-plan/claude-sonnet-5",
      model_slots: { opus: "claude-plan/claude-opus-5", sonnet: "claude-plan/claude-sonnet-5", haiku: "opencode-go/kimi-k3", small_fast: "opencode-go/glm-5.3" },
      options: [], option_values: {}, backups: [{ id: "bk-1", created_at: iso(2 * DAY) }],
      catalog_path: "~/.claude/model-picker.json", catalog_model_count: 11, blocked: null,
    },
    {
      id: "acc-claude-work", kind: "claude_code", display_name: "Claude Code", account_label: "Work",
      config_path: "~/.claude-work/settings.json", detected: true, connected: false,
      selected_model: null, model_slots: {}, options: [], option_values: {}, backups: [],
      catalog_path: null, catalog_model_count: 0, blocked: null,
    },
    {
      id: "acc-codex-personal", kind: "codex", display_name: "Codex", account_label: "Personal",
      config_path: "~/.codex/config.toml", detected: true, connected: true,
      selected_model: "codex-plan/gpt-5.1-codex",
      model_slots: {},
      options: [
        { id: "reasoning_effort", display_name: "Reasoning effort", description: "What Codex sends when you have not picked a level.", choices: ["low", "medium", "high"], is_model_selector: false },
        { id: "web_search", display_name: "Web search", description: "Lets Codex fetch pages during a task.", choices: ["on", "off"], is_model_selector: false },
      ],
      option_values: { reasoning_effort: "high", web_search: "off" },
      backups: [{ id: "bk-2", created_at: iso(5 * DAY) }],
      catalog_path: "~/.codex/models.json", catalog_model_count: 8, blocked: null,
    },
    {
      id: "acc-codex-second", kind: "codex", display_name: "Codex", account_label: "Second profile",
      config_path: "~/.codex-second/config.toml", detected: true, connected: false,
      selected_model: null, model_slots: {}, options: [], option_values: {}, backups: [],
      catalog_path: null, catalog_model_count: 0,
      blocked: "This profile is signed in to a different ChatGPT account. Connecting it writes only its own config file.",
    },
  ],
};

const routerRequests = {
  requests: Array.from({ length: 14 }, (_, index) => {
    const failed = index === 3 || index === 9;
    const recovered = index === 6;
    const target = ["opencode-go/kimi-k3", "claude-plan/claude-sonnet-5", "codex-plan/gpt-5.1-codex", "deepseek/deepseek-chat"][index % 4];
    const [slug, model] = target.split("/");
    const started = index * 11 * 60_000 + 40_000;
    const input = spread(index + 3, 1_800, 42_000);
    return {
      request: {
        id: `req-${index}`, started_at: iso(started), requested_model: index % 3 === 0 ? "fast" : target,
        route_kind: index % 3 === 0 ? "combo" : "direct", route_name: index % 3 === 0 ? "fast" : null,
        upstream_slug: slug, model, inbound_wire: index % 2 ? "openai_responses" : "anthropic_messages",
        stream: index % 2 === 0, status: failed ? 503 : 200, outcome: failed ? "upstream_error" : "ok",
        error_code: failed ? "upstream_unavailable" : null,
        input_tokens: input, output_tokens: Math.round(input / 7),
        cached_input_tokens: Math.round(input * 2.2), reasoning_tokens: index % 2 ? Math.round(input / 11) : null,
      },
      attempts: recovered
        ? [
          { ordinal: 1, upstream_slug: "opencode-go", model: "kimi-k3", status: 429, error_code: "rate_limited", duration_ms: 240 },
          { ordinal: 2, upstream_slug: slug, model, status: 200, error_code: null, duration_ms: spread(index + 5, 380, 2_600) },
        ]
        : [{ ordinal: 1, upstream_slug: slug, model, status: failed ? 503 : 200, error_code: failed ? "upstream_unavailable" : null, duration_ms: spread(index + 5, 180, 3_400) }],
    };
  }),
};

const summaryRow = (slug, model, count, ok, input, output, reasoning) => ({
  upstream_slug: slug, model, count, ok_count: ok,
  input_tokens_sum: input, cached_input_tokens_sum: Math.round(input * 2.1),
  output_tokens_sum: output, reasoning_tokens_sum: reasoning,
});

const routerSummaries = {
  1: [
    summaryRow("opencode-go", "kimi-k3", 62, 61, 284_000, 41_000, 0),
    summaryRow("claude-plan", "claude-sonnet-5", 38, 38, 196_000, 32_000, 0),
    summaryRow("codex-plan", "gpt-5.1-codex", 24, 23, 142_000, 26_000, 18_400),
    summaryRow("deepseek", "deepseek-chat", 11, 11, 48_000, 9_200, 0),
  ],
  7: [
    summaryRow("opencode-go", "kimi-k3", 412, 404, 1_940_000, 286_000, 0),
    summaryRow("claude-plan", "claude-sonnet-5", 268, 266, 1_410_000, 224_000, 0),
    summaryRow("codex-plan", "gpt-5.1-codex", 184, 178, 1_020_000, 188_000, 132_000),
    summaryRow("deepseek", "deepseek-chat", 96, 96, 402_000, 74_000, 0),
    summaryRow("claude-plan", "claude-opus-5", 41, 41, 262_000, 58_000, 0),
  ],
  30: [
    summaryRow("opencode-go", "kimi-k3", 1_684, 1_651, 8_120_000, 1_190_000, 0),
    summaryRow("claude-plan", "claude-sonnet-5", 1_102, 1_094, 5_940_000, 942_000, 0),
    summaryRow("codex-plan", "gpt-5.1-codex", 768, 742, 4_260_000, 786_000, 548_000),
    summaryRow("deepseek", "deepseek-chat", 402, 401, 1_684_000, 312_000, 0),
    summaryRow("claude-plan", "claude-opus-5", 186, 186, 1_120_000, 246_000, 0),
  ],
};

const effortFamily = (family, levels, supported, defaultValue, models, source = "automatic", overrides = 0) => ({
  family, level_map: levels, supported_values: supported, default_value: defaultValue,
  source, model_override_count: overrides,
  models: models.map(([slug, model]) => ({ upstream_slug: slug, model })),
});

const effortMappings = {
  families: [
    effortFamily("openai", ["low", "low", "medium", "high", "high"], ["low", "medium", "high"], "medium",
      [["codex-plan", "gpt-5.1-codex"], ["codex-plan", "gpt-5.1-codex-mini"], ["codex-plan", "gpt-5.1"]], "family", 1),
    effortFamily("claude", ["", "", "think", "think harder", "ultrathink"], ["think", "think harder", "ultrathink"], "",
      [["claude-plan", "claude-opus-5"], ["claude-plan", "claude-sonnet-5"], ["claude-plan", "claude-haiku-4-5"]]),
    effortFamily("kimi", ["low", "medium", "medium", "high", "high"], ["low", "medium", "high"], "medium",
      [["opencode-go", "kimi-k3"]]),
    effortFamily("glm", ["low", "medium", "high", "high", "high"], ["low", "medium", "high"], "medium",
      [["opencode-go", "glm-5.3"]]),
    effortFamily("deepseek", ["", "", "reasoning", "reasoning", "reasoning"], ["reasoning"], "",
      [["deepseek", "deepseek-chat"], ["deepseek", "deepseek-reasoner"]]),
    effortFamily("qwen", ["low", "medium", "high", "high", "high"], ["low", "medium", "high"], "medium",
      [["opencode-go", "qwen3-max"], ["ollama", "qwen3-coder:30b"]]),
  ],
  mappings: [
    {
      upstream_id: "u-1", upstream_slug: "codex-plan", model: "gpt-5.1-codex-mini", family: "openai", wire: "openai_responses",
      level_map: ["low", "low", "low", "medium", "medium"], supported_values: ["low", "medium", "high"],
      default_value: "low", source: "model",
    },
  ],
};

// ---- overview ----------------------------------------------------------------------------------------

const overview = {
  version: "0.2.0-alpha.3",
  platform: "macOS",
  desktop_surface: "Notification Center",
  data_directory: "~/Library/Application Support/Nokoo",
  api_url: "http://127.0.0.1:8765",
  secret_protection: "macOS login keychain",
  uptime_seconds: 41 * 3_600,
  capabilities: { questions: true, sounds: false, toast_placement: false },
  counts: {
    active_notifications: seedNotifications.filter((item) => item.status === "active").length,
    pending_questions: interactions.filter((item) => item.status === "pending").length,
    providers: providerProfiles.length,
    enabled_providers: providerProfiles.filter((item) => item.enabled).length,
    routes: routeList.length,
    enabled_routes: routeList.filter((item) => item.enabled).length,
  },
  delivery,
};

// ---- the mutable store the demo API reads and writes --------------------------------------------------

export const store = {
  overview,
  feed,
  interactions,
  types,
  providerKinds,
  get providers() { return providerProfiles; },
  set providers(value) { providerProfiles = value; },
  get routes() { return routeList; },
  set routes(value) { routeList = value; },
  delivery,
  get settings() { return settings; },
  set settings(value) { settings = value; },
  sounds,
  agents,
  usage,
  quota,
  quotaAccounts,
  get menuBar() { return menuBar; },
  set menuBar(value) { menuBar = value; },
  billing,
  billingAccounts,
  get router() { return routerState; },
  set router(value) { routerState = value; },
  routerAgents,
  routerRequests,
  routerSummaries,
  effortMappings,
};
