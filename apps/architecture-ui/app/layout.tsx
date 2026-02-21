// apps/architecture-ui/app/layout.tsx
import type { ReactNode } from "react";
import { CssBaseline } from "@mui/material";
import ThemeRegistry from "@/app/components/layout/ThemeRegistry";

export const metadata = {
  title: "Pravek Architecture",
  description: "Product Model & Architecture Portal",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="cs">
      <body>
        <ThemeRegistry>
          <CssBaseline />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}