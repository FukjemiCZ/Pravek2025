"use client";

import * as React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Collapse,
  Divider,
  IconButton,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import { MENU_SECTIONS } from "@/app/menu-config";

type Props = {
  menuType: "home" | "race" | "charity";
  darkMode: boolean;
  handleToggleDarkMode: () => void;
};

export default function DesktopMenu({
  menuType,
  darkMode,
  handleToggleDarkMode,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // automaticky otevřená sekce podle page
  const [openSections, setOpenSections] = React.useState(() => {
    const initial: Record<string, boolean> = {};
    MENU_SECTIONS.forEach((sec) => {
      initial[sec.key] = sec.key === menuType;
    });
    return initial;
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const smoothScroll = (anchor: string) => {
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleClick = (item: { href: string; page?: string }) => {
    if (item.page && item.page !== pathname) {
      router.push(item.page + item.href);
      return;
    }

    if (item.href.startsWith("#")) smoothScroll(item.href);
    else router.push(item.href);
  };

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        overflowY: "auto",
        pt: 3,
        textAlign: "center",
      }}
    >
      {/* LOGO */}
      <Box
        sx={{
          mb: 2,
          width: 150,
          height: 150,
          borderRadius: "50%",
          overflow: "hidden",
          mx: "auto",
        }}
      >
        <Image
          src="/img/logo25.webp"
          alt="Logo"
          width={150}
          height={150}
          style={{ objectFit: "contain", background: "white" }}
        />
      </Box>

      {/* NADPIS */}
      <Box
        sx={{
          fontFamily: "Life Savers, sans-serif",
          mb: 3,
          fontSize: "1.1rem",
        }}
      >
        <strong>PRAVĚK V RÁJI</strong>
        <br />
        14. 5.–17. 5. 2026
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* COLLAPSIBLE MENU */}
      <List sx={{ width: "100%" }}>
        {MENU_SECTIONS.map((section, i) => {
          const isOpen = openSections[section.key] ?? false;

          return (
            <Box key={section.key}>
              {/* HLAVIČKA SEKCE */}
              <ListItemButton onClick={() => toggleSection(section.key)}>
                <ListSubheader
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    lineHeight: "1.4",
                    ml: -2,
                  }}
                >
                  {section.label}
                </ListSubheader>

                {isOpen ? (
                  <ExpandLess sx={{ ml: "auto" }} />
                ) : (
                  <ExpandMore sx={{ ml: "auto" }} />
                )}
              </ListItemButton>

              {/* ROZBALENÉ POLOŽKY */}
              <Collapse
                in={isOpen}
                unmountOnExit
                sx={{
                  ml: 1,
                  animation: "collapseFade 0.25s ease-out",
                  "@keyframes collapseFade": {
                    "0%": { opacity: 0, transform: "translateY(-5px)" },
                    "100%": { opacity: 1, transform: "translateY(0px)" },
                  },
                }}
              >
                {section.items.map((item) => (
                  <ListItemButton
                    key={item.text}
                    sx={{ pl: 4 }}
                    onClick={() => handleClick(item)}
                  >
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                ))}
              </Collapse>

              {/* ODDĚLOVAČ */}
              {i < MENU_SECTIONS.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          );
        })}
      </List>

      {/* DARK MODE */}
      <IconButton sx={{ mt: 2 }} onClick={handleToggleDarkMode}>
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Box>
  );
}
