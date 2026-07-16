import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../style/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thunder-platform.vercel.app"),
  title: {
    default: "Thunder Platform",
    template: "%s | Thunder Platform",
  },
  description:
    "Enterprise SaaS platform with multi-tenancy, RBAC, MFA, and audit logging. Built with Next.js & Supabase.",
  openGraph: {
    title: "Thunder Platform",
    description: "Enterprise SaaS platform with tenants, RBAC, and audit logging.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  if (typeof args[0] === 'string' && args[0].includes('The width') && args[0].includes('height') && args[0].includes('chart should be greater than 0')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        /> */}
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
