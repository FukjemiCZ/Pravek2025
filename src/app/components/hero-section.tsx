// src/app/components/hero-section.tsx

"use client";

import * as React from "react";
import {
  Box,
  Container,
  Typography,
} from "@mui/material";
import DynamicButton from "@/app/components/dynamic-button";

export default function HeroSection() {
  return (
    <Box
      id="home"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light" ? "#F7F3EE" : "#2C3E50",
        textAlign: "center",
        py: 5,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          Benefiční dogtrekking Pravěk v Ráji 2026
        </Typography>
        <Typography variant="h6" gutterBottom>
          14. - 17. května 2026 &nbsp;|&nbsp; Fotbalové hřiště Vyskeř
        </Typography>
        <Typography variant="h6" gutterBottom>
          ve spolupráci se Sportovní klub ČSV & spol.
        </Typography>

        <Box mt={3}>
          <DynamicButton buttonId="support" sx={{ m: 1 }} />
          <DynamicButton buttonId="pay" sx={{ m: 1 }} />
          <DynamicButton buttonId="register" sx={{ m: 1 }} />
          <DynamicButton buttonId="nav" sx={{ m: 1 }} />
          <DynamicButton buttonId="startovka" sx={{ m: 1 }} />
        </Box>

        <Box mt={4}>
        <DynamicButton
            buttonId="facebook"
            variantType="iconButton"
            iconButtonProps={{
              size: "large",
              "aria-label": "Facebook",
            }}
          />
          <DynamicButton
            buttonId="instagram"
            variantType="iconButton"
            iconButtonProps={{
              size: "large",
              "aria-label": "Instagram",
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
