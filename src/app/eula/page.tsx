import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

import { basePath } from "@/lib/site";

export const metadata: Metadata = {
  title: "End User Licence Agreement",
  description: "The licence under which Kabani Tech Private Limited provides the Nokoo desktop applications.",
};

type Block = { kind: "heading" | "caps" | "item" | "text"; text: string };

/**
 * `content/EULA.txt` is the desktop repository's `EULA.txt`, byte for byte (scripts/sync-content.sh),
 * so the page and the installer can never disagree. Its plain-text layout is read back into
 * headings, list items, and paragraphs here rather than kept as a second, hand-edited copy.
 */
function parse(text: string): { title: string; version: string; blocks: Block[] } {
  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const [title = "", version = "", ...rest] = paragraphs;
  const blocks: Block[] = [];
  for (const paragraph of rest) {
    if (/^\d+\.\s+[A-Z][A-Z ,'-]+$/.test(paragraph)) {
      blocks.push({ kind: "heading", text: paragraph.replace(/^(\d+)\.\s+/, "$1. ") });
      continue;
    }
    // A paragraph is a list when its lines start with "(a)", "- ", or "1.1".
    let current: string[] = [];
    let kind: Block["kind"] = "text";
    const flush = () => {
      if (current.length) blocks.push({ kind, text: current.join(" ") });
      current = [];
    };
    for (const raw of paragraph.split("\n")) {
      const line = raw.trim();
      const starts = /^(\([a-z]\)|-|\d+\.\d+)\s/.test(line);
      if (starts) {
        flush();
        kind = "item";
      }
      current.push(line);
    }
    if (kind === "text" && current.join(" ") === current.join(" ").toUpperCase() && /[A-Z]{6}/.test(current.join(" "))) kind = "caps";
    flush();
  }
  return { title, version, blocks };
}

export default function EulaPage() {
  const source = fs.readFileSync(path.join(process.cwd(), "content", "EULA.txt"), "utf8");
  const { title, version, blocks } = parse(source);
  return (
    <main className="overflow-x-clip">
      <article className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          {title.replace(/^NOKOO END USER LICENCE AGREEMENT$/, "Nokoo End User Licence Agreement")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{version}</p>
        <div className="mt-10 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {blocks.map((block, index) => {
            const key = `${index}-${block.kind}`;
            if (block.kind === "heading")
              return (
                <h2 key={key} className="pt-5 text-lg font-semibold tracking-tight text-foreground">
                  {block.text.replace(/^(\d+\. )(.*)$/, (_, n: string, words: string) => n + words.charAt(0) + words.slice(1).toLowerCase())}
                </h2>
              );
            if (block.kind === "item")
              return (
                <p key={key} className="pl-6 -indent-6">
                  {block.text}
                </p>
              );
            return (
              <p key={key} className={block.kind === "caps" ? "text-xs leading-relaxed" : undefined}>
                {block.text}
              </p>
            );
          })}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          The same text ships with every installer as <span className="font-mono text-foreground">EULA.txt</span>.{" "}
          <a href={`${basePath}/eula.txt`} className="underline underline-offset-4 hover:text-foreground">Plain-text copy</a>.
        </p>
      </article>
    </main>
  );
}
