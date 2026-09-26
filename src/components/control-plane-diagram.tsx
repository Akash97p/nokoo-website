"use client";

import { motion } from "motion/react";
import { BellRing, Coins, Gauge, Laptop, Route, Server, Smartphone, Terminal } from "lucide-react";

import { cn } from "@/lib/utils";

const agents = ["Claude Code", "Codex", "OpenCode", "Gemini CLI", "Kilo"];
const providers = ["Anthropic", "OpenAI", "DeepSeek", "OpenRouter"];

export const pillars = [
  { id: "notify", label: "Notify", detail: "ask · answer · unresolved", icon: BellRing, tone: "text-amber-300", dot: "bg-amber-300", ring: "ring-amber-300/30" },
  { id: "route", label: "Route", detail: "providers · failover", icon: Route, tone: "text-sky-300", dot: "bg-sky-300", ring: "ring-sky-300/30" },
  { id: "measure", label: "Measure", detail: "tokens · cost · projects", icon: Coins, tone: "text-violet-300", dot: "bg-violet-300", ring: "ring-violet-300/30" },
  { id: "quota", label: "Quota", detail: "live balances · menu bar", icon: Gauge, tone: "text-emerald-300", dot: "bg-emerald-300", ring: "ring-emerald-300/30" },
] as const;

/**
 * A lane between two columns with packets travelling along it. `back` sends one the other way too:
 * the lane to you carries a question out and your answer back to the agent that asked.
 */
function Lane({ dot, delay = 0, back = false }: { dot: string; delay?: number; back?: boolean }) {
  return (
    <div className="relative h-px w-full bg-gradient-to-r from-border via-border to-border">
      <motion.span
        className={cn("absolute -top-[3px] size-[7px] rounded-full shadow-[0_0_12px_currentColor]", dot)}
        initial={{ left: "0%", opacity: 0 }}
        animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.2, delay, repeat: Infinity, repeatDelay: 1.1, ease: "easeInOut" }}
      />
      {back ? (
        <motion.span
          className="absolute -top-[3px] size-[7px] rounded-full bg-white shadow-[0_0_12px_white]"
          initial={{ left: "100%", opacity: 0 }}
          animate={{ left: ["100%", "0%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, delay: delay + 1.6, repeat: Infinity, repeatDelay: 1.1, ease: "easeInOut" }}
        />
      ) : null}
    </div>
  );
}

function Chip({ children, icon: Icon, className }: { children: React.ReactNode; icon: typeof Terminal; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border bg-background/80 px-3 py-2 text-sm backdrop-blur", className)}>
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function Column({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid content-center gap-2", className)}>
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

export function ControlPlaneDiagram() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-2xl shadow-black sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.3_0.05_260/0.35),transparent_65%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_72px_minmax(0,1.3fr)_72px_minmax(0,0.9fr)] lg:items-center lg:gap-0">
        <Column title="Your agents">
          {agents.map((agent, index) => (
            <motion.div key={agent} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + index * 0.07 }}>
              <Chip icon={Terminal}>{agent}</Chip>
            </motion.div>
          ))}
        </Column>

        <div className="hidden h-full flex-col justify-around py-6 lg:flex">
          {pillars.map((pillar, index) => <Lane key={pillar.id} dot={pillar.dot} delay={index * 0.45} />)}
        </div>

        <motion.div
          className="relative rounded-xl border bg-background/90 p-4 ring-1 ring-white/5 sm:p-5"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold tracking-tight">Nokoo</p>
              <p className="text-xs text-muted-foreground">local control plane · 127.0.0.1</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">
              <motion.span className="size-1.5 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              running
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.id}
                className={cn("rounded-lg border bg-card p-3 ring-1", pillar.ring)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <pillar.icon className={cn("size-4", pillar.tone)} />
                  <span className="text-sm font-medium">{pillar.label}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{pillar.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="hidden h-full flex-col justify-around py-6 lg:flex">
          <Lane dot="bg-sky-300" delay={0.3} />
          <Lane dot="bg-sky-300" delay={1.2} />
          <Lane dot="bg-amber-300" delay={0.8} back />
        </div>

        <div className="grid content-center gap-6">
          <Column title="Model providers">
            {providers.map((provider) => <Chip key={provider} icon={Server}>{provider}</Chip>)}
          </Column>
          <Column title="You">
            <div className="grid grid-cols-2 gap-2">
              <Chip icon={Laptop} className="border-amber-300/30">Desktop</Chip>
              <Chip icon={Smartphone} className="border-amber-300/30">Phone</Chip>
            </div>
          </Column>
        </div>
      </div>
    </div>
  );
}
