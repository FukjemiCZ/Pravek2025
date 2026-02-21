import "./globals.css";
import { CssBaseline } from "@mui/material";

export default function RootLayout({ children }: any) {
  return (
    <html lang="cs">
      <body>
        <CssBaseline />
        {children}
      </body>
    </html>
  );
}