// app/components/sponsor-dialog.tsx

"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

// Rozhraní pro sponzora
export interface Sponsor {
  name: string;
  logo: string;
  description: string;
  link: string;
  years: number[];
  position: number;
}

interface SponsorDialogProps {
  sponsor: Sponsor | null;
  onClose: () => void;
}

export default function SponsorDialog({ sponsor, onClose }: SponsorDialogProps) {
  return (
    <Dialog open={Boolean(sponsor)} onClose={onClose} maxWidth="sm" fullWidth>
      {sponsor && (
        <>
          <DialogTitle>{sponsor.name}</DialogTitle>
          <DialogContent>
            <Card>
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
              <CardContent>
                <Typography variant="body1" paragraph sx={{ fontWeight: 600 }}>
                  {sponsor.name}
                </Typography>
                <Typography variant="body2" paragraph>
                  {sponsor.description}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  component="a"
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Navštívit web
                </Button>
              </CardContent>
            </Card>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
