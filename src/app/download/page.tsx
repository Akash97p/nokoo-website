import type { Metadata } from "next";
import Link from "next/link";
import { Apple, BarChart3, Lock, Monitor, Terminal, UserRound } from "lucide-react";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountDownloads } from "./account-downloads";

export const metadata: Metadata = {
  title: "Download Nokoo",
  description:
    "Nokoo for Windows, macOS, and Linux. Free with a Nokoo account — create one here and download straight away.",
};

const platforms = [
  {
    icon: Monitor,
    name: "Windows",
    detail: "Windows 10 and 11, x64",
    install: "A per-user installer — no administrator rights. It adds the tray app and the nokoo command.",
  },
  {
    icon: Apple,
    name: "macOS",
    detail: "Apple silicon and Intel",
    install: "An archive with the nokood broker, the nokoo command, and the menu-bar quota app. Unpack it and run ./install.sh.",
  },
  {
    icon: Terminal,
    name: "Linux",
    detail: "x64 and arm64",
    install: "An archive with the nokood broker and the nokoo command. Unpack it and run ./install.sh; the web interface opens with nokoo ui.",
  },
];

const facts = [
  {
    icon: UserRound,
    title: "Why an account",
    body: "Nokoo is not open source, so there is no public release page. Your account is how we hand you the builds — every current and earlier one, checksummed — and it is the same account Relay uses. It is free: no card, no plan.",
  },
  {
    icon: Lock,
    title: "What a download records",
    body: "Your account, the build and platform you chose, the time, your IP address, and your browser's user agent. That is how we count downloads and stop abuse. Nothing else.",
  },
  {
    icon: BarChart3,
    title: "What the app sends",
    body: "Once a day, a random installation id, the operating system and its version, the processor architecture, and the Nokoo version — so we know how many installations are in use. It is not linked to your account, and one switch turns it off.",
  },
];

export default function DownloadPage() {
  return (
    <main className="overflow-x-clip">
      <section className="relative overflow-hidden border-b">
        <div className="grid-surface pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="max-w-3xl">
            <Badge variant="secondary">Free · Windows, macOS, Linux</Badge>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">Download Nokoo.</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Create a free account below and download the build for your computer. The desktop app is free to use on
              your own machines; Relay, to reach your phone, is an optional plan you can add later with the same account.
            </p>
            <p className="mt-5 text-sm text-muted-foreground">
              By downloading you accept the <Link href="/eula/" className="underline underline-offset-4 hover:text-foreground">End User Licence Agreement</Link>.
              See the <Link href="/privacy/" className="underline underline-offset-4 hover:text-foreground">privacy policy</Link> for what is recorded.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="get" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="rounded-xl border bg-card p-6 sm:p-8">
          <AccountDownloads />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <Stagger className="grid gap-4 md:grid-cols-3">
          {platforms.map((platform) => (
            <StaggerItem key={platform.name}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-background"><platform.icon className="size-4" /></div>
                  <CardTitle>{platform.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{platform.detail}</p>
                  <CardDescription className="pt-2 leading-6">{platform.install}</CardDescription>
                </CardHeader>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal className="max-w-2xl">
            <Badge variant="outline">Plainly</Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">What we know about you, and what we don&apos;t.</h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {facts.map((fact) => (
              <StaggerItem key={fact.title}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-background"><fact.icon className="size-4" /></div>
                    <CardTitle>{fact.title}</CardTitle>
                    <CardDescription className="leading-6">{fact.body}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-8 max-w-3xl text-sm text-muted-foreground">
            Your notifications, prompts, code, files, projects, and usage figures stay on your computer. The only exceptions
            are channels you configure yourself — Relay, a messaging app, or the model router — and they send only what that
            channel needs.
          </p>
        </div>
      </section>
    </main>
  );
}
