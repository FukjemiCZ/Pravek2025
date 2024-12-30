"use client";

import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function MapSection() {
  return (
    <Box id="mapa" sx={{ mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Mapa závodu
      </Typography>
      <Box
        sx={{
          textAlign: "center",
          py: 5,
          backgroundColor: "#fafafa",
          border: "1px dashed #ccc",
          fontStyle: "italic",
          color: "#999",
        }}
      >
        Mapa závodu bude zveřejněna v den akce.
      </Box>
    </Box>
  );
}
