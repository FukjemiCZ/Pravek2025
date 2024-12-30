"use client";

import * as React from "react";
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import sponsorsData from "./data/sponsors";

// Import sekcí
import HeroSection from "./components/hero-section";
import PrologSection from "./components/prolog-section";
import SupportSection from "./components/support-section";
import RulesSection from "./components/rules-section";
import MapSection from "./components/map-section";
import FacilitiesSection from "./components/facilities-section";
import ContactSection from "./components/contact-section";
import DrawerContent from "./components/drawer-content";
import SponsorDialog, { Sponsor } from "./components/sponsor-dialog";
import SponsorsSection from "./components/sponsors-section";
import MilestonesSection from "./components/milestones";

////////////////////////////////////////////
// Konfigurace
////////////////////////////////////////////
const drawerWidth = 240;
const CURRENT_YEAR = 2024;

export default function HomePage() {
  // Tmavý vs. světlý režim
  const [darkMode, setDarkMode] = React.useState(false);
  // Stav pro mobilní Drawer
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // Stav pro vybraného sponzora (Dialog)
  const [selectedSponsor, setSelectedSponsor] = React.useState<Sponsor | null>(
    null
  );

  // Po mountu načíst preferovaný režim
  React.useEffect(() => {
    const savedMode = window.localStorage.getItem("preferredTheme");
    if (savedMode === "dark") {
      setDarkMode(true);
    }
  }, []);

  // Přepínač dark/light
  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const nextMode = !prev;
      window.localStorage.setItem("preferredTheme", nextMode ? "dark" : "light");
      return nextMode;
    });
  };

  // Otevření/Zavření mobilního menu
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  // Otevření detailu sponzora
  const handleSelectSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
  };

  // Zavření detailu sponzora
  const handleCloseSponsorDialog = () => {
    setSelectedSponsor(null);
  };

  // Vytvoření MUI téma
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#007acc",
      },
      secondary: {
        main: "#f50057",
      },
    },
  });

  // Rozlišíme, zda je desktop
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  // Filtrace a seřazení sponzorů
  const sponsorsFilteredAndSorted = sponsorsData
  .filter((s) => s.years.includes(CURRENT_YEAR))
  .map((sponsor) => ({ ...sponsor, position: sponsor.position ?? Infinity }))
  .sort((a, b) => a.position - b.position);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: "flex" }}>
        {/* AppBar (Hamburger menu pro mobil) */}
        <AppBar
          position="fixed"
          sx={{
            width: "100%",
            display: { xs: "block", md: "none" }, // Skryto na desktopu
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Pravěk v Ráji
            </Typography>
            <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Permanent Drawer pro desktop */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" }, // Skryto na mobilu
            "& .MuiDrawer-paper": {
              position: "fixed",
              width: drawerWidth,
              height: "100vh",
              boxSizing: "border-box",
            },
          }}
        >
          <DrawerContent
            isDesktop={isDesktop}
            handleDrawerToggle={handleDrawerToggle}
            darkMode={darkMode}
            handleToggleDarkMode={handleToggleDarkMode}
          />
        </Drawer>

        {/* Temporary Drawer pro mobil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" }, // Skryto na desktopu
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <DrawerContent
            isDesktop={isDesktop}
            handleDrawerToggle={handleDrawerToggle}
            darkMode={darkMode}
            handleToggleDarkMode={handleToggleDarkMode}
          />
        </Drawer>

        {/* Hlavní obsah stránky */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: 8, md: 0 },
            ml: { md: `${drawerWidth}px` }, // Odsazení pro desktop
          }}
        >
          {/* 1) HeroSection (Termín + místo + tlačítka) */}
          <HeroSection />

          {/* HLAVNÍ OBSAH */}
          <Container maxWidth="lg" sx={{ py: 5 }}>
            {/* 2) Prolog o akci */}
            <PrologSection />
            <Divider sx={{ mb: 5 }} />


            {/* 3) Koho podporujeme */}
            <MilestonesSection />
            <Divider sx={{ mb: 5 }} />

            {/* 3) Koho podporujeme */}
            <SupportSection/>
            <Divider sx={{ mb: 5 }} />

            {/* 4) Pravidla závodu */}
            <RulesSection />
            <Divider sx={{ mb: 5 }} />

            {/* 5) Mapa závodu */}
            <MapSection />
            <Divider sx={{ mb: 5 }} />

            {/* 7) Zázemí závodu */}
            <FacilitiesSection />
            <Divider sx={{ mb: 5 }} />

            {/* 8) Sponzoři */}
            <SponsorsSection
              sponsors={sponsorsFilteredAndSorted}
              onSelectSponsor={handleSelectSponsor}
            />
            <Divider sx={{ mb: 5 }} />

            {/* 9) Kontakt */}
            <ContactSection />
          </Container>

          {/* PATIČKA */}
          <Box
            component="footer"
            sx={{
              textAlign: "center",
              py: 2,
              backgroundColor:
                theme.palette.mode === "dark" ? "#333" : "#f7f7f7",
              mt: 5,
            }}
          >
            <Typography variant="body2">
            Pravěk v Ráji 2025
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* DIALOG - detail sponzora */}
      <SponsorDialog sponsor={selectedSponsor} onClose={handleCloseSponsorDialog} />
    </ThemeProvider>
  );
}
