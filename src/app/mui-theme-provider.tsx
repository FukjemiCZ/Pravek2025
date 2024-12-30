"use client"; // Důležité! Tato komponenta běží pouze na klientovi

import * as React from "react";
import { createTheme, ThemeProvider as MaterialThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  // Inicializace tmavého režimu
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedMode = window.localStorage.getItem("preferredTheme");
      if (savedMode === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        return true;
      }
      document.documentElement.setAttribute("data-theme", "light");
      return false;
    }
    return false;
  });

  // Funkce pro přepnutí režimu
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      const theme = next ? "dark" : "light";
      window.localStorage.setItem("preferredTheme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      return next;
    });
  };

  // Vytvoření MUI tématu podle aktuálního režimu
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#007acc",
      },
      secondary: {
        main: "#f50057",
      },
    },
  });

  return (
    <MaterialThemeProvider theme={theme}>
      {/* Reset / baseline stylů MUI */}
      <CssBaseline />
      
      {/* Tlačítko pro přepnutí režimu */}
      <Box component="header" sx={{ position: "fixed", top: 0, right: 0, p: 2 }}>
        <button onClick={toggleDarkMode}>
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </Box>
      
      {/* Hlavní obsah aplikace */}
      <Box component="main">{children}</Box>
    </MaterialThemeProvider>
  );
}
