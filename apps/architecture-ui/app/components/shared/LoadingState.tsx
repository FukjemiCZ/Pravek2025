"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", py: 2 }}>
      <CircularProgress size={18} />
      <Typography variant="body2" sx={{ opacity: 0.75 }}>
        {label}
      </Typography>
    </Box>
  );
}