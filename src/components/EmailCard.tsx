"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Trash2,
  MailOpen,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import clsx from "clsx";
import type { ScanResult } from "@/types";
import { useToastStore } from "@/lib/toast";

interface Props {
  result: ScanResult;
  onRemoved: (emailId: string) => void;
}

export default function EmailCard({ result, onRemoved }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const push = useToastStore((s) => s.push);

  const hasMalicious = result.linkReports.some((l) => l.isMalicious);
  const flagged = result.isSpam || hasMalicious;

  async function runAction(action: "spam" | "trash" | "read") {
    setBusy(action);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, messageId: result.email.id }),
      });
      if (!res.ok) throw new Error("Action failed");

      if (action === "spam" || action === "trash") {
        onRemoved(result.email.id);
        push({
          variant: "success",
          title: action === "spam" ? "Marked as spam" : "Moved to trash",
          description: result.email.subject.slice(0, 60),
        });
      } else {
        push({ variant: "success", title: "Marked as read" });
      }
    } catch {
      push({
        variant: "error",
        title: "Action failed",
        description: "Try again",
      });
    } finally {
      setBusy(null);
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <article
      className={clsx(
        "group border rounded-lg bg-[var(--surface)] transition-all duration-300",
        flagged
          ? "border-red-900/50 hover:border-red-800/70"
          : "border-[var(--border)] hover:border-[var(--border-strong)]",
        "hover:shadow-lg hover:shadow-black/20 hover:-translate-y-[1px]"
      )}
    >
      <div className="p-4">
        <header className="flex justify-between items-start gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm text-white truncate">
              {result.email.subject}
            </h3>
            <p className="text-xs text-[var(--text-dim)] truncate mt-0.5 font-mono">
              {result.email.from}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
            {result.isSpam && (
              <Badge tone="danger" pulse>
                <AlertTriangle size={10} />
                Phishing {Math.round(result.spamScore * 100)}%
              </Badge>
            )}
            {hasMalicious && (
              <Badge tone="warn">
                <ShieldAlert size={10} />
                Malicious link
              </Badge>
            )}
            {result.isStudentTargeted && <Badge tone="info">Student target</Badge>}
            {!flagged && (
              <Badge tone="ok">
                <CheckCircle2 size={10} />
                Clean
              </Badge>
            )}
          </div>
        </header>

        <p
          className={clsx(
            "text-sm text-[var(--text-dim)] leading-relaxed transition-all",
            expanded ? "" : "line-clamp-2"
          )}
        >
          {result.email.snippet}
        </p>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] text-[var(--text-muted)] hover:text-white mt-1 flex items-center gap-1 transition-colors"
        >
          <ChevronDown
            size={11}
            className={clsx("transition-transform", expanded && "rotate-180")}
          />
          {expanded ? "Show less" : "Show more"}
        </button>

        {result.phishingSignals && result.phishingSignals.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-dim)] select-none flex items-center gap-2">
              <ShieldAlert size={11} className="text-amber-400" />
              {result.phishingSignals.length} phishing signal
              {result.phishingSignals.length !== 1 ? "s" : ""}
            </summary>
            <ul className="mt-2 space-y-2">
              {result.phishingSignals.map((s) => (
                <li
                  key={s.id}
                  className="text-xs border border-amber-900/30 bg-amber-950/10 rounded-md p-2.5"
                >
                  <p className="text-amber-300 font-medium flex items-center justify-between">
                    <span>{s.label}</span>
                    <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                      +{Math.round(s.weight * 100)}%
                    </span>
                  </p>
                  <p className="text-[11px] text-[var(--text-dim)] mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        )}

        {result.linkReports.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-dim)] select-none">
              {result.linkReports.length} link
              {result.linkReports.length !== 1 ? "s" : ""}
            </summary>
            <ul className="mt-2 space-y-1.5">
              {result.linkReports.map((l) => (
                <li
                  key={l.url}
                  className="flex items-center gap-2 text-xs font-mono group/link"
                >
                  <span
                    className={clsx(
                      "shrink-0",
                      l.isMalicious ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {l.isMalicious ? "x" : "+"}
                  </span>
                  <span
                    className="truncate flex-1 text-[var(--text-dim)]"
                    title={l.url}
                  >
                    {l.url}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyLink(l.url)}
                      title="Copy link"
                      className="text-[var(--text-muted)] hover:text-white p-1"
                    >
                      {copied === l.url ? (
                        <Check size={10} className="text-emerald-400" />
                      ) : (
                        <Copy size={10} />
                      )}
                    </button>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open link"
                      className="text-[var(--text-muted)] hover:text-white p-1"
                    >
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  {l.threatTypes && (
                    <span className="text-[10px] text-amber-400/80 shrink-0">
                      {l.threatTypes.join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <footer className="flex items-center gap-1 px-3 py-2 border-t border-[var(--border)] bg-[var(--surface-2)] rounded-b-lg">
        <ActionButton
          onClick={() => runAction("spam")}
          busy={busy === "spam"}
          icon={<ShieldAlert size={12} />}
          label="Spam"
        />
        <ActionButton
          onClick={() => runAction("trash")}
          busy={busy === "trash"}
          icon={<Trash2 size={12} />}
          label="Trash"
        />
        <ActionButton
          onClick={() => runAction("read")}
          busy={busy === "read"}
          icon={<MailOpen size={12} />}
          label="Mark read"
        />
        <div className="flex-1" />
        <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums px-2">
          #{result.email.id.slice(-6)}
        </span>
      </footer>
    </article>
  );
}

function Badge({
  tone,
  children,
  pulse,
}: {
  tone: "danger" | "warn" | "ok" | "info";
  children: React.ReactNode;
  pulse?: boolean;
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-900/60 bg-red-950/40 text-red-300"
      : tone === "warn"
      ? "border-amber-900/60 bg-amber-950/40 text-amber-300"
      : tone === "info"
      ? "border-blue-900/60 bg-blue-950/40 text-blue-300"
      : "border-emerald-900/60 bg-emerald-950/40 text-emerald-300";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded border",
        toneClass,
        pulse && "animate-pulse"
      )}
    >
      {children}
    </span>
  );
}

function ActionButton({
  onClick,
  busy,
  icon,
  label,
}: {
  onClick: () => void;
  busy: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-white hover:bg-[var(--border)] px-2.5 py-1.5 rounded-md disabled:opacity-50 transition-colors"
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
