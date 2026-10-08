"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

type FilterType = "all" | "flagged" | "clean";

export default function HistoryPanel() {
  const { history, setHistory } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => d.scans && setHistory(d.scans))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setHistory]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return history.filter((s) => {
      const flagged = s.isSpam || s.hasMaliciousLinks;
      if (filter === "flagged" && !flagged) return false;
      if (filter === "clean" && flagged) return false;
      if (!query) return true;
      return (
        s.subject.toLowerCase().includes(query) ||
        s.sender.toLowerCase().includes(query)
      );
    });
  }, [history, q, filter]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2
          className="animate-spin mx-auto mb-3 text-[var(--text-muted)]"
          size={18}
        />
        <p className="text-sm text-[var(--text-dim)]">Loading history</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-[var(--text-dim)]">
          No scans yet. Run a scan to populate history.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search subject or sender"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-8 pr-2.5 py-2 text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-strong)] transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "flagged", "clean"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "text-xs px-3 py-1.5 rounded-md capitalize transition-colors border",
                filter === f
                  ? "bg-white text-gray-900 border-white"
                  : "bg-transparent text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)] overflow-hidden bg-[var(--surface)]">
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--text-dim)]">
              No matches for {q || filter}.
            </p>
          </div>
        )}
        {filtered.map((s) => {
          const flagged = s.isSpam || s.hasMaliciousLinks;
          return (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{s.subject}</p>
                <p className="text-xs text-[var(--text-dim)] truncate mt-0.5 font-mono">
                  {s.sender}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-[var(--text-muted)] tabular-nums hidden sm:block">
                  {formatDistanceToNow(new Date(s.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {s.isSpam && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide border border-red-900/60 bg-red-950/40 text-red-300 px-2 py-0.5 rounded">
                    <AlertTriangle size={10} /> Phishing
                  </span>
                )}
                {s.hasMaliciousLinks && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide border border-amber-900/60 bg-amber-950/40 text-amber-300 px-2 py-0.5 rounded">
                    <ShieldAlert size={10} /> Link
                  </span>
                )}
                {!flagged && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded">
                    <CheckCircle2 size={10} /> Clean
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--text-muted)] mt-3 text-center">
        Showing {filtered.length} of {history.length} scans
      </p>
    </div>
  );
}
