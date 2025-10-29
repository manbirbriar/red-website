import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reforming Education on Drugs",
  description:
    "RED is a University of Calgary Students' Union club delivering science-forward education on drugs and public health.",
  keywords: [
    "Reforming Education on Drugs",
    "RED",
    "University of Calgary",
    "Students' Union",
    "drug education",
    "harm reduction",
  ],
  authors: [{ name: "Reforming Education on Drugs" }],
  openGraph: {
    title: "Reforming Education on Drugs",
    description:
      "Empowering Calgary classrooms with science-based drug education and harm reduction resources.",
    siteName: "Reforming Education on Drugs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[linear-gradient(90deg,rgba(254,236,242,1) 0%,rgba(254,236,242,0.9) 15%,rgba(255,255,255,1) 30%,rgba(255,255,255,1) 70%,rgba(255,250,251,0.9) 85%,rgba(255,250,251,1) 100%)] text-slate-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-12">{children}</div>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
