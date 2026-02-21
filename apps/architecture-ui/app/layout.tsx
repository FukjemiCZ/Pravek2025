import type { ReactNode } from "react";
import "./globals.css";
import { CssBaseline } from "@mui/material";

// Očekávám, že tohle existuje:
// - ThemeRegistry: MUI ThemeProvider + (volitelně) mode-aware theme
// - ModeProvider: Business/Technical toggle context (client)
import ThemeRegistry from "@/app/components/layout/ThemeRegistry";
import { ModeProvider } from "@/app/components/layout/ModeContext";

export const metadata = {
  title: "Pravěk v Ráji — Architecture Portal",
  description: "Product Architecture Intelligence Portal (Business + Technical)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <ThemeRegistry>
          <ModeProvider>
            <CssBaseline />
            {children}
          </ModeProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}