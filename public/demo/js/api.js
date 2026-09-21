// The demo's stand-in for the broker. It is published as js/api.js inside the demo copy of the web
// UI, so every view, and every line of view code, is the one that ships — only the transport under
// it changes. Reads come from demo/data.js; writes change that in-memory copy and are gone on
// reload. Nothing here talks to a network.

import { store } from "./demo-data.js";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** Enough delay for a button's busy state to be visible, not enough to feel slow. */
const settle = (value, ms = 140) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const clone = (value) => (typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value)));
const id = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

function split(path) {
  const [raw, query] = path.split("?");
  return { parts: raw.split("/").filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(query || "") };
}

/** The counts the shell reads are derived, so a resolve or a toggle moves the badges too. */
function recount() {
  const counts = store.overview.counts;
  counts.active_notifications = store.feed.filter((item) => item.status === "active").length;
  counts.pending_questions = store.interactions.filter((item) => item.status === "pending").length;
  counts.providers = store.providers.length;
  counts.enabled_providers = store.providers.filter((item) => item.enabled).length;
  counts.routes = store.routes.length;
  counts.enabled_routes = store.routes.filter((item) => item.enabled).length;
}

const refuse = (message, status = 400) => { throw new ApiError(message, status); };

const demoOnly = (what) =>
  refuse(`${what} needs the broker running on your own computer. This is a demo with made-up data — nothing here leaves your browser.`, 501);

// ---- reads -------------------------------------------------------------------------------------

function get(parts, query) {
  const [head, second, third] = parts;

  switch (head) {
    case "overview":
      recount();
      return clone(store.overview);

    case "types":
      return clone(store.types);

    case "notifications": {
      const view = query.get("view") || "attention";
      const items = view === "attention" ? store.feed.filter((item) => item.status === "active") : store.feed;
      const limit = Number(query.get("limit")) || items.length;
      return clone(items.slice(0, limit));
    }

    case "interactions": {
      const view = query.get("view") || "pending";
      return clone(view === "pending"
        ? store.interactions.filter((item) => item.status === "pending")
        : store.interactions);
    }

    case "provider-kinds":
      return clone(store.providerKinds);

    case "providers":
      return clone(store.providers);

    case "routes":
      return clone(store.routes);

    case "delivery":
      return clone(store.delivery);

    case "settings":
      return clone(store.settings);

    case "sounds":
      return clone(store.sounds);

    case "agents":
      return clone(store.agents);

    case "usage": {
      const days = query.get("days");
      if (days === "7") {
        const daily = store.usage.daily.slice(-7);
        return clone({ ...store.usage, daily, session_count: 41, events: 4_180 });
      }
      return clone(store.usage);
    }

    case "quota":
      if (second === "accounts") return clone(store.quotaAccounts);
      return clone(store.quota);

    case "menu-bar":
      return clone(store.menuBar);

    case "billing":
      if (second === "accounts") return clone(store.billingAccounts);
      return clone(store.billing);

    case "router": {
      if (!second) return clone(store.router);
      if (second === "agents") return clone(store.routerAgents);
      if (second === "requests") return clone(store.routerRequests);
      if (second === "summary") {
        const days = Number(query.get("days")) || 1;
        return clone({ summary: store.routerSummaries[days] || store.routerSummaries[7] });
      }
      if (second === "effort-mappings") return clone(store.effortMappings);
      break;
    }

    case "relay":
      if (second === "pairings" && third) demoOnly("Pairing a phone");
      break;
  }

  throw new ApiError(`This demo has nothing behind /${parts.join("/")}.`, 404);
}

// ---- writes ------------------------------------------------------------------------------------

function notificationAction(notificationId, action) {
  const item = store.feed.find((entry) => entry.id === notificationId);
  if (!item) refuse("That notification is gone.", 404);
  item.status = action === "resolve" ? "resolved" : "dismissed";
  item.resolved_at = new Date().toISOString();
  recount();
  return { ok: true };
}

function respond(questionId, body) {
  const question = store.interactions.find((entry) => entry.id === questionId);
  if (!question) refuse("That question is gone.", 404);
  if (question.status !== "pending") refuse("Someone already answered this question.", 409);
  question.status = "answered";
  question.answered_at = new Date().toISOString();
  question.updated_at = question.answered_at;
  question.response = { choice_id: body.choice_id ?? null, text: body.text ?? null, source: "demo", device_id: null };
  recount();
  return { ok: true };
}

function upsert(list, existingId, body, extra = {}) {
  if (existingId) {
    const index = list.findIndex((entry) => entry.id === existingId);
    if (index < 0) refuse("That record no longer exists.", 404);
    list[index] = { ...list[index], ...body, ...extra, id: existingId };
    return clone(list[index]);
  }
  const created = { id: id("demo"), ...body, ...extra };
  list.push(created);
  return clone(created);
}

function remove(list, existingId) {
  const index = list.findIndex((entry) => entry.id === existingId);
  if (index < 0) refuse("That record no longer exists.", 404);
  list.splice(index, 1);
  return { ok: true };
}

function write(method, parts, body, query) {
  const [head, second, third, fourth] = parts;

  switch (head) {
    case "notifications":
      if (method === "POST" && third) return notificationAction(second, third);
      break;

    case "interactions":
      if (method === "POST" && third === "respond") return respond(second, body || {});
      if (method === "POST" && third === "cancel") {
        const question = store.interactions.find((entry) => entry.id === second);
        if (question) { question.status = "cancelled"; question.updated_at = new Date().toISOString(); recount(); }
        return { ok: true };
      }
      break;

    case "settings":
      if (method === "PUT") {
        const restart = body.port !== undefined && Number(body.port) !== store.settings.port;
        store.settings = { ...store.settings, ...body };
        return { settings: clone(store.settings), restart_required: restart };
      }
      break;

    case "types":
      if (method === "PUT") {
        store.types.custom = clone(body.custom || []);
        return clone(store.types);
      }
      break;

    case "sounds":
      if (method === "POST") demoOnly("Uploading a sound");
      break;

    case "providers": {
      if (method === "POST" && !second) {
        const saved = upsert(store.providers, null, sanitiseChannel(body), { updated_at: new Date().toISOString() });
        recount();
        return saved;
      }
      if (method === "PUT" && second) {
        const saved = upsert(store.providers, second, sanitiseChannel(body), { updated_at: new Date().toISOString() });
        recount();
        return saved;
      }
      if (method === "DELETE" && second) {
        store.routes = store.routes.filter((route) => route.provider_id !== second);
        const result = remove(store.providers, second);
        recount();
        return result;
      }
      if (method === "POST" && third === "test") {
        const profile = store.providers.find((entry) => entry.id === second);
        return { succeeded: true, message: `A test notification would be sent through ${profile?.name || "this channel"}. In the demo nothing leaves your browser.` };
      }
      break;
    }

    case "routes": {
      if (method === "POST" && !second) { const saved = upsert(store.routes, null, body); recount(); return saved; }
      if (method === "PUT" && second) { const saved = upsert(store.routes, second, body); recount(); return saved; }
      if (method === "DELETE" && second) { const result = remove(store.routes, second); recount(); return result; }
      break;
    }

    case "agents":
      if (method === "POST" && second === "skills") {
        const skill = store.agents.skills.find((entry) => entry.id === third);
        if (skill) { skill.state = "up_to_date"; skill.note = "Installed in the personal skills folder."; }
        const account = store.agents.accounts.find((entry) => entry.skill.id === third);
        if (account) account.skill.state = "up_to_date";
        return { message: "Skill installed. Restart the agent to load it." };
      }
      break;

    case "quota": {
      if (method === "POST" && second === "refresh") {
        store.quota.checked_at = new Date().toISOString();
        return clone(store.quota);
      }
      if (second === "opencode-go" && method === "PUT") {
        store.quota.open_code_go.renewal_day = body.renewal_day;
        return { ok: true };
      }
      if (second === "accounts") {
        if (method === "POST" && !third) {
          store.quotaAccounts.accounts.push({ id: id("acc"), provider: body.provider, label: body.label, directory: body.directory, is_default: false, wsl: null });
          return { ok: true };
        }
        if (method === "POST" && fourth === "restore") {
          const index = store.quotaAccounts.removed.findIndex((entry) => entry.id === third);
          if (index >= 0) store.quotaAccounts.accounts.push({ ...store.quotaAccounts.removed.splice(index, 1)[0], is_default: false, wsl: null });
          return { ok: true };
        }
        if (method === "PUT" && third) {
          const account = store.quotaAccounts.accounts.find((entry) => entry.id === third);
          if (account) { account.label = body.label; if (body.directory) account.directory = body.directory; }
          return { ok: true };
        }
        if (method === "DELETE" && third) {
          const index = store.quotaAccounts.accounts.findIndex((entry) => entry.id === third);
          if (index >= 0) store.quotaAccounts.removed.push(store.quotaAccounts.accounts.splice(index, 1)[0]);
          return { ok: true };
        }
      }
      break;
    }

    case "menu-bar":
      if (method === "PUT") {
        store.menuBar = { ...store.menuBar, ...body };
        return clone(store.menuBar);
      }
      break;

    case "billing": {
      if (method === "POST" && second === "refresh") return clone(store.billing);
      if (second === "accounts") {
        if (method === "POST" && !third) demoOnly("Storing a provider API key");
        if (method === "PUT" && third) {
          if (body.api_key) demoOnly("Storing a provider API key");
          const account = store.billingAccounts.accounts.find((entry) => entry.id === third);
          if (account) account.label = body.label;
          return { ok: true };
        }
        if (method === "DELETE" && third) {
          const gone = store.billingAccounts.accounts.find((entry) => entry.id === third);
          store.billingAccounts.accounts = store.billingAccounts.accounts.filter((entry) => entry.id !== third);
          if (gone) store.billing.accounts = store.billing.accounts.filter((entry) => entry.provider !== gone.provider);
          return { ok: true };
        }
      }
      break;
    }

    case "router": {
      if (second === "enable" && method === "POST") {
        store.router.enabled = !!body.enabled;
        return { enabled: store.router.enabled };
      }
      if (second === "key" && third === "regenerate" && method === "POST") {
        store.router.has_key = true;
        return { key: `an-router-demo-${Math.random().toString(36).slice(2, 12)}` };
      }
      if (second === "default" && method === "PUT") {
        store.router.default_route = body.route;
        return { ok: true };
      }
      if (second === "switch-settings" && method === "PUT") {
        store.router.switch_strategy = body.strategy;
        store.router.claude_fallback_route = body.claude_fallback_route;
        store.router.smart_routing = body.strategy !== "off";
        return clone(store.router);
      }
      if (second === "models" && third === "fetch" && method === "POST") {
        return { models: ["demo-model-a", "demo-model-b", "demo-model-c"], message: "Model lists come from the provider. The demo offers three invented names." };
      }
      if (second === "upstreams") {
        if (method === "POST" && !third) return upsert(store.router.upstreams, null, body, { has_key: !!body.api_key, credential_ref: null });
        if (method === "PUT" && third) return upsert(store.router.upstreams, third, body);
        if (method === "DELETE" && third) return remove(store.router.upstreams, third);
      }
      if (second === "routes") {
        if (method === "POST" && !third) return upsert(store.router.routes, null, body);
        if (method === "PUT" && third) return upsert(store.router.routes, third, body);
        if (method === "DELETE" && third) return remove(store.router.routes, third);
      }
      if (second === "agents" && third) {
        const agent = store.routerAgents.agents.find((entry) => entry.id === third);
        if (!agent) refuse("That agent is gone.", 404);
        if (fourth === "connect") {
          agent.connected = true;
          agent.selected_model = body.model || agent.selected_model || store.routerAgents.selectable[0];
          if (body.model_slots) agent.model_slots = body.model_slots;
          if (body.option_values) agent.option_values = body.option_values;
          return { message: `${agent.account_label} now asks the router for ${agent.selected_model}.` };
        }
        if (fourth === "disconnect") {
          agent.connected = false;
          agent.selected_model = null;
          return { message: "Settings restored from the copy taken before connecting." };
        }
        if (fourth === "restore") return { message: "Settings restored from that backup." };
      }
      if (second === "effort-mappings") {
        if (method === "PUT") {
          if (body.family) {
            const family = store.effortMappings.families.find((entry) => entry.family === body.family);
            if (family) {
              family.level_map = body.level_map;
              family.supported_values = body.supported_values;
              family.default_value = body.default_value;
              family.source = "family";
            }
          } else if (body.upstream_id) {
            const existing = store.effortMappings.mappings.find((entry) => entry.upstream_id === body.upstream_id && entry.model === body.model);
            if (existing) Object.assign(existing, body, { source: "model" });
            else store.effortMappings.mappings.push({ ...body, source: "model", upstream_slug: body.upstream_slug || "", wire: "openai_chat" });
          }
          return { ok: true };
        }
        if (method === "DELETE") {
          const familyName = query.get("family");
          if (familyName) {
            const family = store.effortMappings.families.find((entry) => entry.family === familyName);
            if (family) family.source = "automatic";
          } else {
            const upstreamId = query.get("upstream_id");
            const model = query.get("model");
            store.effortMappings.mappings = store.effortMappings.mappings
              .filter((entry) => !(entry.upstream_id === upstreamId && entry.model === model));
          }
          return { ok: true };
        }
      }
      break;
    }

    case "relay":
      if (second === "pairings") {
        if (method === "DELETE") return { ok: true };
        demoOnly("Pairing a phone");
      }
      break;
  }

  throw new ApiError(`This demo has nothing behind ${method} /${parts.join("/")}.`, 404);
}

/** A saved channel never echoes a secret back, so the demo drops them exactly as the broker does. */
function sanitiseChannel(body) {
  const secretNames = Object.keys(body.secrets || {});
  const cleared = new Set(body.clear_secrets || []);
  return {
    kind: body.kind,
    name: body.name,
    enabled: body.enabled,
    values: body.values || {},
    secret_names: secretNames.filter((name) => !cleared.has(name)),
    relay: body.pairing_id ? { connected: true, relay_name: "Demo phone" } : undefined,
  };
}

// ---- the surface the views import ---------------------------------------------------------------

export async function request(method, path, body) {
  const { parts, query } = split(path);
  if (body instanceof FormData) demoOnly("Uploading a file");
  return settle(method === "GET" ? get(parts, query) : write(method, parts, body, query));
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body ?? {}),
  put: (path, body) => request("PUT", path, body),
  del: (path) => request("DELETE", path),
};

// The effort-mapping DELETE calls pass their selector in the query string, and the demo simply
// restores the automatic table; resolving which one is not worth the code in a demo.
