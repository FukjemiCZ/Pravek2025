// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BottomNavBar from "@/app/components/bottom-navbar";
import { EVENT_CONFIG } from "@/app/event-config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `Pravěk v Ráji ${EVENT_CONFIG.year}`,
  description: "Benefiční dogtrekkingový závod v Českém ráji.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        {children}

        {/* 🔥 Sticky bottom bar pouze pro mobil */}
        <BottomNavBar />
      </body>
    </html>
  );
}
