"use client";

import * as React from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Image from "next/image";

// Položky menu
const menuItems = [
  { text: "O akci", href: "#home" },
  { text: "Koho podporujeme", href: "#koho-podporujeme" },
  { text: "Pravidla závodu", href: "#pravidla" },
  { text: "Mapa závodu", href: "#mapa" },
  { text: "Zázemí", href: "#zazemi" },
  { text: "Sponzoři", href: "#sponzori" },
  { text: "Kontakt", href: "#kontakt" },
  { text: "Ročníky 2025", href: "#summary2025" },
  { text: "Ročníky 2024", href: "#summary2024" },
];

interface DrawerContentProps {
  isDesktop: boolean;
  handleDrawerToggle: () => void;
  darkMode: boolean;
  handleToggleDarkMode: () => void;
}

export default function DrawerContent({
  isDesktop,
  handleDrawerToggle,
  darkMode,
  handleToggleDarkMode,
}: DrawerContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Funkce pro hladký scroll po kliknutí na položku menu
  const handleSmoothScroll = (anchor: string) => {
    // Pokud jsme na mobilu, nejdříve zavřít Drawer
    if (!isDesktop) {
      handleDrawerToggle();
    }

    // Timeout malinko odsune spuštění scrollu,
    // aby se Drawer stihl zavřít a neskákalo to
    setTimeout(() => {
      const element = document.querySelector(anchor);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

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
          mb: 1,
          textAlign: "center",
          display: "inline-block",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          src="/img/logo25.webp"
          alt="Ruffian's Legend"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            backgroundColor: "white",
          }}
        />
      </Box>

      {/* Text pod logem */}
      <Box
        sx={{
          fontFamily: "Life Savers, Life-Savers-Fallback, Noto Color Emoji, sans-serif",
          fontSize: isDesktop ? "1.2rem" : "1rem",
          textAlign: "center",
          lineHeight: "1.5",
          mb: 3,
          display: isMobile ? "none" : "block",
        }}
      >
        <strong>PRAVĚK V RÁJI</strong>
        <br />
        15.5.-18.5.2025 Vyskeř
      </Box>

      {/* Menu */}
      <List sx={{ textAlign: "center" }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            // Odstraníme component="a" i href a přidáme onClick:
            onClick={() => handleSmoothScroll(item.href)}
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
