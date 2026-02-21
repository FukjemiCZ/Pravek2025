"use client";

import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Shell({ children }: any) {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}