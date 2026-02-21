import type { ReactNode } from "react";
import "./globals.css";
import { CssBaseline } from "@mui/material";

import { ModeProvider } from "@/app/components/layout/ModeContext";
import ThemeRegistry from "@/app/components/layout/ThemeRegistry";

export const metadata = {
  title: "Pravěk v Ráji — Architecture Portal",
  description: "Product Architecture Intelligence Portal (Business + Technical)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body>
        {/* ModeProvider MUSÍ být vně ThemeRegistry, protože ThemeRegistry používá useMode() */}
        <ModeProvider>
          <ThemeRegistry>
            <CssBaseline />
            {children}
          </ThemeRegistry>
        </ModeProvider>
      </body>
    </html>
  );
}