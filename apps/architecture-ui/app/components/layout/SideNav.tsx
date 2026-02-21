// components/layout/SideNav.tsx
"use client";

import { List, ListItemButton, ListItemText } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

export default function SideNav() {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { label: "Overview", path: "/" },
    { label: "Architecture", path: "/architecture" },
  ];

  return (
    <List>
      {items.map((item) => (
        <ListItemButton
          key={item.path}
          selected={pathname === item.path}
          onClick={() => router.push(item.path)}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );
}