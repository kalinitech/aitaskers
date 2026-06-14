import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AITaskers - Verified AI Trainer Directory",
  description: "The only directory where every badge is backed by real proof of work on Outlier, Handshake, DataAnnotation, RWS and more.",
  keywords: ["AI trainers", "RLHF", "Outlier AI", "Handshake AI", "DataAnnotation", "AI taskers", "verified directory"],
  authors: [{ name: "AITaskers" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AITaskers - Verified AI Trainer Directory",
    description: "Stop Searching Telegram. Start Hiring Proven AI Trainers.",
    type: "website",
    siteName: "AITaskers",
  },
  twitter: {
    card: "summary_large_image",
    title: "AITaskers - Verified AI Trainer Directory",
    description: "Stop Searching Telegram. Start Hiring Proven AI Trainers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
