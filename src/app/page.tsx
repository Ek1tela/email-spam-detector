"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useMemo, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import EmailCard from "@/components/EmailCard";
import HistoryPanel from "@/components/HistoryPanel";
import {
  ShieldCheck,
  Search,
  LogOut,
  Loader2,
  Inbox,
  History,
  Filter,
  Sparkles,
  ShieldAlert,
  Zap,
  ArrowRight,
  BookOpen,
  Lock,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";

type Tab = "scan" | "history";
type FilterType = "all" | "spam" | "malicious" | "clean";

export default function Home() {
  const { data: session, status } = useSession();
  const {
    results,
    setResults,
    loading,
    setLoading,
    error,
    setError,
    removeResult,
  } = useAppStore();

  const [tab, setTab] = useState<Tab>("scan");
  const [filter, setFilter] = useState<FilterType>("all");
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(5);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const hasMal = r.linkReports.some((l) => l.isMalicious);
      if (filter === "spam") return r.isSpam;
      if (filter === "malicious") return hasMal;
      if (filter === "clean") return !r.isSpam && !hasMal;
      return true;
    });
  }, [results, filter]);

  const stats = useMemo(() => {
    const spam = results.filter((r) => r.isSpam).length;
    const mal = results.filter((r) =>
      r.linkReports.some((l) => l.isMalicious)
    ).length;
    return {
      total: results.length,
      spam,
      mal,
      clean: results.length - spam - mal,
    };
  }, [results]);

  async function runScan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxResults, query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Scan failed");
      setResults(data.results || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Scan failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--text-muted)]" size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ============ Header ============ */}
      <header className="border-b border-[var(--border)] sticky top-0 z-30 backdrop-blur-xl bg-[rgba(10,11,13,0.75)]">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] flex items-center justify-center">
              <ShieldCheck size={14} className="text-gray-300" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight">
              EkiVance Technology Innovation
            </span>
            <span className="text-[11px] text-[var(--text-muted)] ml-1 hidden sm:inline">
              v1.0
            </span>
          </div>

          {session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-dim)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{session.user?.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-white px-2.5 py-1.5 rounded-md border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
              >
                <LogOut size={12} /> Sign out
              </button>
            </div>
          ) : (
           <a
              href="https://www.ekivance.co.ke/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-white transition-colors"
            >
              <BookOpen size={13} /> ekivance.co.ke
            </a>
          )}
        </div>
      </header>

      {!session ? (
        /* ==================== LANDING ==================== */
        <Landing onSignIn={() => signIn("google")} />
      ) : (
        /* ==================== DASHBOARD ==================== */
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight mb-1">
              Inbox Scanner
            </h1>
            <p className="text-sm text-[var(--text-dim)]">
              Analyze recent messages for spam and unsafe links.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* ---- LEFT SIDEBAR ---- */}
            <aside className="space-y-6">
              {/* Scan controls */}
              <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Scan options
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-[11px] text-[var(--text-dim)] mb-1.5 block">
                      Gmail filter
                    </label>
                    <div className="relative">
                      <Search
                        size={12}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      />
                      <input
                        type="text"
                        placeholder="is:unread…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-8 pr-2.5 py-2 text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-strong)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[var(--text-dim)] mb-1.5 block">
                      Email count
                    </label>
                    <select
                      value={maxResults}
                      onChange={(e) => setMaxResults(Number(e.target.value))}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-2.5 py-2 text-xs focus:outline-none focus:border-[var(--border-strong)]"
                    >
                      {[5, 10, 15, 20].map((n) => (
                        <option key={n} value={n}>
                          {n} emails
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={runScan}
                    disabled={loading}
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 rounded-md font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Search size={13} />
                    )}
                    {loading ? "Scanning…" : "Scan inbox"}
                  </button>
                </div>
              </div>

              {/* Stats */}
              {results.length > 0 && (
                <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      This scan
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <StatRow label="Scanned" value={stats.total} />
                    <StatRow label="Spam" value={stats.spam} tone="danger" />
                    <StatRow
                      label="Malicious"
                      value={stats.mal}
                      tone="warn"
                    />
                    <StatRow label="Clean" value={stats.clean} tone="ok" />
                  </div>
                </div>
              )}

              {/* Filter chips (vertical) */}
              {results.length > 0 && (
                <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Filter
                    </p>
                  </div>
                  <div className="p-2">
                    {(["all", "spam", "malicious", "clean"] as FilterType[]).map(
                      (f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={clsx(
                            "w-full flex items-center justify-between text-xs px-3 py-2 rounded-md capitalize transition-colors",
                            filter === f
                              ? "bg-[var(--surface-2)] text-white"
                              : "text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-white"
                          )}
                        >
                          <span>{f}</span>
                          <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                            {f === "all"
                              ? stats.total
                              : f === "spam"
                              ? stats.spam
                              : f === "malicious"
                              ? stats.mal
                              : stats.clean}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </aside>

            {/* ---- MAIN CONTENT ---- */}
            <main className="min-w-0">
              {/* Tab bar */}
              <div className="flex items-center gap-1 mb-5 border-b border-[var(--border)]">
                <TabButton
                  active={tab === "scan"}
                  onClick={() => setTab("scan")}
                >
                  <Inbox size={13} /> Results
                  {results.length > 0 && (
                    <span className="text-[10px] text-[var(--text-muted)] tabular-nums ml-0.5">
                      {results.length}
                    </span>
                  )}
                </TabButton>
                <TabButton
                  active={tab === "history"}
                  onClick={() => setTab("history")}
                >
                  <History size={13} /> History
                </TabButton>
              </div>

              {tab === "scan" ? (
                <>
                  {error && (
                    <div className="border border-red-900/50 bg-red-950/30 text-red-200 text-sm px-4 py-3 rounded-md mb-4">
                      {error}
                    </div>
                  )}

                  {loading && results.length === 0 && (
                    <div className="py-24 text-center">
                      <Loader2
                        className="animate-spin mx-auto mb-3 text-[var(--text-muted)]"
                        size={18}
                      />
                      <p className="text-sm text-[var(--text-dim)]">
                        Reading your inbox…
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {filtered.map((r) => (
                      <EmailCard
                        key={r.email.id}
                        result={r}
                        onRemoved={removeResult}
                      />
                    ))}
                  </div>

                  {!loading && results.length === 0 && (
                    <div className="border border-dashed border-[var(--border)] rounded-lg py-20 text-center">
                      <Inbox
                        className="mx-auto mb-3 text-[var(--text-muted)]"
                        size={24}
                      />
                      <p className="text-sm text-[var(--text-dim)] mb-1">
                        No scans yet
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Configure scan options and click{" "}
                        <span className="text-[var(--text-dim)]">
                          Scan inbox
                        </span>
                        .
                      </p>
                    </div>
                  )}

                  {!loading && results.length > 0 && filtered.length === 0 && (
                    <div className="border border-dashed border-[var(--border)] rounded-lg py-16 text-center">
                      <Filter
                        className="mx-auto mb-3 text-[var(--text-muted)]"
                        size={20}
                      />
                      <p className="text-sm text-[var(--text-dim)]">
                        No emails match this filter.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <HistoryPanel />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== Sub-components ==================== */

function Landing({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="relative">
      {/* Grid backdrop */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />

      <div className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-16 lg:gap-20 items-start">
          {/* LEFT — copy */}
          <div>
            <div className="fade-up fade-up-1 mb-7">
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] border border-[var(--border)] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                EkiVance · Inbox Security
              </span>
            </div>

            <h1 className="fade-up fade-up-1 text-[44px] md:text-[64px] font-semibold tracking-[-0.03em] leading-[1.02] mb-7">
              Your inbox,
              <br />
              watched by AI.
            </h1>

            <p className="fade-up fade-up-2 text-[15px] text-[var(--text-dim)] max-w-md leading-relaxed mb-10">
              EkiVance Technology Innovation reads recent messages and flags two things:
              content that looks like spam, and links that lead somewhere
              dangerous. Nothing more, nothing less.
            </p>

            <div className="fade-up fade-up-3 flex items-center gap-5 mb-14">
              <button
                onClick={onSignIn}
                className="group inline-flex items-center gap-2.5 bg-white text-gray-900 hover:bg-gray-100 px-5 py-3 rounded-lg font-medium text-sm transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
                <ArrowRight
                  size={14}
                  className="text-gray-500 group-hover:translate-x-0.5 transition-transform"
                />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Lock size={11} />
                <span>Read-only access</span>
              </div>
            </div>

            {/* Trust row */}
            <div className="fade-up fade-up-4 flex items-center gap-6 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500" />
                <span>GPT-4o classification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500" />
                <span>Google Safe Browsing</span>
              </div>
            </div>
          </div>

          {/* RIGHT — demo card */}
          <div className="fade-up fade-up-3 lg:pt-4">
            <DemoPreview />
          </div>
        </div>

        {/* Feature strip */}
        <div className="fade-up fade-up-5 mt-24 grid grid-cols-1 md:grid-cols-3 border-t border-[var(--border)]">
          <FeatureColumn
            index="01"
            icon={<Sparkles size={14} />}
            title="Spam classification"
            desc="Each message is scored on tone, intent, and sender signals. You see the score and the reason."
          />
          <FeatureColumn
            index="02"
            icon={<ShieldAlert size={14} />}
            title="Link reputation"
            desc="Every URL is checked against Google Safe Browsing, then cached locally so repeat scans stay fast."
            border
          />
          <FeatureColumn
            index="03"
            icon={<Zap size={14} />}
            title="Act in place"
            desc="Mark spam, move to trash, or mark as read without ever leaving the dashboard."
            border
          />
        </div>

        <p className="fade-up fade-up-5 mt-14 text-[11px] text-[var(--text-muted)]">
          Built with Next.js · Prisma · Gmail API · OpenAI
        </p>
      </div>
    </div>
  );
}

function DemoPreview() {
  return (
    <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] overflow-hidden shadow-2xl shadow-black/50">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
        <span className="ml-3 text-[11px] text-[var(--text-muted)] font-mono">
          spam-sentinel · results
        </span>
      </div>

      {/* Demo content */}
      <div className="p-4 space-y-2">
        <DemoEmail
          subject="You've won a $500 gift card!"
          from="prize-notify@promo-mail.ru"
          status="spam"
          score={94}
        />
        <DemoEmail
          subject="Security alert: unusual sign-in"
          from="no-reply@accounts.google.com"
          status="clean"
        />
        <DemoEmail
          subject="Invoice #8921 — payment required"
          from="billing@secure-invoices.xyz"
          status="malicious"
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          3 of 3 processed
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          ~2.4s
        </span>
      </div>
    </div>
  );
}

function DemoEmail({
  subject,
  from,
  status,
  score,
}: {
  subject: string;
  from: string;
  status: "spam" | "malicious" | "clean";
  score?: number;
}) {
  const badge =
    status === "spam"
      ? {
          text: `Spam · ${score}%`,
          className: "border-red-900/60 bg-red-950/50 text-red-300",
        }
      : status === "malicious"
      ? {
          text: "Malicious link",
          className: "border-amber-900/60 bg-amber-950/50 text-amber-300",
        }
      : {
          text: "Clean",
          className: "border-emerald-900/60 bg-emerald-950/50 text-emerald-300",
        };

  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-white truncate">{subject}</p>
          <p className="text-[10px] text-[var(--text-muted)] truncate font-mono mt-0.5">
            {from}
          </p>
        </div>
        <span
          className={clsx(
            "shrink-0 inline-flex items-center text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border",
            badge.className
          )}
        >
          {badge.text}
        </span>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors",
        active
          ? "border-white text-white"
          : "border-transparent text-[var(--text-dim)] hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function StatRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "danger" | "warn" | "ok";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-400"
      : tone === "warn"
      ? "text-amber-400"
      : tone === "ok"
      ? "text-emerald-400"
      : "text-white";

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-dim)]">{label}</span>
      <span className={clsx("text-sm font-medium tabular-nums", toneClass)}>
        {value}
      </span>
    </div>
  );
}

function FeatureColumn({
  index,
  icon,
  title,
  desc,
  border,
}: {
  index: string;
  icon: ReactNode;
  title: string;
  desc: string;
  border?: boolean;
}) {
  return (
    <div
      className={clsx(
        "py-10 px-0 md:px-8",
        border && "md:border-l border-[var(--border)]"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          {index}
        </span>
        <span className="text-[var(--text-dim)]">{icon}</span>
      </div>
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <p className="text-[13px] text-[var(--text-dim)] leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
