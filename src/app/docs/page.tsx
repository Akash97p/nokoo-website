import type { Metadata } from "next";
import Link from "next/link";

import { basePath, docsEntry, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Documentation",
  robots: { index: false },
};

/**
 * /docs/ has no page of its own: documentation starts at installing with an agent. This is a static
 * export on GitHub Pages, where there is no server to answer with a redirect, so the page redirects
 * itself — a meta refresh that works without JavaScript — and links there in case it does not.
 */
export default function DocsIndex() {
  const target = `${basePath}${docsEntry}`;
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-start justify-center px-4 sm:px-6">
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <link rel="canonical" href={`${site.url}${docsEntry}`} />
      <p className="text-muted-foreground">
        Taking you to the documentation… <Link href={docsEntry} className="text-foreground underline underline-offset-4">Continue</Link>
      </p>
    </main>
  );
}
