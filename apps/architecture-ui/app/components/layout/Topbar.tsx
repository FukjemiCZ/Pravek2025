"use client";

import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Topbar() {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Typography variant="h6">
          Pravěk v Ráji — Architecture Portal
        </Typography>
      </Toolbar>
    </AppBar>
  );
}