"use client"; // Required because we are using ThemeProvider

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/* ========================= */
/* GOOGLE FONTS */
/* ========================= */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ========================= */
/* ROOT LAYOUT */
/* ========================= */

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* ThemeProvider wraps all children */}
          <ThemeProvider
            attribute="class"           // toggles `dark` class
            defaultTheme="system"       // system default
            enableSystem                 // respect OS preference
            disableTransitionOnChange   // avoid flicker
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}