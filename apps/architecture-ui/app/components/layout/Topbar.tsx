"use client";

import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import StatusBadge from "@/app/components/layout/StatusBadge";
import ModeToggle from "@/app/components/layout/ModeToggle";

export default function TopBar() {
  return (
    <AppBar position="fixed" elevation={0} color="default">
      <Toolbar sx={{ display: "flex", gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>
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