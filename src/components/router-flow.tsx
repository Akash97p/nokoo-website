"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Bot, CircleSlash, Route, Server, Terminal, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * One request's journey, replayed. Each step lights the part of the router that is working, so the
 * page shows resolution and failover happening instead of describing them in a caption.
 */
const steps = [
  {
    id: "admit",
    label: "Admit",
    caption: "The agent asks for “fast” on the Responses wire. The router checks its own key.",
    active: "client",
  },
  {
    id: "resolve",
    label: "Resolve",
    caption: "“fast” is a fallback chain. Three targets, in the order you set.",
    active: "router",
  },
  {
    id: "failover",
    label: "Fail over",
    caption: "The first target is rate limited. Nothing has been sent to the agent yet, so the next one takes it.",
    active: "targets",
  },
  {
    id: "record",
    label: "Record",
    caption: "One ledger row: provider, model, both attempts, token counts. No prompt, no key.",
    active: "ledger",
  },
] as const;

const targets = [
  { slug: "opencode-go/kimi-k3", state: "cooling", note: "429 · rate limited" },
  { slug: "deepseek/deepseek-chat", state: "served", note: "200 · 1.4 s" },
  { slug: "codex-plan/gpt-5.1-codex-mini", state: "standby", note: "not needed" },
] as const;

function useStep(count: number, still: boolean | null) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (still) return;
    const timer = setInterval(() => setStep((current) => (current + 1) % count), 2600);
    return () => clearInterval(timer);
  }, [count, still]);
  return [step, setStep] as const;
}

function Panel({ title, live, children, className }: { title: string; live: boolean; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn(
        "relative grid content-start gap-2 rounded-xl border bg-background/70 p-4 transition-colors",
        live ? "border-sky-400/50 bg-sky-400/[0.04]" : "border-border",
        className,
      )}
      animate={live ? { scale: 1 } : { scale: 0.995 }}
      transition={{ duration: 0.4 }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      {children}
    </motion.div>
  );
}

export function RouterFlow() {
  const still = useReducedMotion();
  const [step, setStep] = useStep(steps.length, still);
  const current = steps[step];
  const reached = (id: (typeof steps)[number]["active"]) => steps.findIndex((s) => s.active === id) <= step;

  return (
    <figure className="min-w-0">
      <div className="relative overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-2xl shadow-black sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.42_0.1_240/0.25),transparent_70%)]" />

        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.05fr)]">
          <Panel title="Your agent" live={current.active === "client"}>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
              <Terminal className="size-3.5 text-muted-foreground" />
              <span>Codex</span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              POST /router/v1/responses
              <br />
              model: <span className="text-sky-300">&quot;fast&quot;</span>
            </p>
          </Panel>

          <Panel title="AgentNotify router" live={current.active === "router"}>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
              <Route className="size-3.5 text-sky-300" />
              <span>combo/fast</span>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Resolves the selector, translates the wire only when the upstream speaks a different one.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["responses", "chat", "messages"].map((wire) => (
                <span key={wire} className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{wire}</span>
              ))}
            </div>
          </Panel>

          <Panel title="Targets, in order" live={current.active === "targets" || current.active === "ledger"}>
            {targets.map((target, index) => {
              const shown = current.active === "targets" || current.active === "ledger";
              const cooling = shown && target.state === "cooling";
              const served = shown && target.state === "served";
              return (
                <motion.div
                  key={target.slug}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border bg-card px-3 py-2",
                    cooling && "border-amber-400/40",
                    served && "border-emerald-400/50",
                  )}
                  animate={{ opacity: shown ? 1 : 0.45, x: 0 }}
                  transition={{ delay: shown ? index * 0.18 : 0, duration: 0.35 }}
                >
                  {cooling ? <CircleSlash className="size-3.5 shrink-0 text-amber-300" />
                    : served ? <Zap className="size-3.5 shrink-0 text-emerald-300" />
                      : <Server className="size-3.5 shrink-0 text-muted-foreground" />}
                  <span className="truncate font-mono text-xs">{target.slug}</span>
                  <span className={cn("ml-auto shrink-0 text-[11px]", cooling ? "text-amber-300" : served ? "text-emerald-300" : "text-muted-foreground")}>
                    {shown ? target.note : "waiting"}
                  </span>
                </motion.div>
              );
            })}
          </Panel>
        </div>

        {/* The ledger row is the last step, and the one people do not expect a proxy to give them. */}
        <motion.div
          className={cn("relative mt-4 rounded-xl border bg-background/70 p-4", current.active === "ledger" ? "border-violet-400/50" : "border-border")}
          animate={{ opacity: reached("ledger") ? 1 : 0.5 }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ledger row</p>
          <p className="mt-2 overflow-x-auto font-mono text-xs text-muted-foreground">
            <span className="text-foreground">combo/fast</span> → deepseek/deepseek-chat · 2 attempts · 200 · in 4,180 · out 612 · <span className="text-violet-300">no prompt stored</span>
          </p>
        </motion.div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          {steps.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(index)}
              aria-current={index === step ? "step" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                index === step ? "border-sky-400/60 bg-sky-400/10 text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Rendered directly rather than faded in: a caption that needs an animation frame before
            it is legible can stay blank, which is worse than no transition at all. */}
        <div className="relative mt-3 min-h-10">
          <p className="text-sm leading-6 text-muted-foreground">{current.caption}</p>
        </div>
      </div>
      <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
        One request through the router: admit, resolve, fail over, record. Provider names and numbers are illustrative.
      </figcaption>
    </figure>
  );
}

/** The router's three inbound wires, each drawn as a lane that carries a request in. */
export function WireLanes() {
  const wires = [
    { id: "responses", label: "OpenAI Responses", dot: "bg-sky-300" },
    { id: "chat", label: "OpenAI Chat Completions", dot: "bg-violet-300" },
    { id: "messages", label: "Anthropic Messages", dot: "bg-amber-300" },
  ];
  return (
    <div className="grid gap-3">
      {wires.map((wire, index) => (
        <div key={wire.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="relative h-px w-full bg-border">
            <motion.span
              className={cn("absolute -top-[3px] size-[7px] rounded-full shadow-[0_0_10px_currentColor]", wire.dot)}
              initial={{ left: "0%", opacity: 0 }}
              animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2, delay: index * 0.5, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
            />
          </div>
          <span className="flex items-center gap-2 whitespace-nowrap font-mono text-xs text-muted-foreground">
            <Bot className="size-3.5" />
            {wire.label}
          </span>
        </div>
      ))}
    </div>
  );
}
