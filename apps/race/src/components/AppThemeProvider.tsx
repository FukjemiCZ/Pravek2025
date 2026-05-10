"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { pravekTheme } from "@/theme/pravekTheme";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={pravekTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
