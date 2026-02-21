"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import TopBar from "./TopBar";
import SideNav from "./SideNav";

const DRAWER_WIDTH = 260;

export default function Shell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Toolbar />
      <SideNav onNavigate={() => setMobileOpen(false)} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <TopBar />

      {/* Hamburger only on mobile (overlay button in corner) */}
      {!isDesktop && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: (t) => t.zIndex.appBar + 1,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Desktop drawer */}
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}

      {/* Mobile drawer */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Space for TopBar
          pt: 10,
          px: { xs: 2, md: 3 },
          pb: 4,
          // Space for desktop drawer
          ml: isDesktop ? `${DRAWER_WIDTH}px` : 0,
          width: isDesktop ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}