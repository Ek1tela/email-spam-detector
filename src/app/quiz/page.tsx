"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { QUIZ_QUESTIONS, type QuizQuestion } from "@/data/quiz";
import clsx from "clsx";

export default function QuizPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[index];

  function answer(userSaysPhishing: boolean) {
    const correct = userSaysPhishing === q.isPhishing;
    const next = [...answers, correct];
    setAnswers(next);
    if (index + 1 < QUIZ_QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setIndex(0);
    setAnswers([]);
    setFinished(false);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] sticky top-0 z-20 backdrop-blur-xl bg-[rgba(10,11,13,0.75)]">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to lessons
          </Link>
          <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Phishing Quiz
          </span>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-14">
        {finished ? (
          <ResultScreen answers={answers} onRestart={restart} />
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Question {index + 1} of {QUIZ_QUESTIONS.length}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {answers.filter(Boolean).length} correct so far
                </p>
              </div>
              <div className="h-1 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{
                    width: `${((index + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <p className="text-sm font-medium">{q.subject}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                  From: {q.from}
                </p>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  {q.body}
                </p>
                {q.links.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
                      Links
                    </p>
                    {q.links.map((l) => (
                      <p
                        key={l}
                        className="text-xs font-mono text-[var(--text-dim)]"
                      >
                        {l}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-sm text-[var(--text-dim)] mb-4">
              Is this email phishing?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => answer(true)}
                className="border border-red-900/50 bg-red-950/30 hover:bg-red-950/50 text-red-300 py-4 rounded-lg font-medium transition-colors"
              >
                Yes — Phishing
              </button>
              <button
                onClick={() => answer(false)}
                className="border border-emerald-900/50 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 py-4 rounded-lg font-medium transition-colors"
              >
                No — Legitimate
              </button>
            </div>

            {answers.length > 0 && index > 0 && (
              <div
                className={clsx(
                  "mt-6 border rounded-lg p-4 text-sm",
                  answers[answers.length - 1]
                    ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-200"
                    : "border-red-900/50 bg-red-950/20 text-red-200"
                )}
              >
                <p className="flex items-center gap-2 font-medium mb-2">
                  {answers[answers.length - 1] ? (
                    <>
                      <CheckCircle2 size={14} /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle size={14} /> Not quite
                    </>
                  )}
                </p>
                <p className="text-[var(--text-dim)] text-xs leading-relaxed">
                  {QUIZ_QUESTIONS[index - 1].explanation}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ResultScreen({
  answers,
  onRestart,
}: {
  answers: boolean[];
  onRestart: () => void;
}) {
  const score = answers.filter(Boolean).length;
  const total = answers.length;
  const pct = Math.round((score / total) * 100);

  const verdict =
    pct >= 80
      ? { label: "Excellent", color: "text-emerald-400" }
      : pct >= 60
      ? { label: "Good", color: "text-amber-400" }
      : { label: "Needs improvement", color: "text-red-400" };

  return (
    <div className="text-center py-14">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-6">
        Quiz complete
      </p>
      <p className="text-6xl font-semibold tabular-nums mb-2">
        {score}/{total}
      </p>
      <p className={clsx("text-lg font-medium mb-1", verdict.color)}>
        {verdict.label}
      </p>
      <p className="text-sm text-[var(--text-dim)] mb-10">
        You answered {pct}% of phishing questions correctly.
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          <RotateCcw size={13} /> Retry
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-dim)] hover:text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
