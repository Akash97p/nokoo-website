"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The four ARC event types, replayed as one condition's life. The point the diagram has to make is
 * that `response.submitted` travels back the other way — a contract with a return path, not a feed.
 */
const events = [
  {
    type: "request.created",
    from: "agent",
    body: "Run the staging migration? · kind: permission · awaiting: allow | deny",
    tone: "text-amber-300",
    ring: "ring-amber-300/40",
  },
  {
    type: "request.updated",
    from: "agent",
    body: "Same key, new detail: 18,400 rows would be backfilled.",
    tone: "text-amber-300",
    ring: "ring-amber-300/40",
  },
  {
    type: "response.submitted",
    from: "human",
    body: "allow · answered on the phone · digest verified · first answer wins",
    tone: "text-emerald-300",
    ring: "ring-emerald-300/40",
  },
  {
    type: "request.resolved",
    from: "agent",
    body: "outcome: answered · the condition is closed and stops being unresolved.",
    tone: "text-sky-300",
    ring: "ring-sky-300/40",
  },
] as const;

export function ArcLifecycle() {
  const still = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (still) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % events.length), 2800);
    return () => clearInterval(timer);
  }, [still]);

  const event = events[index];
  const fromHuman = event.from === "human";

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-2xl shadow-black sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.35_0.06_85/0.3),transparent_70%)]" />

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className={cn("rounded-lg border bg-background/80 px-3 py-2 text-center text-sm transition-colors", !fromHuman && "border-amber-300/50")}>
          Agent
        </div>
        <div className="relative h-px w-16 bg-border sm:w-24">
          <motion.span
            key={`${index}-packet`}
            className={cn("absolute -top-[3px] size-[7px] rounded-full shadow-[0_0_12px_currentColor]", fromHuman ? "bg-emerald-300" : "bg-amber-300")}
            initial={{ left: fromHuman ? "100%" : "0%", opacity: 0 }}
            animate={{ left: fromHuman ? "0%" : "100%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        </div>
        <div className={cn("rounded-lg border bg-background/80 px-3 py-2 text-center text-sm transition-colors", fromHuman && "border-emerald-300/50")}>
          You
        </div>
      </div>

      <div className="relative mt-5 min-h-28">
        {/* Plain, not animated in: text that only becomes readable once an animation frame runs
            is text that can stay invisible. The moving packet above carries the motion. */}
        <div className={cn("rounded-xl border bg-background/80 p-4 ring-1 transition-colors duration-300", event.ring)}>
          <p className={cn("font-mono text-sm transition-colors duration-300", event.tone)}>{event.type}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.body}</p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {events.map((item, position) => (
          <button
            key={item.type}
            type="button"
            onClick={() => setIndex(position)}
            aria-current={position === index ? "step" : undefined}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors",
              position === index ? "border-foreground/30 bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.type.split(".")[1]}
          </button>
        ))}
      </div>
    </div>
  );
}
