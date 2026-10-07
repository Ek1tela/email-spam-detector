export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  body: string;
  links: string[];
  labelIds?: string[];
}

export interface LinkReport {
  url: string;
  isMalicious: boolean;
  threatTypes?: string[];
  cached?: boolean;
}

export interface ScanResult {
  email: EmailMessage;
  spamScore: number;
  isSpam: boolean;
  spamReason?: string;
  linkReports: LinkReport[];
}

export interface ScanRecord {
  id: string;
  emailId: string;
  subject: string;
  sender: string;
  snippet: string;
  isSpam: boolean;
  spamScore: number;
  spamReason?: string | null;
  hasMaliciousLinks: boolean;
  createdAt: string;
  links: {
    url: string;
    isMalicious: boolean;
    threatTypes?: string | null;
  }[];
}
