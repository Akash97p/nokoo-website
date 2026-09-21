import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitBranch, LockKeyhole, Route, ScrollText, Server, Workflow } from "lucide-react";

import { RouterFlow, WireLanes } from "@/components/router-flow";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Model router",
  description:
    "The opt-in AgentNotify model router: loopback endpoint, wire translation, aliases and fallback combos, agent connectors, and a redacted request ledger.",
};

const facts = [
  { value: 3, label: "wire formats accepted" },
  { value: 1, label: "loopback entry point" },
  { value: 0, label: "prompts stored in the ledger" },
];

export default function RouterPage() {
  return (
    <main className="overflow-x-clip">
      <section className="relative overflow-hidden border-b">
        <div className="grid-surface pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[820px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,oklch(0.45_0.11_240/0.26),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="max-w-3xl">
            <Badge variant="secondary">Model router · Opt in</Badge>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">Change the model path, not the agent.</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">Codex, Claude Code, and any OpenAI-compatible client keep speaking their own wire format. Point them at the local AgentNotify router and it resolves a provider and model, translates when the wires differ, retries a cooling target, and records what happened — off until you switch it on.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/docs/router/">Read the router guide <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/arc/">How attention requests work</Link></Button>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="mt-14">
            <RouterFlow />
          </Reveal>
        </div>
      </section>

      <section className="border-b bg-card/30">
        <Stagger className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {facts.map((fact) => (
            <StaggerItem key={fact.label} className="text-center sm:text-left">
              <p className="text-4xl font-semibold tracking-[-0.04em]"><CountUp value={fact.value} /></p>
              <p className="mt-1 text-sm text-muted-foreground">{fact.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-2xl">
          <Badge variant="outline">What it does</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">A router, not a proxy you forget about.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">Every behaviour is explicit, reversible, and visible in the web interface.</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature icon={Server} title="Loopback and off by default">The router listens on <code className="font-mono text-foreground">127.0.0.1</code> under its own key, separate from the notification API token. Nothing routes until you enable it.</Feature>
          <Feature icon={Workflow} title="Three wires, one decision">OpenAI Responses, OpenAI Chat Completions, and Anthropic Messages are accepted, translated only when needed, and passed through unchanged when the upstream already speaks the same format.</Feature>
          <Feature icon={GitBranch} title="Aliases, combos, failover">Address an upstream directly, use a nickname, or define an ordered combo. A target that fails, is cooling, or rejects the request hands it to the next eligible one — each gets its own rendering, so one provider&apos;s refusal does not end the chain. Requests that already streamed are never replayed blindly.</Feature>
          <Feature icon={Route} title="Agent connectors">Generate a Codex model catalogue and provider block, or Claude Code model-picker rows with matching behaviour classes. AgentNotify copies the file before every write, and restore or disconnect puts your values back.</Feature>
          <Feature icon={ScrollText} title="A ledger you can trust">One row per logical request with provider, model, attempts, status, and token counts when the upstream reports them. Prompts, responses, headers, keys, and provider error bodies are never stored.</Feature>
          <Feature icon={LockKeyhole} title="A separate spending boundary">Upstream keys are sealed with the same current-user encryption as delivery channels and are write-only in the interface. The router key cannot read notifications, and the notification token cannot route traffic.</Feature>
        </Stagger>
      </section>

      <Separator />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <Badge variant="secondary">How a request travels</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Resolve, translate, send, record.</h2>
          <ol className="mt-8 grid gap-4">
            <Step index="1" title="Admit">The router authenticates the request with its own key and applies the same bounded body limits as the notification API.</Step>
            <Step index="2" title="Resolve">A model selector becomes a concrete provider and model: an exact upstream, a unique alias, a combo, or a smart-switching group across providers that expose the same model.</Step>
            <Step index="3" title="Translate">If the client wire and the upstream wire differ, the request is normalised and the response is reframed for the client. Same-wire traffic is passed through untouched.</Step>
            <Step index="4" title="Record">Each physical attempt is appended to the local ledger, and the visible row keeps the redacted route trace so a surprising answer can be explained.</Step>
          </ol>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="bg-black">
            <CardHeader className="border-b"><p className="font-mono text-xs text-muted-foreground">what the router accepts</p></CardHeader>
            <div className="p-5">
              <WireLanes />
              <div className="mt-6 border-t pt-5 font-mono text-[13px] leading-6 text-zinc-300">
                <pre className="overflow-x-auto"><code>{`model: "fast"

  resolve  combo/fast
    ├─ opencode-go/kimi-k3       cooling
    ├─ deepseek/deepseek-chat    served
    └─ codex-plan/gpt-5.1-mini   standby

  wire     responses → chat
  usage    reported · 4,792 tokens
  ledger   1 row · no prompt stored`}</code></pre>
              </div>
            </div>
          </Card>
        </Reveal>
      </section>

      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <Reveal>
              <Badge variant="outline">Boundaries</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your traffic goes where you point it.</h2>
              <p className="mt-5 leading-7 text-muted-foreground">Routing sends request content to the upstream provider you selected — that is the point of a router, and it is stated plainly rather than buried. Notification history, credentials, and non-router traffic never take part. Subscription-based integrations are labelled unofficial and stay opt-in.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild><Link href="/docs/router/">Router documentation <ArrowRight /></Link></Button>
                <Button asChild variant="outline"><a href={site.repository}>View source</a></Button>
              </div>
            </Reveal>
            <Stagger className="grid gap-3">
              <StaggerItem><Step index="✓" title="Local routing decisions">Model resolution and failover happen on your machine; the decision trace is stored with the ledger row.</Step></StaggerItem>
              <StaggerItem><Step index="✓" title="Bounded retries">Attempts are capped, timeouts are enforced, and a partially delivered stream is never retried as if nothing was sent.</Step></StaggerItem>
              <StaggerItem><Step index="✓" title="No hidden fallback">A request that cannot be routed fails with a clear error instead of quietly choosing a different provider.</Step></StaggerItem>
            </Stagger>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, children }: { icon: typeof Server; title: string; children: React.ReactNode }) {
  return (
    <StaggerItem>
      <Card className="h-full"><CardHeader><div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-background"><Icon className="size-4" /></div><CardTitle>{title}</CardTitle><CardDescription className="leading-6">{children}</CardDescription></CardHeader></Card>
    </StaggerItem>
  );
}

function Step({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex list-none gap-4 rounded-lg border bg-card p-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background font-mono text-xs">{index}</span>
      <span><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{children}</span></span>
    </li>
  );
}
