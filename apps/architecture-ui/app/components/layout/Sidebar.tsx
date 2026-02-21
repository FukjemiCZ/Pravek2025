"use client";

import { Drawer, List, ListItemButton, ListItemText } from "@mui/material";
import Link from "next/link";

export default function Sidebar() {
  return (
    <Drawer variant="permanent">
      <List sx={{ width: 220 }}>
        <ListItemButton component={Link} href="/">
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton component={Link} href="/architecture">
          <ListItemText primary="Architecture" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}