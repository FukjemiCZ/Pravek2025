// components/layout/Shell.tsx
"use client";

import { ReactNode, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import SideNav from "./SideNav";

const drawerWidth = 240;

export default function Shell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top bar */}
      <AppBar position="fixed" elevation={0} color="default">
        <Toolbar>
          {!isDesktop && (
            <IconButton onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Pravek Architecture
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop || open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <SideNav />
      </Drawer>

      {/* Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}