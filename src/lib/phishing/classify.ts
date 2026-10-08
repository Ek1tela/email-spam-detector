import { analyzePhishingRules, type PhishingSignal } from "./rules";

export interface PhishingVerdict {
  isPhishing: boolean;
  score: number;
  signals: PhishingSignal[];
  aiReason: string;
  aiScore: number;
  ruleScore: number;
  isStudentTargeted: boolean;
}

export async function classifyPhishing(
  subject: string,
  body: string,
  from: string,
  links: string[],
  aiVerdict: { isSpam: boolean; score: number; reason: string }
): Promise<PhishingVerdict> {
  const rules = analyzePhishingRules(subject, body, from, links);

  // Weighted combination: AI is stronger for content, rules for structure
  const combined = 0.65 * aiVerdict.score + 0.35 * rules.score;

  const isStudentTargeted = rules.signals.some(
    (s) => s.id === "student_target"
  );

  return {
    isPhishing: combined >= 0.5 && (aiVerdict.isSpam || rules.score >= 0.4),
    score: combined,
    signals: rules.signals,
    aiReason: aiVerdict.reason,
    aiScore: aiVerdict.score,
    ruleScore: rules.score,
    isStudentTargeted,
  };
}
