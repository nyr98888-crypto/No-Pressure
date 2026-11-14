import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import { PaywallProvider } from "@/components/PaywallProvider";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "No Pressure",
  description:
    "Social dare PWA — local counters, juice, and 24-hour share links. 18+ entertainment only.",
  applicationName: "No Pressure",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.png", sizes: "any", type: "image/png" }],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "No Pressure",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <PaywallProvider>
          {children}
          <AgeGate />
          <RegisterSW />
        </PaywallProvider>
      </body>
    </html>
  );
}
