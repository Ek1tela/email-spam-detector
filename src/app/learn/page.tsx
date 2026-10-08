"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, BookOpen } from "lucide-react";
import { LESSONS } from "@/data/lessons";

export default function LearnPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] sticky top-0 z-20 backdrop-blur-xl bg-[rgba(10,11,13,0.75)]">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            EkiVance · Awareness Module
          </span>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-14">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] border border-[var(--border)] rounded-full px-3 py-1 mb-5">
            <BookOpen size={11} />
            Module 1 of 1 · Phishing Awareness
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Learn to spot phishing.
          </h1>
          <p className="text-[var(--text-dim)] max-w-xl">
            Four short lessons on how phishing works, why students are
            targeted, and how to protect yourself. Takes ~10 minutes.
          </p>
        </div>

        <div className="space-y-4">
          {LESSONS.map((lesson, i) => (
            <LessonCard key={lesson.id} lesson={lesson} index={i + 1} />
          ))}
        </div>

        <div className="mt-14 border border-[var(--border)] rounded-lg bg-[var(--surface)] p-6 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">
                Ready to test your knowledge?
              </p>
              <p className="text-xs text-[var(--text-dim)]">
                Take a 5-question quiz with real phishing examples.
              </p>
            </div>
          </div>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Start quiz →
          </Link>
        </div>
      </main>
    </div>
  );
}

function LessonCard({
  lesson,
  index,
}: {
  lesson: (typeof LESSONS)[number];
  index: number;
}) {
  return (
    <article className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
      <details>
        <summary className="cursor-pointer px-6 py-5 flex items-center gap-4 hover:bg-[var(--surface-2)] transition-colors">
          <span className="text-[11px] font-mono text-[var(--text-muted)] w-6">
            {String(index).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <h2 className="text-base font-medium">{lesson.title}</h2>
            <p className="text-xs text-[var(--text-dim)] mt-0.5">
              {lesson.summary}
            </p>
          </div>
        </summary>
        <div className="px-6 pb-6 pt-2 border-t border-[var(--border)]">
          <div className="space-y-3 mt-4">
            {lesson.content.map((p, i) => (
              <p
                key={i}
                className="text-sm text-[var(--text-dim)] leading-relaxed"
              >
                {p}
              </p>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Key takeaways
            </p>
            <ul className="space-y-2">
              {lesson.tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-sm text-[var(--text-dim)] flex items-start gap-2"
                >
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </article>
  );
}
