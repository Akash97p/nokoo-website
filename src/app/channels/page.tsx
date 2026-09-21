import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellOff, CreditCard, EyeOff, KeyRound, Radio, RefreshCcw } from "lucide-react";

import { ChannelMarquee } from "@/components/channel-marquee";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Outbound channels",
  description:
    "Nineteen opt-in delivery adapters — phone push, chat, mail, webhooks, MQTT — every one off until you configure it, with credentials encrypted on your own computer.",
};

const facts = [
  { value: 19, label: "adapters implemented" },
  { value: 0, label: "enabled before you say so" },
  { value: 1, label: "local record that stays authoritative" },
];

const groups = [
  {
    name: "Your own phone",
    blurb: "The path built for this job, rather than someone else's product with notifications bolted on.",
    items: ["AgentNotify Relay"],
    accent: "border-amber-300/40",
  },
  {
    name: "Push services",
    blurb: "Self-hosted or public push, if you already run one.",
    items: ["ntfy", "Gotify", "Pushover", "Pushbullet"],
    accent: "border-sky-300/30",
  },
  {
    name: "Chat and mail",
    blurb: "Where your team already looks. Message content is excluded by default.",
    items: ["SMTP", "Telegram", "Discord", "Slack", "Microsoft Teams Workflows", "Zoho Cliq", "Google Chat", "Mattermost", "Matrix"],
    accent: "border-violet-300/30",
  },
  {
    name: "Automation and self-hosted",
    blurb: "For anything with an endpoint or a broker of its own.",
    items: ["Generic HTTPS webhook", "MQTT 5"],
    accent: "border-emerald-300/30",
  },
  {
    name: "Paid messaging",
    blurb: "Billed per message by the provider, and labelled as such in the interface.",
    items: ["Twilio SMS", "Meta WhatsApp Cloud API", "Twilio WhatsApp"],
    accent: "border-rose-300/30",
  },
];

export default function ChannelsPage() {
  return (
    <main className="overflow-x-clip">
      <section className="relative overflow-hidden border-b">
        <div className="grid-surface pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[820px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,oklch(0.45_0.12_300/0.22),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary">Outbound delivery · every one opt in</Badge>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">Reach yourself wherever you actually are.</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              A notification is recorded on your computer first and always. A channel is the optional second step that
              carries it somewhere else — your phone, a chat room, an inbox, an endpoint of your own. Nineteen are
              implemented; every one is off until you configure and enable it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg"><Link href="/docs/channels/">Read the channel guide <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/relay/">About AgentNotify Relay</Link></Button>
            </div>
          </Reveal>
        </div>
        <div className="pb-14">
          <ChannelMarquee />
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
          <Badge variant="outline">The inventory</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Pick the ones you already use.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            You can add more than one of each — a quiet Slack channel for completions, your phone for approvals only.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <StaggerItem key={group.name}>
              <div className={`h-full rounded-xl border bg-card p-5 ${group.accent}`}>
                <p className="text-sm font-medium">{group.name}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{group.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">{item}</span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Separator />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-2xl">
          <Badge variant="secondary">How they behave</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Delivery is secondary, on purpose.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            A channel that is down, misconfigured, or rate limited never removes, changes, or delays the local record.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature icon={BellOff} title="Off until you say otherwise">New profiles and new routes are both created disabled. Nothing leaves the machine because you added a channel — only because you enabled a route that matches.</Feature>
          <Feature icon={EyeOff} title="Message content is opt in">A route sends the title and type by default. Including the message body is a separate tick, because chat rooms have other people in them.</Feature>
          <Feature icon={KeyRound} title="Credentials never come back">Secrets are encrypted for the current user and are write-only in the interface: leave a field blank to keep it, type to replace it, tick to erase it.</Feature>
          <Feature icon={RefreshCcw} title="A durable outbox">Delivery runs off the request path with bounded retries, timeouts, payload limits, and idempotency, so a slow provider cannot stall the broker.</Feature>
          <Feature icon={Radio} title="Routes decide, not channels">Priority, type, project, and agent filters choose what goes where. One notification can match several routes and delivers once per route.</Feature>
          <Feature icon={CreditCard} title="Paid services are labelled">Twilio and WhatsApp adapters carry a visible cost warning, and stay opt-in like everything else.</Feature>
        </Stagger>
      </section>

      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="outline">Honest about verification</Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Tested with fake transports, not with your account.</h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Automated tests use synthetic secrets and fake transports. They prove the adapter builds and sends the right
              request; they cannot prove your provider account, template, broker ACL, quota, or recipient is correct. That is
              what each channel&apos;s <strong className="text-foreground">Test</strong> button is for — after you have read
              what it will cost and who will see it.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild><Link href="/docs/channels/">Per-adapter documentation <ArrowRight /></Link></Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, children }: { icon: typeof Radio; title: string; children: React.ReactNode }) {
  return (
    <StaggerItem>
      <Card className="h-full"><CardHeader><div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-background"><Icon className="size-4" /></div><CardTitle>{title}</CardTitle><CardDescription className="leading-6">{children}</CardDescription></CardHeader></Card>
    </StaggerItem>
  );
}
