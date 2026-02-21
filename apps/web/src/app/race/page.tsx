"use client";

import { useEffect } from "react";
import { Container, Divider, Box } from "@mui/material";

import AppShell from "../app-shell";
import PeopleSection from "../components/people-section";
import RulesSection from "../components/rules-section";
import MapSection from "../components/map-section";
import FacilitiesSection from "../components/facilities-section";
import Gallery from "../components/gallery";

export default function RacePage() {
  // AUTO-SCROLL NA #ANCHOR
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <AppShell menuType="race">
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <PeopleSection />
        <Divider sx={{ my: 5 }} />

        <div id="pravidla">
          <RulesSection />
        </div>
        <Divider sx={{ my: 5 }} />

        <div id="mapa">
          <MapSection />
        </div>
        <Divider sx={{ my: 5 }} />

        <div id="zazemi">
          <FacilitiesSection />
        </div>

        {/* ✅ Galerie na konec (filter: gallery == "race") */}
        <Divider sx={{ my: 5 }} />
        <Box id="galerie" sx={{ mt: 1 }}>

          <Gallery galleries="race" />
        </Box>
      </Container>
    </AppShell>
  );
}
