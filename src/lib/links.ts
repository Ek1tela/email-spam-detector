import axios from "axios";
import { prisma } from "@/lib/prisma";
import type { LinkReport } from "@/types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function checkLinks(urls: string[]): Promise<LinkReport[]> {
  if (urls.length === 0) return [];

  const results = new Map<string, LinkReport>();
  const toCheck: string[] = [];

  const cached = await prisma.linkCache.findMany({
    where: { url: { in: urls } },
  });

  for (const c of cached) {
    const fresh = Date.now() - c.checkedAt.getTime() < CACHE_TTL_MS;
    if (fresh) {
      results.set(c.url, {
        url: c.url,
        isMalicious: c.isMalicious,
        threatTypes: c.threatTypes ? JSON.parse(c.threatTypes) : undefined,
        cached: true,
      });
    } else {
      toCheck.push(c.url);
    }
  }

  for (const url of urls) {
    if (!results.has(url) && !toCheck.includes(url)) toCheck.push(url);
  }

  if (toCheck.length > 0) {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    const matched = new Map<string, string[]>();

    if (apiKey) {
      try {
        const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
        const res = await axios.post(endpoint, {
          client: { clientId: "spam-detector", clientVersion: "1.1.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: toCheck.map((url) => ({ url })),
          },
        });

        for (const m of res.data.matches || []) {
          const u = m.threat.url;
          matched.set(u, [...(matched.get(u) || []), m.threatType]);
        }
      } catch (err: any) {
        console.error("Safe Browsing failed:", err.message);
      }
    }

    for (const url of toCheck) {
      const threats = matched.get(url);
      const report: LinkReport = {
        url,
        isMalicious: !!threats,
        threatTypes: threats,
      };
      results.set(url, report);

      await prisma.linkCache.upsert({
        where: { url },
        update: {
          isMalicious: report.isMalicious,
          threatTypes: threats ? JSON.stringify(threats) : null,
          checkedAt: new Date(),
        },
        create: {
          url,
          isMalicious: report.isMalicious,
          threatTypes: threats ? JSON.stringify(threats) : null,
        },
      });
    }
  }

  return urls.map((u) => results.get(u)!);
}
