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
  title: "NO PRESSURE",
  description:
    "Deal a tactical challenge to your friend. Sudden death before default forfeit.",
  openGraph: {
    title: "NO PRESSURE — Every dare. Zero escape.",
    description:
      "Deal a tactical challenge to your friend. Sudden death before default forfeit.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} h-full dark antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#050505] font-sans text-white">
        {children}
      </body>
    </html>
  );
}
