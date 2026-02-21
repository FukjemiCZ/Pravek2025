"use client";

import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import StatusBadge from "./StatusBadge";
import ModeToggle from "./ModeToggle";

export default function TopBar() {
  return (
    <AppBar position="fixed" elevation={0} color="default">
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1 }}>
          Pravěk — Architecture
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <StatusBadge />
          <ModeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  );
}