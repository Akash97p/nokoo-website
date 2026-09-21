export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const site = {
  name: "AgentNotify",
  tagline: "The local control plane for coding agents — with notifications built in.",
  description:
    "The local control plane for coding agents: route model calls, measure usage and cost, watch live quota, and get notified — and answer — when an agent needs you.",
  url: "https://akash97p.github.io/agent-notify",
  repository: "https://github.com/Akash97p/agent-notify",
  releases: "https://github.com/Akash97p/agent-notify/releases",
} as const;

/** Documentation entry point. There is no separate documentation landing page. */
export const docsEntry = "/docs/install-with-agent/";

export const navigation = [
  { label: "Model router", href: "/router/" },
  { label: "Insights", href: "/insights/" },
  { label: "Channels", href: "/channels/" },
  { label: "Relay", href: "/relay/" },
  { label: "ARC", href: "/arc/" },
  { label: "Documentation", href: docsEntry },
] as const;

/**
 * The web interface, served from this site with invented data. It is a copy of the broker's own UI
 * staged by scripts/build-site.sh, so it lives outside Next's routing and is linked, never routed.
 */
export const demoPath = `${basePath}/demo/`;

export const visuals = {
  attentionQueue: `${basePath}/visuals/attention-queue.svg`,
  insightsDashboard: `${basePath}/visuals/insights-dashboard.svg`,
  routerFlow: `${basePath}/visuals/router-flow.svg`,
} as const;
