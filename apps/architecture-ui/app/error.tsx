"use client";

import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do Vercel logs
    console.error("Architecture UI error:", error);
  }, [error]);

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Application error
      </Typography>

      <Typography sx={{ mb: 2 }}>
        V produkci Next schovává detail chyby. Zkontroluj Vercel Function Logs.
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
        Digest: {error.digest ?? "—"}
      </Typography>

      <Button variant="contained" onClick={reset}>
        Try again
      </Button>
    </Box>
  );
}