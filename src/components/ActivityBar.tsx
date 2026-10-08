"use client";

import { useMemo } from "react";

interface Props {
  results: { isSpam: boolean }[];
}

export default function ActivityBar({ results }: Props) {
  const buckets = useMemo(() => {
    const size = 12;
    const total = results.length;
    const arr = Array(size).fill(0);
    results.forEach((r, i) => {
      const idx = Math.floor((i / Math.max(total, 1)) * size);
      arr[Math.min(idx, size - 1)] += r.isSpam ? -1 : 1;
    });
    return arr;
  }, [results]);

  const max = Math.max(...buckets.map(Math.abs), 1);

  return (
    <div className="flex items-end gap-0.5 h-8">
      {buckets.map((v, i) => {
        const height = (Math.abs(v) / max) * 100;
        const isSpam = v < 0;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-500"
            style={{
              height: `${Math.max(height, 8)}%`,
              background: isSpam
                ? "rgba(248, 113, 113, 0.5)"
                : "rgba(52, 211, 153, 0.5)",
              alignSelf: isSpam ? "flex-start" : "flex-end",
            }}
          />
        );
      })}
    </div>
  );
}
