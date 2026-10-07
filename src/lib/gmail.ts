import { getGmailClient } from "@/lib/google-auth";
import type { EmailMessage } from "@/types";

const URL_REGEX = /https?:\/\/[^\s<>"')]+/gi;

export function extractLinks(text: string): string[] {
  const matches = text.match(URL_REGEX) || [];
  return Array.from(new Set(matches));
}

function decodeBase64(data: string): string {
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf-8");
}

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.body?.data) return decodeBase64(payload.body.data);
  if (payload.parts) {
    return payload.parts.map((p: any) => extractBody(p)).join("\n");
  }
  return "";
}

export async function fetchRecentEmails(
  accessToken: string,
  maxResults = 5,
  query = ""
): Promise<EmailMessage[]> {
  const gmail = await getGmailClient(accessToken);

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    labelIds: ["INBOX"],
    q: query || undefined,
  });

  const messages = list.data.messages || [];
  const emails: EmailMessage[] = [];

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full",
    });

    const payload = detail.data.payload;
    const headers = payload?.headers || [];
    const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
    const from = headers.find((h) => h.name === "From")?.value || "(unknown)";
    const body = extractBody(payload);

    emails.push({
      id: msg.id!,
      threadId: msg.threadId!,
      snippet: detail.data.snippet || "",
      subject,
      from,
      body,
      links: extractLinks(body),
      labelIds: detail.data.labelIds || [],
    });
  }

  return emails;
}

export async function markEmailAsSpam(accessToken: string, messageId: string) {
  const gmail = await getGmailClient(accessToken);
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: { addLabelIds: ["SPAM"], removeLabelIds: ["INBOX"] },
  });
}

export async function moveEmailToTrash(accessToken: string, messageId: string) {
  const gmail = await getGmailClient(accessToken);
  await gmail.users.messages.trash({ userId: "me", id: messageId });
}

export async function markEmailAsRead(accessToken: string, messageId: string) {
  const gmail = await getGmailClient(accessToken);
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: { removeLabelIds: ["UNREAD"] },
  });
}
