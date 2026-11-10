import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "BET YOU LOSE",
  description: "Create a bet link. Drop it in chat. Make them pay up.",
  openGraph: {
    title: "BET YOU LOSE. PAY UP.",
    description: "Create a bet link. Drop it in chat. Make them pay up.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} h-full dark antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black font-mono text-white">
        {children}
      </body>
    </html>
  );
}
