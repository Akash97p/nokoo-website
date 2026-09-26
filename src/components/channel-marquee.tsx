"use client";

import { motion, useReducedMotion } from "motion/react";

const channels = [
  "Nokoo Relay", "Webhook", "SMTP", "Telegram", "Discord", "Slack", "Teams", "Zoho Cliq", "Google Chat",
  "Mattermost", "Matrix", "ntfy", "Gotify", "Pushover", "Pushbullet", "Twilio SMS", "WhatsApp Cloud",
  "Twilio WhatsApp", "MQTT",
];

function Row() {
  return (
    <div className="flex shrink-0 gap-2 pr-2">
      {channels.map((channel) => (
        <span key={channel} className="whitespace-nowrap rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">{channel}</span>
      ))}
    </div>
  );
}

/**
 * All nineteen channels drifting past. With reduced motion it is a plain wrapped list, so nothing is
 * hidden behind the animation.
 */
export function ChannelMarquee() {
  const still = useReducedMotion();
  if (still) {
    return (
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 sm:px-6">
        {channels.map((channel) => <span key={channel} className="rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">{channel}</span>)}
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" aria-label={`Channels: ${channels.join(", ")}`} role="img">
      <motion.div className="flex w-max" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, ease: "linear", repeat: Infinity }}>
        <Row />
        <Row />
      </motion.div>
    </div>
  );
}
