"use client";

import React, { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useMode } from "./ModeContext";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const { mode } = useMode();

  const theme = useMemo(() => {
    const primary = mode === "business" ? "#0b5fff" : "#6c5ce7";
    const bg = mode === "technical" ? "#f8f9ff" : "#ffffff";

    return createTheme({
      palette: {
        mode: "light",
        primary: { main: primary },
        background: { default: bg },
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
            },
          },
        },
      },
    });
  }, [mode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}