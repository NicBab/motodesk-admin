import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Geist, Geist_Mono } from "next/font/google";

import { AppProviders } from "./providers";

import "./globals.css";

//************************************************************** */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

//************************************************************** */

export const metadata: Metadata = {
  title: "MotoDesk Administration",
  description: "MotoDesk platform administration and operations.",

  robots: {
    index: false,
    follow: false,
  },
};

//************************************************************** */

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-100 text-zinc-900">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

//************************************************************** */