import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ConversationProvider>
          {children}
          <ChatWidget />
        </ConversationProvider>
      </body>
    </html>
  );
}
