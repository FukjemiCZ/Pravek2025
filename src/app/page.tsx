"use client";

import * as React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Container,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { useDarkMode, createCustomTheme, ThemeProvider, CssBaseline } from "./theme";
import sponsorsData from "./data/sponsors";
import DrawerContent from "./components/drawer-content";
import HeroSection from "./components/hero-section";
import PrologSection from "./components/prolog-section";
import SupportSection from "./components/support-section";
import RulesSection from "./components/rules-section";
import MapSection from "./components/map-section";
import FacilitiesSection from "./components/facilities-section";
import ContactSection from "./components/contact-section";
import SponsorsSection from "./components/sponsors-section";
import MilestonesSection from "./components/milestones";
import SponsorDialog, { Sponsor } from "./components/sponsor-dialog";
import SummarySection from "./components/sumary-section";

const drawerWidth = 240;
const CURRENT_YEAR = 2024;

export default function HomePage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [selectedSponsor, setSelectedSponsor] = React.useState<Sponsor | null>(null);

  const theme = createCustomTheme(darkMode);

  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSelectSponsor = (sponsor: Sponsor) => setSelectedSponsor(sponsor);
  const handleCloseSponsorDialog = () => setSelectedSponsor(null);

  const sponsorsFilteredAndSorted = sponsorsData
    .filter((s) => s.years.includes(CURRENT_YEAR))
    .map((sponsor) => ({ ...sponsor, position: sponsor.position ?? Infinity }))
    .sort((a, b) => a.position - b.position);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{
            width: "100%",
            display: { xs: "block", md: "none" },
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

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
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
            handleToggleDarkMode={toggleDarkMode}
          />
        </Drawer>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
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
            handleToggleDarkMode={toggleDarkMode}
          />
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: 8, md: 0 },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <HeroSection />
          <Container maxWidth="lg" sx={{ py: 5 }}>
            <PrologSection />
            <Divider sx={{ mb: 5 }} />
            <MilestonesSection />
            <Divider sx={{ mb: 5 }} />
            <SupportSection />
            <Divider sx={{ mb: 5 }} />
            <RulesSection />
            <Divider sx={{ mb: 5 }} />
            <MapSection />
            <Divider sx={{ mb: 5 }} />
            <FacilitiesSection />
            <Divider sx={{ mb: 5 }} />
            <SponsorsSection
              sponsors={sponsorsFilteredAndSorted}
              onSelectSponsor={handleSelectSponsor}
            />
            <Divider sx={{ mb: 5 }} />
            <ContactSection />
            <Divider sx={{ mb: 5 }} />
            <SummarySection />
          </Container>

          <Box
            component="footer"
            sx={{
              textAlign: "center",
              py: 2,
              backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f7f7f7",
              mt: 5,
            }}
          >
            <Typography variant="body2">Benefiční dogtrekking Pravěk v Ráji 2025</Typography>
          </Box>
        </Box>
      </Box>

      <SponsorDialog sponsor={selectedSponsor} onClose={handleCloseSponsorDialog} />
    </ThemeProvider>
  );
}
