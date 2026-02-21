"use client";

import { Divider, List, ListItemButton, ListItemText, ListSubheader } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

type NavItem = { label: string; path: string };

export default function SideNav({ onNavigate }: { onNavigate?: () => void }) {
    const router = useRouter();
    const pathname = usePathname();

    const go = (p: string) => {
        router.push(p);
        onNavigate?.();
    };

    const group1: NavItem[] = [
        { label: "Overview", path: "/" },
        { label: "Architecture", path: "/architecture" },
        { label: "API Docs", path: "/swagger" },
    ];

    const group2: NavItem[] = [
        { label: "Roadmap", path: "/roadmap" },
        { label: "Ownership", path: "/ownership" },
    ];

    const group3: NavItem[] = [
        { label: "Operations", path: "/operations" },
        { label: "Releases", path: "/releases" },
        { label: "Readiness", path: "/readiness" },
        { label: "Issues", path: "/issues" },
    ];

    return (
        <List
            subheader={
                <ListSubheader component="div" sx={{ fontWeight: 700 }}>
                    Portal
                </ListSubheader>
            }
            sx={{ width: 260 }}
        >
            {group1.map((i) => (
                <ListItemButton
                    key={i.path}
                    selected={pathname === i.path}
                    onClick={() => go(i.path)}
                >
                    <ListItemText primary={i.label} />
                </ListItemButton>
            ))}

            <Divider sx={{ my: 1 }} />

            <ListSubheader component="div" sx={{ fontWeight: 700 }}>
                Governance
            </ListSubheader>

            {group2.map((i) => (
                <ListItemButton
                    key={i.path}
                    selected={pathname === i.path}
                    onClick={() => go(i.path)}
                >
                    <ListItemText primary={i.label} />
                </ListItemButton>
            ))}

            <Divider sx={{ my: 1 }} />

            <ListSubheader component="div" sx={{ fontWeight: 700 }}>
                Operations
            </ListSubheader>

            {group3.map((i) => (
                <ListItemButton
                    key={i.path}
                    selected={pathname === i.path}
                    onClick={() => go(i.path)}
                >
                    <ListItemText primary={i.label} />
                </ListItemButton>
            ))}
        </List>
    );
}