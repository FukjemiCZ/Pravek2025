import { createTheme } from "@mui/material/styles";

export const pravekTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3f5f35", contrastText: "#fffaf0" },
    secondary: { main: "#b05b2c", contrastText: "#fffaf0" },
    error: { main: "#a23228" },
    warning: { main: "#c47a2c" },
    background: { default: "#efe1c5", paper: "#fff7e7" },
    text: { primary: "#2f261d", secondary: "#6b5845" }
  },
  typography: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 900 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 900 },
    h4: { fontWeight: 900 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: { fontWeight: 800, textTransform: "none" }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(47, 38, 29, 0.12)",
          boxShadow: "0 8px 24px rgba(47,38,29,0.08)"
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999 } }
    }
  }
});
