import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { demoPath, docsEntry } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6">
      <Separator />
      <div className="flex flex-col gap-4 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>nokoo.ai is developed by <a href="https://kabanitech.com" className="underline underline-offset-4 hover:text-foreground">Kabani Tech Private Limited</a> · © 2026</p>
        <nav className="flex flex-wrap gap-5" aria-label="Footer navigation">
          <Link href={docsEntry}>Docs</Link>
          <Link href="/insights/">Insights</Link>
          <Link href="/router/">Model router</Link>
          <Link href="/channels/">Channels</Link>
          <Link href="/relay/">Relay</Link>
          <Link href="/pricing/">Pricing</Link>
          <Link href="/arc/">ARC</Link>
          <Link href="/download/">Download</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/eula/">EULA</Link>
          <a href={demoPath} target="_blank" rel="noreferrer">Demo</a>
        </nav>
      </div>
    </footer>
  );
}
