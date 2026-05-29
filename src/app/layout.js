import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgentFlow AI — Build AI Chatbots in Minutes",
  description: "Create custom AI chatbots for your business using Gemini AI. No coding required.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AgentFlow AI — Build AI Chatbots in Minutes",
    description: "Create custom AI chatbots for your business using Gemini AI. No coding required.",
    url: "https://multi-chat-bot.vercel.app",
    siteName: "AgentFlow AI",
    images: [
      {
        url: "https://multi-chat-bot.vercel.app/support_agent.png",
        width: 800,
        height: 600,
        alt: "AgentFlow AI - No-Code Custom Chatbots",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentFlow AI — Build AI Chatbots in Minutes",
    description: "Create custom AI chatbots for your business using Gemini AI. No coding required.",
    images: ["https://multi-chat-bot.vercel.app/support_agent.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
