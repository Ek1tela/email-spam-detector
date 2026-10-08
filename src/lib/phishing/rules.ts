/**
 * Rule-based phishing signal extractor.
 * Runs BEFORE the LLM to provide concrete, explainable indicators.
 */

export interface PhishingSignal {
  id: string;
  label: string;
  description: string;
  weight: number; // 0–1
}

export interface PhishingRuleResult {
  score: number; // 0–1
  signals: PhishingSignal[];
}

const URGENCY_PATTERNS = [
  /\b(urgent|immediately|asap|act now|expires? (today|soon))\b/i,
  /\b(verify|confirm|update)\s+(your\s+)?(account|identity|information)\b/i,
  /\b(suspend(ed)?|lock(ed)?|deactivat(ed|ion)|terminat(ed|ion))\b/i,
  /\b(within 24 ?hours?|within 48 ?hours?|last warning|final notice)\b/i,
];

const FINANCIAL_LURE_PATTERNS = [
  /\b(winner|won|prize|lottery|jackpot|reward)\b/i,
  /\b(free|bonus|gift card|cash|payment|refund|compensation)\b/i,
  /\b(bitcoin|crypto|investment|guaranteed returns?)\b/i,
  /\b(claim your|redeem your|unlock your)\b/i,
];

const CREDENTIAL_REQUEST_PATTERNS = [
  /\b(click here to (login|sign ?in|verify|reset))\b/i,
  /\b(enter your (password|username|credentials|pin))\b/i,
  /\b(confirm your (email|password|ssn|social security))\b/i,
];

const STUDENT_TARGET_PATTERNS = [
  /\b(scholarship|grant|financial aid|bursary)\b/i,
  /\b(internship|job offer|placement|attachment)\b/i,
  /\b(student loan|tuition|fee payment)\b/i,
  /\b(university|college|campus|faculty|registrar)\b/i,
  /\b(exam results?|transcript|degree|graduation)\b/i,
  /\b(moodle|canvas|blackboard|edmodo|classroom)\b/i,
];

const SUSPICIOUS_URL_PATTERNS = [
  /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i, // IP-based URL
  /https?:\/\/[^\s]*\.(tk|ml|ga|cf|gq|xyz|top|work|click|link)\b/i, // free TLDs
  /https?:\/\/bit\.ly|https?:\/\/tinyurl\.com|https?:\/\/t\.co|https?:\/\/goo\.gl/i, // shorteners
  /https?:\/\/[^\s]*-[^\s]*\.(com|net|org)\b/i, // hyphenated domains (paypal-secure.com)
  /@[^\s]*https?:\/\//i, // URL with @ credential trick
];

const SPOOF_HINT_PATTERNS = [
  /\b(paypal|amazon|apple|microsoft|google|netflix|bank)\b/i, // brand mentions in body
];

function matchAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter((p) => p.test(text)).length;
}

export function analyzePhishingRules(
  subject: string,
  body: string,
  from: string,
  links: string[]
): PhishingRuleResult {
  const signals: PhishingSignal[] = [];
  const text = `${subject}\n${body}`;
  const urlText = links.join(" ");

  // Urgency
  if (matchAny(text, URGENCY_PATTERNS)) {
    signals.push({
      id: "urgency",
      label: "Urgency pressure",
      description:
        "Uses urgency or threat language to push you into acting quickly.",
      weight: 0.2,
    });
  }

  // Financial lure
  if (matchAny(text, FINANCIAL_LURE_PATTERNS)) {
    signals.push({
      id: "financial_lure",
      label: "Financial bait",
      description:
        "Promises money, prizes, or rewards — a classic phishing hook.",
      weight: 0.15,
    });
  }

  // Credential request
  if (matchAny(text, CREDENTIAL_REQUEST_PATTERNS)) {
    signals.push({
      id: "credential_request",
      label: "Credential request",
      description:
        "Asks you to log in or enter passwords — legitimate services rarely do this by email.",
      weight: 0.25,
    });
  }

  // Student targeting
  const studentMatches = countMatches(text, STUDENT_TARGET_PATTERNS);
  if (studentMatches > 0) {
    signals.push({
      id: "student_target",
      label: "Student-targeted language",
      description:
        "Mentions scholarships, internships, tuition, or LMS platforms — common bait for e-learning users.",
      weight: Math.min(0.25, 0.1 * studentMatches),
    });
  }

  // Suspicious URL patterns
  if (links.length > 0 && matchAny(urlText, SUSPICIOUS_URL_PATTERNS)) {
    signals.push({
      id: "suspicious_url",
      label: "Suspicious URL structure",
      description:
        "Contains IP-based links, URL shorteners, free TLDs, or hyphenated domains that mimic brands.",
      weight: 0.2,
    });
  }

  // Brand spoof hint
  if (
    matchAny(text, SPOOF_HINT_PATTERNS) &&
    !new RegExp(`@(${SPOOF_HINT_PATTERNS[0].source.slice(2, -2)})\\.`, "i").test(from)
  ) {
    signals.push({
      id: "brand_spoof",
      label: "Possible brand spoofing",
      description:
        "Mentions a well-known brand but the sender domain doesn't match it.",
      weight: 0.15,
    });
  }

  const rawScore = signals.reduce((sum, s) => sum + s.weight, 0);
  const score = Math.min(1, rawScore);

  return { score, signals };
}
