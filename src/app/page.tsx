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
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { useDarkMode, createCustomTheme, ThemeProvider, CssBaseline } from "./theme";
import DrawerContent from "./components/drawer-content";
import HeroSection from "./components/hero-section";
import ArticleCards from "./components/article-cards";
import RulesSection from "./components/rules-section";
import MapSection from "./components/map-section";
import FacilitiesSection from "./components/facilities-section";
import ContactSection from "./components/contact-section";
import PersonSection from "./components/person-section";
import SponsorsSection from "./components/sponsors-section";
import SponsorDialog, { Sponsor } from "./components/sponsor-dialog";
import SummarySection from "./components/sumary-section";
import PeopleSection from "./components/people-section"; 
import { Analytics } from "@vercel/analytics/react";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

const drawerWidth = 240;
const CURRENT_YEAR = 2025;

export default function HomePage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [selectedSponsor, setSelectedSponsor] = React.useState<Sponsor | null>(null);
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [loading, setLoading] = React.useState(true);

  const theme = createCustomTheme(darkMode);
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSelectSponsor = (sponsor: Sponsor) => setSelectedSponsor(sponsor);
  const handleCloseSponsorDialog = () => setSelectedSponsor(null);

  React.useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch("/api/sponsors");
        const data = await res.json();
        setSponsors(data.sponsors || []);
      } catch (error) {
        console.error("Chyba při načítání sponzorů:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  const sponsorsFilteredAndSorted = sponsors
    .filter((s) => s.years.includes(CURRENT_YEAR))
    .map((sponsor) => ({ ...sponsor, position: sponsor.position ?? Infinity }))
    .sort((a, b) => a.position - b.position);

  return (
    <ThemeProvider theme={theme}>
      <Analytics />
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

        {/* Stálý drawer pro desktop */}
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

        {/* Mobilní drawer */}
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

        {/* Hlavní obsah */}
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
            <PeopleSection />
            <Divider sx={{ mb: 5 }} />
            <ArticleCards />
            <Divider sx={{ mb: 5 }} />
            <PersonSection />
            <Divider sx={{ mb: 5 }} />
            <RulesSection />
            <Divider sx={{ mb: 5 }} />
            <MapSection />
            <Divider sx={{ mb: 5 }} />
            <FacilitiesSection />
            <Divider sx={{ mb: 5 }} />

            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Načítám sponzory...</Typography>
              </Box>
            ) : (
              <SponsorsSection
                sponsors={sponsorsFilteredAndSorted}
                onSelectSponsor={handleSelectSponsor}
              />
            )}

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
            <IconButton
            component="a"
            href="https://www.facebook.com/profile.php?id=61575857402058"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon fontSize="large" />
          </IconButton>
          <IconButton
            component="a"
            href="https://www.instagram.com/pravekvraji"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon fontSize="large" />
          </IconButton>
          </Box>
        </Box>
      </Box>

      <SponsorDialog sponsor={selectedSponsor} onClose={handleCloseSponsorDialog} />
    </ThemeProvider>
  );
}
