export interface Lesson {
  id: string;
  title: string;
  summary: string;
  content: string[];
  tips: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: "what-is-phishing",
    title: "What is phishing?",
    summary:
      "Phishing is a cyberattack where criminals impersonate trusted entities to steal credentials, money, or personal data.",
    content: [
      "Phishing is one of the most common cyberattacks worldwide. Attackers send emails, messages, or fake websites that look legitimate — often impersonating your bank, university, or a service you use.",
      "The goal is to trick you into revealing passwords, credit card numbers, or clicking a link that installs malware. E-learning users are prime targets because students receive many legitimate institutional emails and are often stressed, rushed, or unfamiliar with institutional norms.",
      "Phishing attacks exploit psychology, not technology. They create urgency, fear, or excitement so you act before thinking.",
    ],
    tips: [
      "Never trust an email just because it 'looks official'.",
      "Hover over links before clicking to see the real destination.",
      "When in doubt, contact the sender through an official channel.",
    ],
  },
  {
    id: "student-phishing",
    title: "Why students are targeted",
    summary:
      "Scholarships, internships, exam results, and tuition notices are common phishing hooks for e-learning users.",
    content: [
      "Cybercriminals know that students constantly receive institutional emails about fees, results, deadlines, and opportunities. They mimic this rhythm to slip through.",
      "Common student phishing emails claim: 'Your scholarship application needs verification', 'Your exam results are ready — click here', 'Pay your tuition now or lose your place', 'You've been selected for an internship — send your ID'.",
      "These emails often come from lookalike domains like `university-portal.xyz`, `scholarships-info.tk`, or `student-results-update.com`.",
    ],
    tips: [
      "Check the sender's full email address, not just the display name.",
      "Your university will never ask for your password by email.",
      "Verify scholarship or internship offers directly with the institution.",
    ],
  },
  {
    id: "spotting-phishing",
    title: "How to spot a phishing email",
    summary:
      "Six red flags: urgency, generic greetings, mismatched links, spelling errors, unexpected attachments, and requests for credentials.",
    content: [
      "Red flag 1 — Urgency: 'Act within 24 hours', 'Your account will be suspended', 'Final warning'.",
      "Red flag 2 — Generic greeting: 'Dear user', 'Dear customer' instead of your name.",
      "Red flag 3 — Mismatched links: The visible link text says one thing, but hovering reveals a different URL.",
      "Red flag 4 — Spelling and grammar: Small errors are a classic phishing marker, though modern attacks are increasingly clean.",
      "Red flag 5 — Unexpected attachments: Especially `.exe`, `.zip`, `.scr`, or password-protected files.",
      "Red flag 6 — Credential requests: Legitimate services never ask for your password over email.",
    ],
    tips: [
      "If two or more red flags are present, treat the email as suspicious.",
      "Forward suspicious emails to your IT department before deleting.",
      "Report phishing — it protects other users too.",
    ],
  },
  {
    id: "safe-practices",
    title: "Safe email practices",
    summary:
      "Practical habits that protect you daily: 2FA, password managers, verification calls, and link previews.",
    content: [
      "Enable two-factor authentication (2FA) on every account that supports it. Even if your password leaks, the attacker cannot get in without the second factor.",
      "Use a password manager. It will never autofill your credentials on a fake lookalike domain — that's a silent alarm.",
      "Verify unusual requests by phone. If your 'bank' asks you to confirm something, call the number on the back of your card — not the one in the email.",
      "Preview links. On desktop, hover. On mobile, long-press. Check the domain before tapping.",
      "Keep your browser and OS up to date. Many phishing attacks exploit known vulnerabilities.",
    ],
    tips: [
      "Password managers + 2FA stop the vast majority of phishing attacks.",
      "Never send sensitive data through email — even to trusted contacts.",
      "If you think you've been phished, change passwords immediately and enable 2FA.",
    ],
  },
];
