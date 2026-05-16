import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { template: "%s | KnowledgeHub", default: "KnowledgeHub — Enterprise Knowledge Platform" },
  description: "Centralized product knowledge, documentation, training and assessment platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
