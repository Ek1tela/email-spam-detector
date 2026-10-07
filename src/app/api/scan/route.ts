import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRecentEmails } from "@/lib/gmail";
import { classifySpam } from "@/lib/spam";
import { checkLinks } from "@/lib/links";
import { prisma } from "@/lib/prisma";
import type { ScanResult } from "@/types";

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
  const query: string = body.query || "";

  try {
    const emails = await fetchRecentEmails(accessToken, maxResults, query);

    const allLinks = Array.from(new Set(emails.flatMap((e) => e.links)));
    const allLinkReports = await checkLinks(allLinks);
    const linkMap = new Map(allLinkReports.map((r) => [r.url, r]));

    const results: ScanResult[] = [];

    for (const email of emails) {
      const spam = await classifySpam(email.subject, email.body, email.from);
      const linkReports = email.links.map((u) => linkMap.get(u)!).filter(Boolean);
      const hasMalicious = linkReports.some((l) => l.isMalicious);

      await prisma.scan.create({
        data: {
          userId,
          emailId: email.id,
          subject: email.subject,
          sender: email.from,
          snippet: email.snippet,
          isSpam: spam.isSpam,
          spamScore: spam.score,
          spamReason: spam.reason,
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
        isSpam: spam.isSpam,
        spamScore: spam.score,
        spamReason: spam.reason,
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
