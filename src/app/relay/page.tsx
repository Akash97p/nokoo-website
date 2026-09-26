import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquareReply, QrCode, ScanLine, ServerOff, ShieldAlert, Smartphone } from "lucide-react";

import { RelayPath } from "@/components/relay-path";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Nokoo Relay",
  description:
    "The hosted hop from your computers to your phone: device-sealed payloads, browser approval instead of pasted tokens, and answers that travel back to the waiting agent.",
};

const steps = [
  { icon: ScanLine, title: "Approve a computer in the browser", body: "Pairing follows the OAuth device authorization grant — the handshake you already use to sign a CLI or a TV into an account. Nokoo shows a short code; you approve it in the relay console. Nothing is typed between the two." },
  { icon: QrCode, title: "Scan once per phone", body: "The QR code is a short-lived, single-use challenge, not a credential. The phone's device credential is minted only when it presents that challenge." },
  { icon: Smartphone, title: "Every paired computer can reach it", body: "A phone belongs to your relay account rather than to one machine, so a second laptop needs no second scan." },
  { icon: MessageSquareReply, title: "Answer from the phone", body: "A permission, a choice, or a short text goes back through the relay; the running broker picks it up and returns it to the waiting host adapter." },
];

export default function RelayPage() {
  return (
    <main className="overflow-x-clip">
      <section className="relative overflow-hidden border-b">
        <div className="grid-surface pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[820px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,oklch(0.45_0.11_155/0.22),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <Reveal>
              <Badge variant="secondary">Hosted transport · optional</Badge>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">The hop that exists only to reach your phone.</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Every other channel hands your notifications to somebody else&apos;s product. Relay is the alternative: one
                hop built for this single job, that your computers send to and your phone reads from — with the payload
                sealed for the receiving device before it leaves your machine.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg"><Link href="/docs/relay/">Read the Relay guide <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline"><Link href="/pricing/">See pricing</Link></Button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">There is no server to install and no address to enter. Relay is one more opt-in channel, and Nokoo works fully without it.</p>
            </Reveal>
            <Reveal delay={0.15}>
              <RelayPath />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-2xl">
          <Badge variant="outline">Setting it up</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">No tokens typed anywhere.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            The installation credential is delivered to the waiting computer, never to the browser, and is written straight
            into the platform secret store without ever being displayed.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <StaggerItem key={step.title}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-background"><step.icon className="size-4" /></div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription className="leading-6">{step.body}</CardDescription>
                </CardHeader>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Separator />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <Badge variant="secondary">What the relay can see</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Ciphertext, and the metadata needed to deliver it.</h2>
          <p className="mt-5 leading-7 text-muted-foreground">
            Notification and interaction payloads are sealed per recipient device with X25519 and XChaCha20-Poly1305 before
            they leave your machine. The relay stores the sealed bytes, is not a decryption client, and its operator console
            renders delivery metadata only.
          </p>
          <p className="mt-4 leading-7 text-muted-foreground">
            It does see what it must to route: which installation sent an envelope, which device it is for, the key id,
            timestamps, sizes, and delivery state — plus your sender name, if you set one. A device that has never
            registered a public key is skipped rather than sent in the clear.
          </p>
          <div className="mt-7">
            <Button asChild variant="outline"><Link href="/docs/relay-interactions/">The phone answer contract <ArrowRight /></Link></Button>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="grid gap-4">
          <Card className="border-amber-300/40">
            <CardHeader>
              <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-background"><ShieldAlert className="size-4 text-amber-300" /></div>
              <CardTitle>Scope of the claim</CardTitle>
              <CardDescription className="leading-6">
                The envelope format has not had an independent cryptographic review, and the mobile implementation is
                Android-first. Sealing is implemented on both sides and checked against shared test vectors — the .NET
                adapter reproduces the relay&apos;s output byte for byte, and altering any bound field fails
                authentication — but treat confidentiality against the relay operator as tested rather than audited.
                Answers from the phone are currently plaintext to the relay; they are authenticated, then revalidated by
                the broker for digest, nonce, expiry, and first-wins state. Sealing answers remains future work.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-background"><ServerOff className="size-4" /></div>
              <CardTitle>A transport, not a system of record</CardTitle>
              <CardDescription className="leading-6">
                Local Nokoo history stays authoritative. A relay that is unreachable never blocks or loses a local
                notification — it just means the copy on your phone arrives later, or not at all.
              </CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
      </section>

      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="outline">Your choice, per route</Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">The message body only leaves if you send it.</h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Each route carries its own <strong className="text-foreground">include notification message off-device</strong>{" "}
              switch. Leave it off for anything you would not want stored outside your computer, whatever the transport —
              and the title and type still reach you.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild><Link href="/docs/relay/">Relay documentation <ArrowRight /></Link></Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
