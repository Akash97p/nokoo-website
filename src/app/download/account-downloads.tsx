"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Apple, Download, Loader2, LogOut, Monitor, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

/**
 * Sign-up, sign-in and downloads, entirely on this site.
 *
 * The account lives on the relay — the same one that signs in to the Relay console — but this page
 * never sends the visitor there. It uses the relay's bearer sign-in (`/v1/auth/token`), the shape the
 * phone uses: no cookies cross from the relay, so CSRF does not apply, and signing out here revokes
 * the session on the relay. The relay must list this site in `RELAY_CORS_ORIGINS`.
 */

const API = site.relayUrl.replace(/\/+$/, "");
const TOKEN_KEY = "nokoo.download.session";

type Release = {
  release_id: string;
  version: string;
  platform: "windows" | "macos" | "linux";
  arch: string;
  file_name: string;
  size_bytes: number;
  sha256: string;
  notes: string | null;
  uploaded_at: string | null;
};

type Session = { token: string; email: string };

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (init.token) headers.authorization = `Bearer ${init.token}`;
  let res: Response;
  try {
    // "omit": a relay cookie must never ride along, and none is ever stored from here.
    res = await fetch(`${API}${path}`, { ...init, headers, credentials: "omit" });
  } catch {
    throw new ApiError(0, "Could not reach the Nokoo account service. Check your connection and try again.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error?.message ?? `Request failed (${res.status})`);
  return body as T;
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private windows can refuse storage; the session then lasts as long as the page.
  }
}

const PLATFORM = {
  windows: { label: "Windows", icon: Monitor },
  macos: { label: "macOS", icon: Apple },
  linux: { label: "Linux", icon: Terminal },
} as const;

const ARCH: Record<string, string> = { x64: "Intel / AMD (x64)", arm64: "ARM (arm64)", universal: "Universal" };

function detectTarget(): { platform: Release["platform"] | null; arch: string | null } {
  if (typeof navigator === "undefined") return { platform: null, arch: null };
  const ua = navigator.userAgent;
  const platform = /Windows/i.test(ua) ? "windows" : /Mac OS X|Macintosh/i.test(ua) ? "macos" : /Linux|X11/i.test(ua) ? "linux" : null;
  // Browsers on Apple silicon still report "Intel" in the user agent, so a Mac gets no arch preference.
  const arch = platform !== "macos" && /aarch64|arm64/i.test(ua) ? "arm64" : platform === "macos" ? null : "x64";
  return { platform, arch };
}

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function AccountDownloads() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setReady(true);
  }, []);

  const signedIn = useCallback((next: Session | null) => {
    saveSession(next);
    setSession(next);
  }, []);
  const signOut = useCallback(() => signedIn(null), [signedIn]);

  if (!ready)
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  return session ? <Downloads session={session} onSignOut={signOut} /> : <AuthForm onSignedIn={signedIn} />;
}

function AuthForm({ onSignedIn }: { onSignedIn: (session: Session) => void }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const address = email.trim();
      if (mode === "signup") {
        // A download account has no plan to choose; Relay is added later from the Relay console.
        await call("/v1/auth/signup", { method: "POST", body: JSON.stringify({ email: address, password, plan: "basic" }) });
      }
      const result = await call<{ token: string; user: { email: string } }>("/v1/auth/token", {
        method: "POST",
        body: JSON.stringify({ email: address, password }),
      });
      onSignedIn({ token: result.token, email: result.user.email });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
      <div className="grid grid-cols-2 rounded-md border p-1 text-sm">
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`rounded px-3 py-1.5 transition-colors ${mode === m ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Email</span>
        <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Password</span>
        <input
          className={inputClass}
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={mode === "signup" ? 12 : 1}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === "signup" && <span className="block text-xs text-muted-foreground">At least 12 characters.</span>}
      </label>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy && <Loader2 className="animate-spin" />}
        {mode === "signup" ? "Create free account" : "Sign in"}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        {mode === "signup"
          ? "Free — no card, no plan. The same account signs in to Relay if you add it later."
          : "Use the account you created here or on Relay."}
      </p>
    </form>
  );
}

function Downloads({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [releases, setReleases] = useState<Release[] | null>(null);
  const [latest, setLatest] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const target = detectTarget();

  useEffect(() => {
    let cancelled = false;
    call<{ releases: Release[]; latest: string[] }>("/v1/account/downloads", { token: session.token })
      .then((data) => {
        if (cancelled) return;
        setReleases(data.releases);
        setLatest(data.latest);
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        if (e.status === 401) onSignOut();
        else setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [session.token, onSignOut]);

  async function download(release: Release) {
    setPending(release.release_id);
    setError(null);
    try {
      const { download_url } = await call<{ download_url: string }>(`/v1/account/downloads/${release.release_id}`, {
        method: "POST",
        token: session.token,
      });
      // The link is a file with Content-Disposition: attachment, so the page stays put.
      window.location.assign(download_url);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) onSignOut();
      else setError(e instanceof Error ? e.message : "The download could not start");
    } finally {
      setPending(null);
    }
  }

  async function signOut() {
    await call("/v1/auth/logout", { method: "POST", token: session.token }).catch(() => undefined);
    onSignOut();
  }

  const current = (releases ?? []).filter((r) => latest.includes(r.release_id));
  const rank = (r: Release) => (r.platform === target.platform ? (target.arch === null || r.arch === target.arch ? 0 : 1) : 2);
  current.sort((a, b) => rank(a) - rank(b));
  const older = (releases ?? []).filter((r) => !latest.includes(r.release_id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.email}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut /> Sign out
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      {releases === null && !error && (
        <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </div>
      )}

      {releases !== null && current.length === 0 && (
        <p className="rounded-md border px-4 py-6 text-center text-sm text-muted-foreground">
          No build is published yet. Check back soon.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {current.map((release, index) => (
          <ReleaseRow
            key={release.release_id}
            release={release}
            suggested={index === 0 && rank(release) === 0}
            busy={pending === release.release_id}
            onDownload={() => download(release)}
          />
        ))}
      </div>

      {older.length > 0 && (
        <div className="space-y-3">
          <button type="button" onClick={() => setShowAll((v) => !v)} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            {showAll ? "Hide earlier builds" : `Earlier builds (${older.length})`}
          </button>
          {showAll && (
            <div className="grid gap-3 md:grid-cols-2">
              {older.map((release) => (
                <ReleaseRow key={release.release_id} release={release} busy={pending === release.release_id} onDownload={() => download(release)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReleaseRow({
  release,
  suggested = false,
  busy,
  onDownload,
}: {
  release: Release;
  suggested?: boolean;
  busy: boolean;
  onDownload: () => void;
}) {
  const platform = PLATFORM[release.platform];
  return (
    <div className={`flex flex-col gap-3 rounded-lg border p-4 ${suggested ? "border-foreground/40 bg-muted/30" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
          <platform.icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {platform.label} · {ARCH[release.arch] ?? release.arch}
            {suggested && <span className="ml-2 text-xs font-normal text-muted-foreground">for this computer</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {release.version} · {release.file_name} · {formatSize(release.size_bytes)}
          </p>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground" title={release.sha256}>
            SHA-256 {release.sha256}
          </p>
        </div>
      </div>
      <Button onClick={onDownload} disabled={busy} variant={suggested ? "default" : "outline"}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />} Download
      </Button>
    </div>
  );
}
