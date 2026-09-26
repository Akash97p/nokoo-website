"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

export type FaqItem = { question: string; answer: ReactNode };

const EASE = [0.22, 1, 0.36, 1] as const;

function FaqRow({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <div className="border-b last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] font-medium transition-colors hover:text-foreground/80"
        >
          {item.question}
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="shrink-0 text-muted-foreground"
          >
            <Plus size={18} />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="text-pretty pb-5 pr-10 text-sm leading-relaxed text-muted-foreground">{item.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** An accordion that opens one answer at a time, the first one open. */
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="rounded-2xl border bg-card px-6">
      {items.map((item, index) => (
        <FaqRow
          key={item.question}
          item={item}
          open={open === index}
          onToggle={() => setOpen(open === index ? null : index)}
        />
      ))}
    </div>
  );
}
