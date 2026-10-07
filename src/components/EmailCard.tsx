"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Trash2,
  MailOpen,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import type { ScanResult } from "@/types";

interface Props {
  result: ScanResult;
  onRemoved: (emailId: string) => void;
}

export default function EmailCard({ result, onRemoved }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
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
      if (action === "spam" || action === "trash") onRemoved(result.email.id);
    } catch {
      alert("Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors">
      <div className="p-4">
        <header className="flex justify-between items-start gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm text-white truncate">
              {result.email.subject}
            </h3>
            <p className="text-xs text-[var(--text-dim)] truncate mt-0.5">
              {result.email.from}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
            {result.isSpam && (
              <Badge tone="danger">
                <AlertTriangle size={10} />
                Spam · {(result.spamScore * 100).toFixed(0)}%
              </Badge>
            )}
            {hasMalicious && (
              <Badge tone="warn">
                <ShieldAlert size={10} />
                Malicious link
              </Badge>
            )}
            {!flagged && (
              <Badge tone="ok">
                <CheckCircle2 size={10} />
                Clean
              </Badge>
            )}
          </div>
        </header>

        <p className="text-sm text-[var(--text-dim)] line-clamp-2 leading-relaxed">
          {result.email.snippet}
        </p>

        {result.spamReason && (
          <p className="text-xs text-[var(--text-muted)] mt-2 italic">
            {result.spamReason}
          </p>
        )}

        {result.linkReports.length > 0 && (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-dim)] select-none">
              {result.linkReports.length} link
              {result.linkReports.length !== 1 ? "s" : ""}
            </summary>
            <ul className="mt-2 space-y-1">
              {result.linkReports.map((l) => (
                <li
                  key={l.url}
                  className="flex items-center gap-2 text-xs font-mono"
                >
                  <span
                    className={clsx(
                      "shrink-0",
                      l.isMalicious ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {l.isMalicious ? "✗" : "✓"}
                  </span>
                  <span
                    className="truncate flex-1 text-[var(--text-dim)]"
                    title={l.url}
                  >
                    {l.url}
                  </span>
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

      <footer className="flex gap-1 px-4 py-2.5 border-t border-[var(--border)] bg-[var(--surface-2)] rounded-b-lg">
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
      </footer>
    </article>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "danger" | "warn" | "ok";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-900/60 bg-red-950/40 text-red-300"
      : tone === "warn"
      ? "border-amber-900/60 bg-amber-950/40 text-amber-300"
      : "border-emerald-900/60 bg-emerald-950/40 text-emerald-300";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded border",
        toneClass
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
      className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-white px-2.5 py-1.5 rounded-md hover:bg-[var(--border)] disabled:opacity-50 transition-colors"
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
