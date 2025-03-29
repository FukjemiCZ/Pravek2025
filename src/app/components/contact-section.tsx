"use client";

import * as React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import Image from 'next/image';

export default function ContactSection() {
  return (
    <Box id="kontakt" sx={{ mb: 5, p: 3, backgroundColor: (theme) =>
      theme.palette.mode === "light" ? "#f9f9f9" : "#333333", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
        Kontakt
      </Typography>
      <Box
        sx={{
          display: { xs: "block", md: "flex" },
          justifyContent: "center",
          alignItems: "stretch",
          gap: 4,
        }}
      >
        <Card
          sx={{
            maxWidth: { xs: "100%", md: 600 },
            boxShadow: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            padding: 2,
            flex: "0 0 auto",
          }}
        >
          <Box
            sx={{
              mb: { xs: 2, md: 3 },
              textAlign: "center",
              display: "inline-block",
              width: "150px",
              height: "150px",
              backgroundColor: "white",
              borderRadius: "50%",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              marginRight: { xs: 0, md: 3 },
            }}
          >
            <Image
              src="/img/logo25.webp"
              alt="Profilová fotka"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <PersonIcon sx={{ color: "#1976d2", marginRight: 1 }} />
              <Typography variant="h6">Monika Mundilová</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <LocationOnIcon sx={{ color: "#1976d2", marginRight: 1 }} />
              <Typography variant="body1">Vyskeř</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <PhoneIcon sx={{ color: "#1976d2", marginRight: 1 }} />
              <Typography variant="body1">+420 773 700 489</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EmailIcon sx={{ color: "#1976d2", marginRight: 1 }} />
              <Typography variant="body1">pravekvraji@seznam.cz</Typography>
            </Box>
          </CardContent>
        </Card>
        <Box sx={{ flex: 1, height: "100%" }}>
          <iframe
            title="Location Map"
            src="https://frame.mapy.cz/s/fotesatudu"
            width="100%"
            height="100%"
            style={{ border: "none" }}
            loading="lazy"
          ></iframe>
        </Box>
      </Box>
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body1" paragraph>
        Na organizaci akce se podílí mnoho dalších skvělých lidí. Tímto bych jim chtěla poděkovat. Takže jmenovitě: Jaroslav Zemánek, Honza Prášil, Jana Kalinová, Petr Dvořák, Hannnz, Jana Raczová a pomoc nabídl i spřátelený DT Košťálov a Helča Bayerová. Akce zároveň probíhá ve spolupráci se Sportovní klub ČSV & spol. Děkuji všem! :-)
        </Typography>
      </Box>
    </Box>
  );
}
