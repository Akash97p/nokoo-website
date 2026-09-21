import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Braces, CheckCheck, FileJson, Fingerprint, GitCompareArrows, ShieldCheck } from "lucide-react";

import { ArcLifecycle } from "@/components/arc-lifecycle";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { basePath } from "@/lib/site";

export const metadata: Metadata = {
  title: "ARC — the Attention Request Contract",
  description:
    "ARC 0.2 is an open, transport-neutral JSON contract for the moment a software agent needs a person: four event types, six request kinds, and an answer that comes back.",
};

const facts = [
  { value: 4, label: "event types in the whole contract" },
  { value: 6, label: "request kinds" },
  { value: 3, label: "answer shapes an agent can ask for" },
];

const kinds = [
  { name: "information", body: "Something happened you may want to know. No answer expected." },
  { name: "question", body: "The agent is waiting for a choice or a short text before it continues." },
  { name: "permission", body: "The agent wants to do something consequential and needs a yes or no." },
  { name: "blocked", body: "Work cannot proceed until something outside the agent changes." },
  { name: "failure", body: "An attempt failed in a way a person should see." },
  { name: "completion", body: "The work finished, with the result in the payload." },
];

export default function ArcPage() {
  return (
    <main className="overflow-x-clip">
      <section className="relative overflow-hidden border-b">
        <div className="grid-surface pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[820px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,oklch(0.45_0.12_85/0.22),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <Reveal>
              <Badge variant="secondary">Open contract · version 0.2 · public draft</Badge>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">A standard shape for “an agent needs you”.</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Every agent framework invents its own way to say a person is required, so every notifier has to learn all of
                them. ARC is one transport-neutral JSON contract for that moment: what is being asked, what shape the answer
                takes, and how the answer gets back — without prescribing how any of it is carried, stored, or displayed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg"><Link href="/docs/arc/">Read the specification <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline"><a href={`${basePath}/schemas/arc-0.2.schema.json`}>JSON Schema</a></Button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">AgentNotify defines ARC and is its first reference implementation. The contract does not depend on the product.</p>
            </Reveal>
            <Reveal delay={0.15}>
              <ArcLifecycle />
            </Reveal>
          </div>
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
          <Badge variant="outline">What 0.2 added</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">0.1 could only say a person was needed.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            It had no way to say <em>what</em> was being asked, and no way to carry back what the person said. 0.2 closes
            that loop, and replaces 0.1 rather than extending it.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature icon={GitCompareArrows} title="An answer the request asks for">A created or updated request can declare that it is waiting, and for which shape: a permission, one of a bounded list of choices, or a short text.</Feature>
          <Feature icon={CheckCheck} title="An answer that comes back"><code className="font-mono text-foreground">response.submitted</code> carries exactly one human answer to the producer, authorised by the request&apos;s digest and nonce.</Feature>
          <Feature icon={Fingerprint} title="Correlation that survives the hop"><code className="font-mono text-foreground">turn_id</code> and <code className="font-mono text-foreground">native_request_id</code> let a host adapter return an accepted answer into the very call that is blocking on it.</Feature>
          <Feature icon={Braces} title="Stable conditions, not just events">A request key identifies one unresolved condition. Updates replace it rather than piling up, and resolution records why it closed.</Feature>
          <Feature icon={FileJson} title="Small enough to emit from a hook">Six required fields. A shell hook, a stdout adapter, an HTTP client, or a message bus can all produce it without a library.</Feature>
          <Feature icon={ShieldCheck} title="First answer wins">A second answer to the same request is refused, not queued — so the desktop, the phone, and the terminal can all offer the choice safely.</Feature>
        </Stagger>
      </section>

      <Separator />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <Reveal>
          <Badge variant="secondary">Request kinds</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Six kinds cover what agents actually interrupt you for.</h2>
          <p className="mt-5 leading-7 text-muted-foreground">
            The kind says why the agent stopped. Priority, routing, sound, and presentation are the consumer&apos;s policy,
            not the producer&apos;s — which is what lets one contract serve a toast, a phone, and a chat room at once.
          </p>
          <div className="mt-7">
            <Button asChild variant="outline"><Link href="/docs/agent-integration/">When an agent should ask <ArrowRight /></Link></Button>
          </div>
        </Reveal>
        <Stagger className="grid gap-3 sm:grid-cols-2">
          {kinds.map((kind) => (
            <StaggerItem key={kind.name}>
              <div className="h-full rounded-lg border bg-card p-4">
                <p className="font-mono text-sm text-foreground">{kind.name}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{kind.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <Reveal>
              <Badge variant="outline">Deliberately out of scope</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">What ARC does not try to be.</h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                A contract that covers everything gets implemented by nobody. ARC 0.2 defines no agent telemetry, no model
                traces, no tool inputs or outputs, no attachments, no authentication, no discovery, no network transport, no
                broker storage, and no outbound delivery. It also does not define multi-select answers, or unsolicited
                messages from a person to an agent.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild><Link href="/docs/arc/">Full specification <ArrowRight /></Link></Button>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <Card className="bg-black">
                <CardHeader className="border-b"><p className="font-mono text-xs text-muted-foreground">request.created · abridged</p></CardHeader>
                <div className="p-5 font-mono text-[13px] leading-6 text-zinc-300">
                  <pre className="overflow-x-auto"><code>{`{
  "arc_version": "0.2",
  "event_type": "request.created",
  "sender": { "id": "claude", "name": "Claude Code" },
  "context": { "project": "checkout-service" },
  "request": {
    "key": "migrate-staging",
    "kind": "permission",
    "title": "Run the staging migration?",
    "response": {
      "kind": "permission",
      "choices": [
        { "id": "allow", "label": "Allow" },
        { "id": "deny",  "label": "Deny"  }
      ]
    }
  }
}`}</code></pre>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, children }: { icon: typeof Braces; title: string; children: React.ReactNode }) {
  return (
    <StaggerItem>
      <Card className="h-full"><CardHeader><div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-background"><Icon className="size-4" /></div><CardTitle>{title}</CardTitle><CardDescription className="leading-6">{children}</CardDescription></CardHeader></Card>
    </StaggerItem>
  );
}
