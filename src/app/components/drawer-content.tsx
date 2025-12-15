"use client";

import * as React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  alpha,
  useMediaQuery,
  useTheme,
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
  isDesktop: boolean;
  handleDrawerToggle: () => void;
  darkMode: boolean;
  handleToggleDarkMode: () => void;
};

export default function DrawerContent({
  menuType,
  isDesktop,
  handleDrawerToggle,
  darkMode,
  handleToggleDarkMode,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const highlight = theme.palette.primary.main;

  /** AUTO-OPEN ACTIVE SECTION */
  const [open, setOpen] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MENU_SECTIONS.forEach((sec) => (initial[sec.key] = sec.key === menuType));
    return initial;
  });

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /** NAVIGATION HANDLING */
  const handleClickItem = (item: { href: string; page?: string }) => {
    if (!isDesktop) handleDrawerToggle();

    if (item.page && item.page !== pathname) {
      router.push(item.page + item.href);
      return;
    }

    setTimeout(() => {
      const el = document.querySelector(item.href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        py: 3,
        px: 2,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* LOGO — čisté, bez bordelu */}
      <Box
        sx={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          overflow: "hidden",
          mx: "auto",
          mb: 1,
        }}
      >
        <Image
          src={process.env.NEXT_PUBLIC_LOGO!}
          alt="logo"
          width={150}
          height={150}
          style={{ objectFit: "contain", background: "#fff" }}
        />
      </Box>

      {/* NADPIS */}
      {!isMobile && (
        <Box
          sx={{
            textAlign: "center",
            fontFamily:
              "Life Savers, Life-Savers-Fallback, Noto Color Emoji, sans-serif",
            fontSize: "1.15rem",
            fontWeight: 600,
            lineHeight: 1.35,
            mb: 3,
            userSelect: "none",
          }}
        >
          PRAVĚK V RÁJI
          <br />
          <span style={{ fontSize: "0.95rem", opacity: 0.8 }}>
            14.5.–17.5.2026
          </span>
        </Box>
      )}

      {/* ULTRA-MINIMAL NAVIGATION */}
      <List sx={{ width: "100%" }}>
        {MENU_SECTIONS.map((section) => {
          const isOpen = open[section.key];

          return (
            <Box key={section.key} sx={{ mb: 1 }}>
              {/* SECTION HEADER — Apple style */}
              <ListItemButton
                onClick={() => toggle(section.key)}
                sx={{
                  px: 1,
                  py: 1,
                  borderLeft: isOpen
                    ? `4px solid ${highlight}`
                    : "4px solid transparent",
                  borderRadius: 0,
                  transition: "border-color 0.25s ease",
                  "&:hover": {
                    backgroundColor: alpha(highlight, 0.05),
                  },
                }}
              >
                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                />
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              {/* SUBITEMS */}
              <Collapse in={isOpen} unmountOnExit timeout={200}>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.page &&
                    typeof window !== "undefined" &&
                    window.location.hash === item.href;

                  return (
                    <ListItemButton
                      key={item.text}
                      onClick={() => handleClickItem(item)}
                      sx={{
                        pl: 4,
                        py: 0.9,
                        borderRadius: "12px",
                        mx: 0.5,
                        mb: 0.3,
                        backgroundColor: isActive
                          ? alpha(highlight, 0.12)
                          : "transparent",
                        transition: "background-color 0.15s ease",
                        "&:hover": {
                          backgroundColor: alpha(highlight, 0.08),
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: "0.9rem",
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </Collapse>
            </Box>
          );
        })}
      </List>

      {/* DARK MODE — minimalisticky u dna */}
      <IconButton
        onClick={handleToggleDarkMode}
        sx={{
          mt: "auto",
          mx: "auto",
          opacity: 0.6,
          "&:hover": { opacity: 1 },
        }}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Box>
  );
}
