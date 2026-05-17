import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TABF FinMentor · Adaptive Finance Training",
  description: "AI-powered adaptive training for financial professionals — by Taiwan Academy of Banking and Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ transition: "background-color 0.25s ease" }}>
      <body className={`${dmSans.variable} font-sans`}>{children}</body>
    </html>
  );
}
