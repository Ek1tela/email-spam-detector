import { google } from "googleapis";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

export async function getGmailClient(accessToken: string) {
  const auth = getOAuthClient();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}
