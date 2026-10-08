export interface QuizQuestion {
  id: string;
  subject: string;
  from: string;
  body: string;
  links: string[];
  isPhishing: boolean;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    subject: "URGENT: Your student account will be suspended",
    from: "registrar-alerts@university-portal.xyz",
    body: "Dear student, our system detected unusual activity. Click the link below within 24 hours to verify your identity or your account will be permanently suspended. You must enter your student ID and password.",
    links: ["http://university-portal.xyz/verify?id=8921"],
    isPhishing: true,
    explanation:
      "Urgency ('within 24 hours'), a lookalike domain (.xyz instead of .edu), and a request for your password are all classic phishing signals.",
  },
  {
    id: "q2",
    subject: "Your exam results are ready",
    from: "exams@university.ac.ke",
    body: "Hi Emmanuel, your semester 2 results have been published. Log into the student portal as usual to view them. — Registrar's Office",
    links: ["https://portal.university.ac.ke"],
    isPhishing: false,
    explanation:
      "Legitimate institutional domain, no urgency, no credential request, directs you to log in through the normal portal.",
  },
  {
    id: "q3",
    subject: "Congratulations! You've been selected for a scholarship",
    from: "scholarships@global-education-grants.tk",
    body: "You have been selected for a $5,000 scholarship. To claim it, click the link and enter your bank details for the transfer. Offer expires today.",
    links: ["http://bit.ly/claim-scholarship"],
    isPhishing: true,
    explanation:
      "Free-TLD domain (.tk), URL shortener, financial bait, and a request for bank details — a textbook scholarship scam.",
  },
  {
    id: "q4",
    subject: "Meeting reminder",
    from: "k.mwangi@university.ac.ke",
    body: "Hi, quick reminder about our 2pm supervisor meeting in Room 214. See you there. — Kevin",
    links: [],
    isPhishing: false,
    explanation:
      "Personal, low-pressure, no links, no requests. Typical legitimate email from a staff member.",
  },
  {
    id: "q5",
    subject: "Final Notice: Tuition payment overdue",
    from: "bursar@university-fees-notice.com",
    body: "Our records show your tuition is overdue. Pay immediately via the link below or your registration will be cancelled. Update your payment details now.",
    links: ["http://university-fees-notice.com/pay-now"],
    isPhishing: true,
    explanation:
      "Fake bursar domain (hyphenated lookalike), high-pressure language, and a payment link — designed to scare you into paying.",
  },
];
