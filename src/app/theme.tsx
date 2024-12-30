import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import * as React from "react";

const useDarkMode = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    const savedMode = window.localStorage.getItem("preferredTheme");
    if (savedMode === "dark") {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const nextMode = !prev;
      window.localStorage.setItem("preferredTheme", nextMode ? "dark" : "light");
      return nextMode;
    });
  };

  return { darkMode, toggleDarkMode };
};

const createCustomTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#333333" : "#555555", // Neutral dark gray for dark mode, medium gray for light mode
      },
      secondary: {
        main: darkMode ? "#B3B3B3" : "#E0E0E0", // Light gray shades for secondary elements
      },
      background: {
        default: darkMode ? "#1A1A1A" : "#FAFAFA", // Very dark gray for dark mode, very light gray for light mode
        paper: darkMode ? "#2C2C2C" : "#FFFFFF", // Slightly lighter gray for paper elements
      },
      text: {
        primary: darkMode ? "#E0E0E0" : "#1A1A1A", // High contrast neutral text colors
        secondary: darkMode ? "#B0B0B0" : "#4A4A4A", // Subtle contrast for secondary text
      },
    },
    typography: {
      fontFamily: "Roboto, Helvetica, Arial, sans-serif",
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
        color: darkMode ? "#FFFFFF" : "#1A1A1A",
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem",
        color: darkMode ? "#CCCCCC" : "#000000",
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
        color: darkMode ? "#E0E0E0" : "#1A1A1A",
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.43,
        color: darkMode ? "#B0B0B0" : "#4A4A4A",
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiLink: {
        styleOverrides: {
          root: {
            color: darkMode ? "#76C7C0" : "#007B83",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            padding: "8px 16px",
            backgroundColor: darkMode ? "#333333" : "#555555",
            color: darkMode ? "#FFFFFF" : "#FFFFFF",
            "&:hover": {
              backgroundColor: darkMode ? "#444444" : "#666666",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            boxShadow: darkMode ? "0 4px 6px rgba(0, 0, 0, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
  });

export { useDarkMode, createCustomTheme, ThemeProvider, CssBaseline };
