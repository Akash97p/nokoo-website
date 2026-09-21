"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Account = {
  mark: string;
  markClass: string;
  agent: string;
  label: string;
  fiveHour: number;
  windows: { label: string; remaining: number; resets: string }[];
};

// Illustrative values, not anyone's real balances.
const accounts: Account[] = [
  { mark: "CC", markClass: "bg-orange-400/90 text-black", agent: "Claude Code", label: "work", fiveHour: 72,
    windows: [{ label: "5-hour", remaining: 72, resets: "2h 14m" }, { label: "7-day", remaining: 41, resets: "3d 6h" }, { label: "7-day Opus", remaining: 58, resets: "3d 6h" }] },
  { mark: "CC", markClass: "bg-orange-400/90 text-black", agent: "Claude Code", label: "personal", fiveHour: 18,
    windows: [{ label: "5-hour", remaining: 18, resets: "47m" }, { label: "7-day", remaining: 63, resets: "5d 1h" }] },
  { mark: "Cx", markClass: "bg-white text-black", agent: "Codex", label: "team", fiveHour: 91,
    windows: [{ label: "5-hour", remaining: 91, resets: "4h 02m" }, { label: "Weekly", remaining: 77, resets: "6d" }] },
];

const tone = (value: number) => (value < 20 ? "bg-red-400" : value < 40 ? "bg-amber-300" : "bg-emerald-400");
const text = (value: number) => (value < 20 ? "text-red-300" : value < 40 ? "text-amber-200" : "text-foreground");

/** A mock of the native macOS status items: one per selected account, each opening its windows. */
export function MenubarDemo() {
  const still = useReducedMotion();
  const [open, setOpen] = useState(0);

  useEffect(() => {
    if (still) return;
    const timer = setInterval(() => setOpen((current) => (current + 1) % accounts.length), 3600);
    return () => clearInterval(timer);
  }, [still]);

  const account = accounts[open];
  // The headline is the tightest five-hour balance, whichever account it belongs to.
  const lowest = accounts.reduce((min, item) => (item.fiveHour < min.fiveHour ? item : min));

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,oklch(0.32_0.08_280),oklch(0.2_0.06_220)_55%,oklch(0.16_0.03_180))] shadow-2xl shadow-black">
      <div className="flex h-8 items-center gap-4 border-b border-white/10 bg-black/35 px-4 text-[12px] text-white/80 backdrop-blur-xl">
        <span className="font-semibold text-white">Terminal</span>
        <span className="hidden sm:inline">Shell</span>
        <span className="hidden sm:inline">Edit</span>
        <span className="hidden sm:inline">View</span>
        <div className="ml-auto flex items-center gap-1">
          {accounts.map((item, index) => (
            <button
              key={`${item.agent}-${item.label}`}
              type="button"
              onClick={() => setOpen(index)}
              aria-label={`${item.agent} ${item.label}: ${item.fiveHour}% of five-hour allowance left`}
              className={cn("flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors", index === open ? "bg-white/20" : "hover:bg-white/10")}
            >
              <span className={cn("grid size-4 place-items-center rounded-[4px] text-[7px] font-bold", item.markClass)}>{item.mark}</span>
              <span className={cn("font-medium tabular-nums", text(item.fiveHour))}>{item.fiveHour}%</span>
            </button>
          ))}
          <span className="ml-2 hidden tabular-nums sm:inline">Sat 9:41</span>
        </div>
      </div>

      <div className="relative h-[330px]">
        {/* The native menu, as it is built: the headline balance, every monitored account with its
            windows in a submenu, then when it was checked and what you can do. */}
        <div className="absolute right-4 top-2 w-[min(262px,calc(100%-2rem))] rounded-xl border border-white/10 bg-zinc-900/85 p-1.5 text-[13px] text-white shadow-2xl backdrop-blur-2xl">
          <p className="px-2.5 pb-1 pt-1.5 text-xs font-semibold text-white/55">AgentNotify quota</p>
          <p className="px-2.5 pb-2 text-xs text-white/55">Five-hour balance: {lowest.fiveHour}% · {lowest.label}</p>
          <div className="border-t border-white/10 py-1">
            {accounts.map((item, index) => (
              <button
                key={`${item.agent}-${item.label}`}
                type="button"
                onClick={() => setOpen(index)}
                className={cn("flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors", index === open ? "bg-sky-500/80" : "hover:bg-white/10")}
              >
                <span className={cn("grid size-4 flex-none place-items-center rounded-[4px] text-[7px] font-bold", item.markClass)}>{item.mark}</span>
                <span className="min-w-0 flex-1 truncate">{item.agent} · {item.label}</span>
                <span className="tabular-nums text-white/70">{item.fiveHour}%</span>
                <span className="text-white/50">›</span>
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 px-2.5 pt-1.5 text-xs leading-6 text-white/45">
            <p>Checked 1 min ago</p>
            <p className="text-white/80">Refresh now <span className="float-right text-white/40">⌘R</span></p>
            <p className="text-white/80">Open Live Quota…</p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          <motion.div
            key={open}
            className="absolute right-[calc(min(262px,100%-2rem)+1.25rem)] top-[4.6rem] hidden w-[230px] rounded-xl border border-white/10 bg-zinc-900/85 p-3 text-white shadow-2xl backdrop-blur-2xl sm:block"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <p className="mb-2.5 truncate text-xs text-white/55">{account.agent} · {account.label}</p>
            <div className="grid gap-3">
              {account.windows.map((window, index) => (
                <div key={window.label}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-white/80">{window.label}</span>
                    <span className={cn("tabular-nums", text(window.remaining))}>{window.remaining}% left</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={cn("h-full rounded-full", tone(window.remaining))}
                      initial={{ width: 0 }}
                      animate={{ width: `${window.remaining}%` }}
                      transition={{ duration: 0.7, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-white/40">Resets in {window.resets}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
