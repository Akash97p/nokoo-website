"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Cloud, Laptop, Lock, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * What the relay holds, at each hop. The sealed payload is the whole point, so the envelope's label
 * changes as it travels: readable on your machine, opaque in the middle, readable again on a device
 * that holds the key.
 */
const hops = [
  { id: "seal", stage: 0, label: "Sealed on your computer", detail: "The payload is sealed per recipient device before anything leaves the machine." },
  { id: "relay", stage: 1, label: "Stored as bytes it cannot read", detail: "The relay sees routing metadata — installation, device, key id, size, delivery state — and ciphertext." },
  { id: "wake", stage: 1, label: "Push carries an envelope id", detail: "The wake-up notification contains an id and nothing else, so the push provider never receives content." },
  { id: "open", stage: 2, label: "Opened on your phone", detail: "The device that holds the key decrypts it. Your local history stays authoritative either way." },
] as const;

const columns = [
  { id: "you", icon: Laptop, title: "Your computers" },
  { id: "relay", icon: Cloud, title: "Nokoo Relay" },
  { id: "phone", icon: Smartphone, title: "Your phone" },
];

export function RelayPath() {
  const still = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (still) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % hops.length), 2700);
    return () => clearInterval(timer);
  }, [still]);

  const hop = hops[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-2xl shadow-black sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.36_0.07_150/0.3),transparent_70%)]" />

      <div className="relative grid grid-cols-3 gap-2 sm:gap-4">
        {columns.map((column, position) => (
          <motion.div
            key={column.id}
            className={cn(
              "grid content-center justify-items-center gap-2 rounded-xl border bg-background/80 px-2 py-4 text-center transition-colors",
              hop.stage === position ? "border-emerald-400/50" : "border-border",
            )}
            animate={{ opacity: hop.stage === position ? 1 : 0.6 }}
            transition={{ duration: 0.3 }}
          >
            <column.icon className={cn("size-5", hop.stage === position ? "text-emerald-300" : "text-muted-foreground")} />
            <span className="text-xs leading-4 sm:text-sm">{column.title}</span>
          </motion.div>
        ))}
      </div>

      {/* The envelope sits under whichever column currently holds it. */}
      <div className="relative mt-4 grid grid-cols-3 gap-2 sm:gap-4">
        {[0, 1, 2].map((position) => (
          <div key={position} className="min-h-14">
            {hop.stage === position ? (
              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/[0.06] px-2 py-3">
                <Lock className="size-3.5 shrink-0 text-emerald-300" />
                <span className="font-mono text-[10px] leading-3 text-emerald-200 sm:text-xs">
                  {position === 1 ? "0x8f3a…" : "envelope"}
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="relative mt-4 min-h-24">
        {/* Rendered directly: the step text must be readable whether or not a frame has run. */}
        <div className="rounded-xl border bg-background/80 p-4">
          <p className="text-sm font-medium">{hop.label}</p>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{hop.detail}</p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {hops.map((item, position) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(position)}
            aria-current={position === index ? "step" : undefined}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
              position === index ? "border-emerald-400/60 bg-emerald-400/10 text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.id}
          </button>
        ))}
      </div>
    </div>
  );
}
