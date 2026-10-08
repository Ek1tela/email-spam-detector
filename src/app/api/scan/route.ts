import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRecentEmails } from "@/lib/gmail";
import { classifySpam } from "@/lib/spam";
import { classifyPhishing } from "@/lib/phishing/classify";
import { checkLinks } from "@/lib/links";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;
  const userId = (session as any)?.userId;

  if (!session || !accessToken || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const maxResults = Math.min(Math.max(body.maxResults || 5, 1), 20);
  const studentMode = Boolean(body.studentMode);

  let query: string = body.query || "";
  if (studentMode) {
    const studentQuery =
      "(scholarship OR internship OR tuition OR university OR \"financial aid\" OR results OR transcript)";
    query = query ? `(${query}) AND ${studentQuery}` : studentQuery;
  }

  try {
    const emails = await fetchRecentEmails(accessToken, maxResults, query);

    const allLinks = Array.from(new Set(emails.flatMap((e) => e.links)));
    const allLinkReports = await checkLinks(allLinks);
    const linkMap = new Map(allLinkReports.map((r) => [r.url, r]));

    const results = [];

    for (const email of emails) {
      const spam = await classifySpam(email.subject, email.body, email.from);
      const phishing = await classifyPhishing(
        email.subject,
        email.body,
        email.from,
        email.links,
        spam
      );

      const linkReports = email.links.map((u) => linkMap.get(u)!).filter(Boolean);
      const hasMalicious = linkReports.some((l) => l.isMalicious);

      await prisma.scan.create({
        data: {
          userId,
          emailId: email.id,
          subject: email.subject,
          sender: email.from,
          snippet: email.snippet,
          isSpam: phishing.isPhishing,
          spamScore: phishing.score,
          spamReason: phishing.signals.map((s) => s.label).join(", "),
          hasMaliciousLinks: hasMalicious,
          links: {
            create: linkReports.map((l) => ({
              url: l.url,
              isMalicious: l.isMalicious,
              threatTypes: l.threatTypes ? JSON.stringify(l.threatTypes) : null,
            })),
          },
        },
      });

      results.push({
        email,
        isSpam: phishing.isPhishing,
        spamScore: phishing.score,
        spamReason: phishing.aiReason,
        phishingSignals: phishing.signals,
        isStudentTargeted: phishing.isStudentTargeted,
        linkReports,
      });
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Scan error:", err);
    return NextResponse.json(
      { error: "Scan failed", detail: err.message },
      { status: 500 }
    );
  }
}
