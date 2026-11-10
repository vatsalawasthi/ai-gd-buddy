import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "AI GD Buddy — Master Campus Placement Group Discussions with AI",
  description:
    "Practice realistic group discussions with AI participants, strengthen your communication skills, and become placement-ready through personalized AI feedback.",
  keywords: [
    "Group Discussion practice",
    "AI GD simulator",
    "Campus placement preparation",
    "MBA GD prep",
    "AI interview coach",
    "Speech evaluation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-navy-950 text-slate-100 flex flex-col antialiased selection:bg-electric-500 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
