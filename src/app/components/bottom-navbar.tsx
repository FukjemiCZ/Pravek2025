"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import Typography from "@mui/material/Typography";

import { BOTTOM_MENU } from "@/app/menu-config";

export default function BottomNavBar() {
  const pathname = usePathname();

  const haptic = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  return (
    <Paper
      elevation={12}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "flex", md: "none" },
        height: 90,
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        pt: 1,
        backgroundColor: "white",
        borderRadius: "22px 22px 0 0",
        zIndex: 2000,
        animation: "menuSlideUp 0.85s ease-out",
        "@keyframes menuSlideUp": {
          "0%": { transform: "translateY(100%)", opacity: 0 },
          "70%": { transform: "translateY(0)", opacity: 1 },
          "85%": { transform: "translateY(-3px)" },
          "100%": { transform: "translateY(0)" },
        },
      }}
    >
      {BOTTOM_MENU.map((item) => {
        const Icon = item.icon;

        if ("isFab" in item && item.isFab) {
          return (
            <Box
              key={item.key}
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 4000,
              }}
            >
              <Fab
                color="primary"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={haptic}
                sx={{
                  width: 64,
                  height: 64,
                  mb: 1,
                  boxShadow: 6,
                }}
              >
                <Icon sx={{ fontSize: 30 }} />
              </Fab>

              <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary" }}>
                {item.label}
              </Typography>
            </Box>
          );
        }

        return (
          <Box
            key={item.key}
            component={Link}
            href={item.href}
            onClick={haptic}
            sx={{
              flex: 1,
              textDecoration: "none",
              color: pathname.startsWith(`/${item.key}`)
                ? "primary.main"
                : "text.secondary",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <IconButton disableRipple sx={{ p: 0 }}>
              <Icon />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: 11, mt: -0.5 }}>
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}
