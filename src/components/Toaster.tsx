"use client";

import { useToastStore } from "@/lib/toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";

export default function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-[320px]">
      {toasts.map((t) => {
        const Icon =
          t.variant === "success"
            ? CheckCircle2
            : t.variant === "error"
            ? XCircle
            : Info;
        const tone =
          t.variant === "success"
            ? "border-emerald-900/60 text-emerald-300"
            : t.variant === "error"
            ? "border-red-900/60 text-red-300"
            : "border-[var(--border-strong)] text-[var(--text-dim)]";

        return (
          <div
            key={t.id}
            className={clsx(
              "border rounded-lg bg-[var(--surface)] shadow-lg shadow-black/40 p-3 flex items-start gap-3 fade-up",
              tone
            )}
          >
            <Icon size={14} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white">{t.title}</p>
              {t.description && (
                <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-[var(--text-muted)] hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
