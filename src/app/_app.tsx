// pages/_app.tsx
import * as React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  // Zde můžete definovat vlastní barevnou paletu, typografii, breakpoints atp.
  palette: {
    primary: {
      main: '#007acc'
    },
    secondary: {
      main: '#f50057'
    }
  }
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      {/* Reset/Globalní styly Material UI */}
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

