"use client";

import * as React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import {
  useDarkMode,
  createCustomTheme,
  ThemeProvider,
  CssBaseline,
} from "./theme";
import DrawerContent from "./components/drawer-content";
import Image from "next/image";
import { useRouter } from "next/navigation"; // ← přidáno

type AppShellProps = {
  children: React.ReactNode;
  menuType: "home" | "race" | "charity";
};

export default function AppShell({ children, menuType }: AppShellProps) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const theme = createCustomTheme(darkMode);
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));
  const router = useRouter(); // ← router

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>

        {/* MOBILE APPBAR */}
        <AppBar
          position="fixed"
          sx={{
            width: "100%",
            display: { xs: "block", md: "none" },
          }}
        >
          <Toolbar sx={{ display: "flex", alignItems: "center" }}>

            {/* Placeholder + klikací absolutní velké logo */}
            <Box sx={{ width: 46, height: 46, position: "relative", ml: -1 }}>
              <Box
                onClick={() => router.push("/home")} // ← kliknutí na logo
                sx={{
                  position: "absolute",
                  left: 0,
                  width: 92,        // velikost loga
                  height: 92,
                  zIndex: 10,
                  cursor: "pointer",
                  transition: "opacity 0.15s ease",
                  "&:active": { opacity: 0.7 },
                }}
              >
                <Image
                  src={process.env.NEXT_PUBLIC_LOGO!}
                  alt="logo"
                  fill
                  style={{
                    objectFit: "contain",
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              </Box>
            </Box>

            {/* HAMBURGER */}
            <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ ml: "auto" }}>
              <MenuIcon />
            </IconButton>

          </Toolbar>
        </AppBar>

        {/* DESKTOP DRAWER */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: 240,
              position: "fixed",
              height: "100vh",
            },
          }}
          open
        >
          <DrawerContent
            menuType={menuType}
            darkMode={darkMode}
            handleToggleDarkMode={toggleDarkMode}
            handleDrawerToggle={handleDrawerToggle}
            isDesktop={isDesktop}
          />
        </Drawer>

        {/* MOBILE DRAWER */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: 240 },
          }}
        >
          <DrawerContent
            menuType={menuType}
            isDesktop={isDesktop}
            handleDrawerToggle={handleDrawerToggle}
            darkMode={darkMode}
            handleToggleDarkMode={toggleDarkMode}
          />
        </Drawer>

        {/* PAGE CONTENT */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: { xs: 8, md: 0 },
            ml: { md: "240px" },
            pb: 10,
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
