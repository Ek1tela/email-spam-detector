import axios from "axios";

export interface SpamVerdict {
  isSpam: boolean;
  score: number;
  reason: string;
}

export async function classifySpam(
  subject: string,
  body: string,
  from: string
): Promise<SpamVerdict> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { isSpam: false, score: 0, reason: "No API key configured" };

  const prompt = `You are an expert email spam classifier. Analyze the email and return ONLY valid JSON:
{"isSpam": boolean, "score": number between 0 and 1, "reason": "short explanation"}

Criteria for SPAM:
- Unsolicited commercial content, phishing, scams
- Urgency manipulation, threats, prizes, crypto offers
- Suspicious sender patterns, spoofed domains
- Excessive capitalization, exclamation marks, obfuscated text

Criteria for NOT SPAM:
- Legitimate personal or business communication
- Transactional emails from known services

--- EMAIL START ---
From: ${from}
Subject: ${subject}
Body:
${body.slice(0, 2500)}
--- EMAIL END ---`;

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const content = JSON.parse(res.data.choices[0].message.content);
    return {
      isSpam: Boolean(content.isSpam),
      score: Math.max(0, Math.min(1, Number(content.score) || 0)),
      reason: String(content.reason || ""),
    };
  } catch (err: any) {
    console.error("Spam classification failed:", err.message);
    return { isSpam: false, score: 0, reason: "Classification error" };
  }
}
