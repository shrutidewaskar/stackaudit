import type { Metadata } from "next";
import "./globals.css";
const poppins = { variable: "--font-poppins" };
const geistMono = { variable: "--font-geist-mono" };

import { branding } from "@/config/branding";

export const metadata: Metadata = {
  title: `${branding.name} - ${branding.tagline}`,
  description: branding.description,
};

import { ConversationProvider } from "@/lib/ai/conversation/hooks/ConversationContext";
import { ChatWidget } from "@/components/intelligence/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ConversationProvider>
          {children}
          <ChatWidget />
        </ConversationProvider>
      </body>
    </html>
  );
}
