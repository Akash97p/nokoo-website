import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Check,
  Coins,
  Database,
  Gauge,
  LockKeyhole,
  Minus,
  Network,
  PlayCircle,
  Radio,
  Route,
  Terminal,
} from "lucide-react";

import { ControlPlaneDiagram } from "@/components/control-plane-diagram";
import { CopyCommand } from "@/components/copy-command";
import { MenubarDemo } from "@/components/menubar-demo";
import { ChannelMarquee } from "@/components/channel-marquee";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { basePath, demoPath, docsEntry, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const facts = [
  { value: 11, label: "agent hosts with adapters" },
  { value: 19, label: "opt-in delivery channels" },
  { value: 6, label: "local usage sources" },
  { value: 3, label: "wire formats the router speaks" },
  { value: 0, label: "telemetry services" },
];

const pillars = [
  {
    icon: BellRing,
    tone: "text-amber-300",
    glow: "from-amber-300/15",
    name: "Notify",
    title: "Knows when an agent needs you",
    body: "Permissions, questions, blockers, failures, and completions become durable attention requests. They reach your desktop or phone, and your answer goes back to the agent that asked.",
    points: ["Unresolved state that survives a restart", "Answer from the desktop or a paired phone", "19 opt-in channels, all off until you enable them"],
    href: "/docs/interactions/",
    link: "How interactions work",
  },
  {
    icon: Route,
    tone: "text-sky-300",
    glow: "from-sky-300/15",
    name: "Route",
    title: "Sends every model call where you choose",
    body: "A loopback router speaks OpenAI Responses, Chat Completions, and Anthropic Messages. It picks a provider and model, translates between wires, and fails over — without changing the agent.",
    points: ["Nicknames, fallback chains, smart switching", "Codex and Claude Code connected in one click", "A ledger that never stores prompts or keys"],
    href: "/router/",
    link: "Explore the model router",
  },
  {
    icon: Coins,
    tone: "text-violet-300",
    glow: "from-violet-300/15",
    name: "Measure",
    title: "Counts what every agent spends",
    body: "Tokens by day, agent, project, model, and session — from Claude Code, Codex, OpenCode, Kilo, Muse Code, and the Gemini CLI, read locally and priced at each provider's published rate.",
    points: ["Works offline from local agent records", "WSL sessions counted on Windows", "Unpriced records stay unpriced"],
    href: "/insights/",
    link: "Explore Insights",
  },
  {
    icon: Gauge,
    tone: "text-emerald-300",
    glow: "from-emerald-300/15",
    name: "Quota",
    title: "Shows how much runway is left",
    body: "Live balances for every Codex and Claude Code account on the machine — second profiles and WSL included — with API account balances and spend beside them.",
    points: ["Every window, with its reset time", "Five-hour balances in the macOS menu bar", "Cached and rate-limited, checked on demand"],
    href: "/docs/web-ui/",
    link: "The web interface",
  },
] as const;

// What a typical AI gateway covers, next to what this adds. Deliberately generic: it describes the
// category, not any named product.
const comparison = [
  { row: "Route model calls across providers", gateway: true },
  { row: "Fail over and translate between wire formats", gateway: true },
  { row: "Token usage and cost", gateway: true },
  { row: "Live Claude Code and Codex subscription quota", gateway: false },
  { row: "Tell you when an agent is blocked on you", gateway: false },
  { row: "Carry your answer back to the waiting agent", gateway: false },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <section className="relative border-b">
        <div className="grid-surface pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,oklch(0.45_0.12_265/0.28),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <Reveal className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 border-border bg-background/70 px-3 py-1 text-muted-foreground">
              Agent control plane · notifications built in
            </Badge>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">
              Route, meter, and hear from every coding agent.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              AgentNotify is a local control plane for Claude Code, Codex, OpenCode, and the rest. It routes their model
              calls, counts what they spend, and watches your quota — and it does the part other control planes leave out:
              it tells you the moment an agent needs you, and carries your answer back.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg"><a href={demoPath} target="_blank" rel="noreferrer"><PlayCircle />Try the interface</a></Button>
              <Button asChild size="lg" variant="ghost"><Link href={docsEntry}>Install with your agent</Link></Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Local first · open source · no telemetry. Windows desktop app; broker, CLI, dashboard, and router on macOS and Linux too.</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-16">
            <ControlPlaneDiagram />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Stagger className="grid divide-y rounded-xl border bg-card sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          {facts.map((fact) => (
            <StaggerItem className="px-6 py-5" key={fact.label}>
              <p className="text-3xl font-semibold tracking-tight tabular-nums"><CountUp value={fact.value} /></p>
              <p className="text-sm text-muted-foreground">{fact.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Reveal className="max-w-2xl">
          <Badge variant="secondary">Four jobs, one process</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Everything between your agents and the outside world.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            One loopback service sits between your coding agents, the model providers they call, and you. It mediates and
            observes; it never does the agent&apos;s work.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <StaggerItem key={pillar.name}>
              <Card className="group relative h-full overflow-hidden transition-colors hover:border-foreground/25">
                <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent to-60% opacity-60 transition-opacity group-hover:opacity-100", pillar.glow)} />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md border bg-background"><pillar.icon className={cn("size-4", pillar.tone)} /></div>
                    <span className={cn("font-mono text-xs uppercase tracking-[0.18em]", pillar.tone)}>{pillar.name}</span>
                  </div>
                  <CardTitle className="mt-4 text-xl tracking-tight">{pillar.title}</CardTitle>
                  <CardDescription className="leading-6">{pillar.body}</CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="grid gap-2 text-sm">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex items-start gap-2"><Check className={cn("mt-0.5 size-4 flex-none", pillar.tone)} />{point}</li>
                    ))}
                  </ul>
                  <Link href={pillar.href} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                    {pillar.link} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-y bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <Reveal>
            <Badge variant="secondary">The missing layer</Badge>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Control planes route and meter. None of them tells you an agent is stuck.</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              An agent can work for hours without help. The expensive moment is when one stops silently at a permission
              prompt, a missing credential, or a decision only you can make. An AI gateway sees the request stop. AgentNotify
              asks you, and hands the answer back.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="grid grid-cols-[minmax(0,1fr)_88px_104px] border-b bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground sm:grid-cols-[minmax(0,1fr)_120px_120px]">
                <span />
                <span className="text-center">Typical AI gateway</span>
                <span className="text-center text-foreground">AgentNotify</span>
              </div>
              {comparison.map((item) => (
                <div key={item.row} className="grid grid-cols-[minmax(0,1fr)_88px_104px] items-center border-b px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[minmax(0,1fr)_120px_120px]">
                  <span>{item.row}</span>
                  <span className="flex justify-center">{item.gateway ? <Check className="size-4 text-muted-foreground" /> : <Minus className="size-4 text-muted-foreground/40" />}</span>
                  <span className="flex justify-center"><Check className={cn("size-4", item.gateway ? "text-foreground" : "text-amber-300")} /></span>
                </div>
              ))}
              <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                <LockKeyhole className="size-3.5" />And all of it on your machine, with its API on loopback.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <Reveal>
          <Badge variant="secondary">New · macOS</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Your quota, in the menu bar.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Pick the Codex and Claude Code accounts you care about, and each gets its own menu-bar item showing its
            five-hour balance. Open any of them to see every account and every window, with its reset time.
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="mt-0.5 size-4 flex-none text-emerald-300" />Second profiles such as <code className="rounded border bg-card px-1 font-mono text-foreground">~/.claude-second</code> found automatically</li>
            <li className="flex gap-2"><Check className="mt-0.5 size-4 flex-none text-emerald-300" />A native status item, started and stopped with the broker</li>
            <li className="flex gap-2"><Check className="mt-0.5 size-4 flex-none text-emerald-300" />Chosen from the web interface, under Live quota</li>
          </ul>
          <Button asChild variant="outline" className="mt-8"><Link href="/docs/installation-unix/">Install on macOS <ArrowRight /></Link></Button>
        </Reveal>
        <Reveal delay={0.1}>
          <MenubarDemo />
          <p className="mt-3 text-center text-xs text-muted-foreground">Illustration — click a status item or an account. Values are made up.</p>
        </Reveal>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Badge variant="secondary">Two-way</Badge>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Answer it, don&apos;t just read it.</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">An agent can ask you something and carry on with other work while you decide. Your answer is waiting when it checks back, and it reaches the session that asked.</p>
            <p className="mt-5 leading-7 text-muted-foreground">For Codex and Claude Code, the host&apos;s own approval prompt can wait for you: every shell command and file write pauses with the exact command shown. If nothing answers in time it falls back to the ordinary local prompt, so it can never lock you out.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link href="/docs/interactions/">How interactions work <ArrowRight /></Link></Button><Button asChild variant="outline"><Link href="/docs/harness/">Agent harnesses</Link></Button></div>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="min-w-0 overflow-hidden bg-black py-0">
              <div className="relative p-5 font-mono text-[13px] leading-6 text-zinc-300">
                <CopyCommand value={'agentnotify send --type permission_required --title "Deploy approval" --message "May I publish the release?"'} />
                <span className="text-zinc-600">$ </span>agentnotify send \<br />
                &nbsp;&nbsp;--type permission_required \<br />
                &nbsp;&nbsp;--title <span className="text-white">&quot;Deploy approval&quot;</span> \<br />
                &nbsp;&nbsp;--message <span className="text-white">&quot;May I publish the release?&quot;</span>
                <pre className="mt-5 overflow-x-auto border-t border-zinc-800 pt-5"><code>{`$ agentnotify install-harness claude --ask

# Claude Code now pauses for your decision:
#   "Claude Code approval: Bash rm -rf /tmp/build"
#     [ Allow once ]  [ Deny ]`}</code></pre>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="border-y bg-card/40 py-20">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <Badge variant="outline">Delivery</Badge>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">Your attention, where you want it.</h2>
              <p className="mt-5 leading-7 text-muted-foreground">Every remote destination is opt-in. Credentials are encrypted at rest, payloads are bounded, and a provider failure never rejects the local request.</p>
            </div>
            <Button asChild variant="outline"><Link href="/channels/">Explore channels <ArrowRight /></Link></Button>
          </div>
        </Reveal>
        <div className="mt-10"><ChannelMarquee /></div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <Badge variant="secondary">ARC 0.2</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">One contract for attention.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">The Attention Request Contract is an open JSON contract for creating, updating, answering, and resolving bounded requests for human attention. It separates an immutable event from the condition that remains unresolved, and a request that expects an answer carries the shape of the answer it is waiting for.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link href="/arc/">Read the specification <ArrowRight /></Link></Button><Button asChild variant="outline"><a href={`${basePath}/schemas/arc-0.2.schema.json`}>JSON Schema</a></Button></div>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="min-w-0 bg-black">
            <CardContent className="p-5 font-mono text-[13px] leading-6 text-zinc-300">
              <pre className="overflow-x-auto"><code>{`{
  "arc_version": "0.2",
  "event_type": "request.created",
  "sender": { "id": "codex", "name": "Codex" },
  "request": {
    "key": "release-approval",
    "kind": "permission",
    "message": "May I publish the release?",
    "priority": "high",
    "response": {
      "kind": "permission",
      "choices": [
        { "id": "allow_once", "label": "Allow once" },
        { "id": "deny", "label": "Deny" }
      ]
    }
  }
}`}</code></pre>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal className="text-center"><Badge variant="secondary">Architecture</Badge><h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">Simple at the boundary. Durable underneath.</h2></Reveal>
        <Stagger className="mt-12 grid gap-3 lg:grid-cols-4">
          <StaggerItem><Flow icon={Terminal} title="Coding agents" detail="CLI · ARC · harnesses · model calls" /></StaggerItem>
          <StaggerItem><Flow icon={Radio} title="Loopback API" detail="Bearer auth · router key · validation" /></StaggerItem>
          <StaggerItem><Flow icon={Database} title="Local state" detail="SQLite · dedup · history · ledger" /></StaggerItem>
          <StaggerItem><Flow icon={Network} title="Outward" detail="Providers · desktop · chat · push" /></StaggerItem>
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Reveal>
          <Card className="items-center bg-primary py-12 text-center text-primary-foreground">
            <CardHeader className="max-w-3xl"><CardTitle className="text-3xl tracking-[-0.035em] sm:text-4xl">Stop checking every terminal.</CardTitle><CardDescription className="mt-3 text-base text-primary-foreground/70">Install AgentNotify, hand your coding agent the bundled skill, and let the control plane tell you when a human is actually needed.</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-3"><Button asChild variant="secondary"><a href={demoPath} target="_blank" rel="noreferrer">Try the interface <ArrowRight /></a></Button><Button asChild variant="outline" className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"><Link href={docsEntry}>Install with your agent</Link></Button></CardContent>
          </Card>
        </Reveal>
      </section>
    </main>
  );
}

function Flow({ icon: Icon, title, detail }: { icon: typeof Terminal; title: string; detail: string }) {
  return <Card className="h-full gap-3 py-5"><CardHeader><Icon className="mb-3 size-5" /><CardTitle className="text-base">{title}</CardTitle><CardDescription>{detail}</CardDescription></CardHeader></Card>;
}
