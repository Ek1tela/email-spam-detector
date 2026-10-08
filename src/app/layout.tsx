import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Toaster from "@/components/Toaster";

export const metadata: Metadata = {
  title: "EkiVance Technology Innovation - Inbox Security",
  description:
    "AI-powered phishing and malicious link detection for your Gmail inbox.",
  authors: [
    {
      name: "EkiVance Technology Innovation",
      url: "https://email-spam-detector-fwtp.vercel.app/",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg)] text-[var(--text)] min-h-screen">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
