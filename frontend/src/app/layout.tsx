import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Logashree Sales Dial",
  description: "Call center workspace for agents, supervisors, campaigns, and reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${jetbrainsMono.variable}`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
