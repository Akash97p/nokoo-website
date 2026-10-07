"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { type Currency, formatPrice, type Plan, PLANS, PRICES } from "@/lib/plans";
import { site } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A best guess at the visitor's currency; the switch is always there to correct it. */
function guessCurrency(): Currency {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone === "Asia/Kolkata" || zone === "Asia/Calcutta") return "inr";
  } catch {}
  return "usd";
}

function CurrencySwitch({ value, onChange }: { value: Currency; onChange: (next: Currency) => void }) {
  return (
    <LayoutGroup id="currency">
      <fieldset aria-label="Currency" className="inline-flex rounded-full border bg-card p-1 text-xs">
        {(["usd", "inr"] as const).map((currency) => {
          const active = value === currency;
          return (
            <button
              key={currency}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(currency)}
              className={`relative rounded-full px-3.5 py-1.5 font-medium transition-colors ${
                active ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="currency-pill"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              <span className="relative">{currency === "usd" ? "USD $" : "INR ₹"}</span>
            </button>
          );
        })}
      </fieldset>
    </LayoutGroup>
  );
}

function PriceTag({ plan, currency }: { plan: Plan; currency: Currency }) {
  const price = PRICES[plan.id][currency];
  return (
    <div className="mt-6 flex items-end gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${plan.id}-${currency}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="text-4xl font-semibold tracking-tight"
        >
          {formatPrice(price.amount, currency)}
        </motion.span>
      </AnimatePresence>
      <span className="pb-1 text-sm text-muted-foreground">/month</span>
      {price.regular && (
        <span className="pb-1 text-sm text-muted-foreground line-through decoration-foreground/40">
          {formatPrice(price.regular, currency)}
        </span>
      )}
    </div>
  );
}

/**
 * The three plans with a currency switch. Choosing a plan hands off to the relay's own signup
 * page, which knows whether billing is live and takes payment there.
 */
export function PlanCards() {
  const [currency, setCurrency] = useState<Currency>("usd");
  // Guessed after hydration, so the static export and the first client render agree.
  useEffect(() => setCurrency(guessCurrency()), []);

  return (
    <>
      <div className="flex justify-center">
        <CurrencySwitch value={currency} onChange={setCurrency} />
      </div>
      <Stagger className="mt-14 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const featured = plan.id === "standard";
          return (
            <StaggerItem
              key={plan.id}
              className={`relative flex h-full flex-col rounded-2xl border p-6 ${
                featured ? "border-foreground/30 bg-card" : "bg-card/60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">{plan.name}</h3>
                {plan.badge && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      featured ? "bg-foreground text-background" : "border text-muted-foreground"
                    }`}
                  >
                    {featured && <Sparkles size={11} />}
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.summary}</p>
              <PriceTag plan={plan} currency={currency} />

              <Button asChild variant={featured ? "default" : "secondary"} className="mt-6 h-10 w-full">
                <a href={`${site.relayUrl}/signup?plan=${plan.id}&currency=${currency}`}>Choose {plan.name}</a>
              </Button>

              <ul className="mt-7 space-y-3 border-t pt-6 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-emerald-400" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {plan.soon.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-muted-foreground/60" />
                    <span className="text-muted-foreground/80">
                      {feature} <span className="ml-1 rounded border px-1 py-px font-mono text-[10px]">coming soon</span>
                    </span>
                  </li>
                ))}
                {plan.planned.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 translate-x-[5px] rounded-full bg-muted-foreground/60" />
                    <span className="pl-[7px] text-muted-foreground/80">
                      {feature} <span className="ml-1 rounded border px-1 py-px font-mono text-[10px]">planned</span>
                    </span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          );
        })}
      </Stagger>
    </>
  );
}
