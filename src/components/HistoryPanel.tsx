"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

export default function HistoryPanel() {
  const { history, setHistory } = useAppStore();

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => d.scans && setHistory(d.scans))
      .catch(() => {});
  }, [setHistory]);

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>No scan history yet. Run a scan to populate it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((s) => {
        const flagged = s.isSpam || s.hasMaliciousLinks;
        return (
          <div
            key={s.id}
            className={clsx(
              "rounded-lg border p-4 flex items-start justify-between gap-4",
              flagged ? "border-red-800/60 bg-red-950/20" : "border-gray-800 bg-gray-900/50"
            )}
          >
            <div className="min-w-0 flex-1">
              <h4 className="font-medium truncate">{s.subject}</h4>
              <p className="text-xs text-gray-400 truncate">{s.sender}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {s.isSpam && (
                <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  <AlertTriangle size={10} /> SPAM
                </span>
              )}
              {s.hasMaliciousLinks && (
                <span className="flex items-center gap-1 bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  <ShieldAlert size={10} /> LINK
                </span>
              )}
              {!flagged && (
                <span className="flex items-center gap-1 bg-green-700 text-white text-[10px] px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> CLEAN
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
