import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { demoPath, docsEntry, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6">
      <Separator />
      <div className="flex flex-col gap-4 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>AgentNotify — the agent control plane · Kabani Tech Private Limited · MIT License</p>
        <nav className="flex flex-wrap gap-5" aria-label="Footer navigation">
          <Link href={docsEntry}>Docs</Link>
          <Link href="/insights/">Insights</Link>
          <Link href="/router/">Model router</Link>
          <Link href="/channels/">Channels</Link>
          <Link href="/relay/">Relay</Link>
          <Link href="/arc/">ARC</Link>
          <a href={demoPath} target="_blank" rel="noreferrer">Demo</a>
          <a href={site.repository}>Source</a>
        </nav>
      </div>
    </footer>
  );
}
