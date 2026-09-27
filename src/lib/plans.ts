/**
 * The three hosted relay plans.
 *
 * One source for the pricing cards and the comparison table, so a price cannot drift between them.
 * Display prices match the relay's own table; the relay's checkout is what actually charges.
 */

export type Currency = "usd" | "inr";

/** Monthly display prices, in minor units, with the struck-through regular price when introductory. */
export const PRICES: Record<PlanId, Record<Currency, { amount: number; regular: number | null }>> = {
  basic: { usd: { amount: 99, regular: null }, inr: { amount: 7900, regular: null } },
  standard: { usd: { amount: 299, regular: null }, inr: { amount: 24900, regular: null } },
  pro: { usd: { amount: 299, regular: 599 }, inr: { amount: 24900, regular: 49900 } },
};

export function formatPrice(minor: number, currency: Currency): string {
  const code = currency.toUpperCase();
  const whole = minor % 100 === 0;
  return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: whole && code === "INR" ? 0 : 2,
    maximumFractionDigits: whole && code === "INR" ? 0 : 2,
  }).format(minor / 100);
}

export type PlanId = "basic" | "standard" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  /** The struck-through regular price, when the current price is introductory. */
  regularPrice?: string;
  badge?: string;
  summary: string;
  features: string[];
  /**
   * Entitlements on the pricing card that the preview does not implement yet.
   * Kept separate so the page never sells a roadmap item as a shipped one.
   */
  planned: string[];
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$0.99",
    summary: "One computer, one phone, encrypted delivery.",
    features: [
      "Notifications from your agents",
      "End-to-end encrypted delivery",
      "1 sender (computer)",
      "1 mobile device",
      "7-day delivery history",
    ],
    planned: [],
  },
  {
    id: "standard",
    name: "Standard",
    price: "$2.99",
    badge: "Most popular",
    summary: "Answer agents and use more than one machine.",
    features: [
      "Everything in Basic",
      "Answer agents from your phone (interactive responses)",
      "Up to 3 mobile devices",
      "Up to 5 senders",
      "5 GB of file storage for agents — builds and assets to your phone",
      "30-day delivery history",
    ],
    planned: [
      "Agent-to-agent relay across machines",
      "Priority delivery queue",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$2.99",
    regularPrice: "$5.99",
    badge: "Founding offer",
    summary: "For teams and larger deployments.",
    features: [
      "Everything in Standard",
      "Unlimited mobile devices",
      "Unlimited senders",
      "50 GB of file storage for agents",
      "Priority support",
    ],
    planned: ["Custom retention", "Team seats", "Dedicated relay option"],
  },
];

export interface ComparisonRow {
  key: string;
  label: string;
  basic: string;
  standard: string;
  pro: string;
}

/** The same facts as the cards, arranged to be scanned down a column. */
export const COMPARISON: ComparisonRow[] = [
  { key: "senders", label: "Senders (computers)", basic: "1", standard: "5", pro: "Unlimited" },
  { key: "devices", label: "Mobile devices", basic: "1", standard: "3", pro: "Unlimited" },
  {
    key: "encrypted",
    label: "End-to-end encrypted delivery",
    basic: "Included",
    standard: "Included",
    pro: "Included",
  },
  {
    key: "answers",
    label: "Answer agents from your phone",
    basic: "—",
    standard: "Included",
    pro: "Included",
  },
  {
    key: "storage",
    label: "File storage for agents",
    basic: "—",
    standard: "5 GB",
    pro: "50 GB",
  },
  {
    key: "a2a",
    label: "Agent-to-agent relay",
    basic: "—",
    standard: "Planned",
    pro: "Planned",
  },
  {
    key: "history",
    label: "Delivery history",
    basic: "7 days",
    standard: "30 days",
    pro: "Planned",
  },
  {
    key: "queue",
    label: "Priority delivery queue",
    basic: "—",
    standard: "Planned",
    pro: "Planned",
  },
  { key: "seats", label: "Team seats", basic: "—", standard: "—", pro: "Planned" },
  { key: "support", label: "Priority support", basic: "—", standard: "—", pro: "Included" },
  {
    key: "dedicated",
    label: "Dedicated relay option",
    basic: "—",
    standard: "—",
    pro: "Planned",
  },
];
