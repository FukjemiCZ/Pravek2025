// app/components/sponsors-section.tsx

"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import type { Sponsor } from "./sponsor-dialog"; // Importujeme interface Sponsor

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  onSelectSponsor: (sponsor: Sponsor) => void;
}

export default function SponsorsSection({
  sponsors,
  onSelectSponsor,
}: SponsorsSectionProps) {
  return (
    <Box id="sponzori" sx={{ mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Sponzoři akce
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        {sponsors.map((sponsor) => (
          <Grid item xs={12} sm={6} md={4} key={sponsor.name}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {/* Kontejner pro logo (uprostřed) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 150,
                  p: 2,
                }}
              >
                <CardMedia
                  component="img"
                  alt={`Logo ${sponsor.name}`}
                  src={sponsor.logo}
                  sx={{
                    objectFit: "contain", // Zachování poměru stran
                    margin: "auto",
                    maxHeight: 120, // Nastavení maximální výšky
                    maxWidth: "90%", // Přidání maximální šířky
                    width: "90%",
                    pt: 2,
                    backgroundColor: "white", // Volitelné - bílý podklad pro lepší kontrast
                  }}
                />
              </Box>
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <Typography variant="h6">{sponsor.name}</Typography>
                <Box mt={2} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onSelectSponsor(sponsor)}
                  >
                    Detail
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    component="a"
                    href={sponsor.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Web
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
