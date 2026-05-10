import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/AppThemeProvider";

export const metadata: Metadata = {
  title: "Pravěk Race App",
  description: "Závodní administrace Pravěk v Ráji"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body><AppThemeProvider>{children}</AppThemeProvider></body>
    </html>
  );
}
