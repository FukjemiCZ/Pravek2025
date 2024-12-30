"use client";

import * as React from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Image from 'next/image';

interface DrawerContentProps {
  isDesktop: boolean;
  handleDrawerToggle: () => void;
  darkMode: boolean;
  handleToggleDarkMode: () => void;
}

// Položky menu
const menuItems = [
  { text: "O akci", href: "#home" },
  { text: "Milestones", href: "#milestones" },
  { text: "Koho podporujeme", href: "#koho-podporujeme" },
  { text: "Pravidla závodu", href: "#pravidla" },
  { text: "Mapa závodu", href: "#mapa" },
  { text: "Zázemí", href: "#zazemi" },
  { text: "Sponzoři", href: "#sponzori" },
  { text: "Kontakt", href: "#kontakt" },
];

export default function DrawerContent({
  isDesktop,
  handleDrawerToggle,
  darkMode,
  handleToggleDarkMode,
}: DrawerContentProps) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          mb: 3,
          textAlign: "center",
          display: "inline-block", // Aby se velikost Boxu přizpůsobila obsahu
          width: "150px", // Stejná šířka a výška pro kruh
          height: "150px", // Stejná výška jako šířka
          backgroundColor: "white", // Bílý podklad
          borderRadius: "50%", // Kulatý tvar
          overflow: "hidden", // Skryje přesah obrázku, pokud není přesně kulatý
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          src="/sponsors/ruffianslegend-logo.webp"
          alt="Ruffian's Legend"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </Box>

      {/* Menu */}
      <List sx={{ textAlign: "center" }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component="a"
            href={item.href}
            onClick={() => (isDesktop ? null : handleDrawerToggle())}
          >
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      {/* Přepínač Dark/Light */}
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <IconButton color="primary" onClick={handleToggleDarkMode}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}
