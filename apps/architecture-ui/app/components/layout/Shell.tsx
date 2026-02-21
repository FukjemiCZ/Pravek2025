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
import TopBar from "@/app/components/layout/Topbar";
import SideNav from "@/app/components/layout/SideNav";

const DRAWER_WIDTH = 260;

export default function Shell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      {/* odsazení pod TopBar */}
      <Toolbar />
      <SideNav onNavigate={() => setMobileOpen(false)} />
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        // klíčové: zabrání horizontálnímu overflow při kombinaci Drawer + content
        overflowX: "hidden",
      }}
    >
      <TopBar />

      {/* Mobile hamburger */}
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

      {/* Desktop permanent drawer: součást flex layoutu */}
      {isDesktop && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile temporary drawer: overlay */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content: NEDÁVÁME ml ani width calc — flex to vyřeší */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0, // klíčové pro zabránění overflow v flex containeru
          // top offset pro fixed TopBar
          pt: 10,
          px: { xs: 2, md: 3 },
          pb: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}