import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Faq, type FaqItem } from "@/components/pricing/faq";
import { PlanCards } from "@/components/pricing/plan-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPARISON, PLANS } from "@/lib/plans";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Plans for Nokoo Relay: end-to-end encrypted delivery to your phone, and answers back to your agents.",
};

const faq: FaqItem[] = [
  {
    question: "Do I need a plan to use Nokoo?",
    answer:
      "No. Nokoo on your machine is free — desktop notifications, history, the model router, and its outbound channels work without an account. A plan adds the relay: encrypted delivery to your phone and answers back to your agents.",
  },
  {
    question: "What data does the relay keep?",
    answer:
      "Encrypted envelope ciphertext and delivery metadata. Notification plaintext and device private keys are never available to the relay. By default envelopes are kept for 72 hours, delivery attempts for 14 days, audit events for 30 days, and interaction answers for 7 days. The privacy policy has the full description.",
  },
  {
    question: "How does billing work?",
    answer:
      "Plans are monthly subscriptions, paid by card through Stripe or, in India, by card or UPI through Razorpay. Your plan starts the moment the payment provider confirms it. Cancel from the relay console at any time; you keep the plan until the end of the period you paid for. While billing is not enabled, choosing a plan records interest only and nothing is charged.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrading or downgrading from the console changes the same subscription, prorated by the payment provider, so you are never billed twice.",
  },
  {
    question: "What happens if a payment fails?",
    answer:
      "Nothing stops. Your paired senders keep delivering while the payment provider retries. If the subscription finally ends, the account moves to the Basic allowance — it never silences a sender that is already paired.",
  },
];

/** A tick, a dash that a screen reader still hears as absence, or the value itself. */
function CellValue({ value }: { value: string }) {
  if (value === "—")
    return (
      <>
        <Minus aria-hidden size={14} className="text-muted-foreground/50" />
        <span className="sr-only">Not included</span>
      </>
    );
  if (value === "Included")
    return (
      <>
        <Check aria-hidden size={16} className="text-emerald-400" />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === "Planned")
    return <span className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">planned</span>;
  return <span className="text-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <main className="overflow-x-clip">
      <section className="relative overflow-hidden border-b">
        <div className="grid-surface pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary">Nokoo Relay</Badge>
            <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
              Simple plans for the hosted relay.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              Pay for the machines and phones you pair. Every plan is end-to-end encrypted, and you can cancel any time.
            </p>
          </Reveal>

          <div className="mt-10">
            <PlanCards />
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
            Prices are per month; taxes may apply at checkout, which happens on the relay. Features marked planned are on
            the roadmap and not part of any plan yet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Compare plans</h2>
        </Reveal>
        <Reveal delay={0.05} className="mt-8 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">Feature comparison of Basic, Standard, and Pro</caption>
            <thead>
              <tr className="border-b text-left">
                <th scope="col" className="w-2/5 px-5 py-4 font-medium text-muted-foreground">Feature</th>
                {PLANS.map((plan) => (
                  <th key={plan.id} scope="col" className="px-5 py-4 font-semibold">
                    {plan.name}
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{plan.price}/mo</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.key} className="border-b last:border-b-0 hover:bg-foreground/[0.02]">
                  <th scope="row" className="px-5 py-3.5 text-left font-normal text-muted-foreground">{row.label}</th>
                  <td className="px-5 py-3.5"><CellValue value={row.basic} /></td>
                  <td className="px-5 py-3.5"><CellValue value={row.standard} /></td>
                  <td className="px-5 py-3.5"><CellValue value={row.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Pricing questions</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Something else? Write to{" "}
            <a href={`mailto:${site.contact}`} className="text-foreground underline underline-offset-4">{site.contact}</a>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><a href={`${site.relayUrl}/signup`}>Create an account <ArrowRight /></a></Button>
            <Button asChild variant="outline"><Link href="/relay/">How the relay works</Link></Button>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <Faq items={faq} />
        </Reveal>
      </section>
    </main>
  );
}
