// src/app/menu-config.ts

import FlagIcon from "@mui/icons-material/Flag";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MapIcon from "@mui/icons-material/Map";

export const MENU_SECTIONS = [
  {
    key: "home",
    label: "Home",
    items: [
      { text: "Úvod", href: "#home", page: "/home" },
      { text: "Kontakt", href: "#kontakt", page: "/home" },
    ],
  },
  {
    key: "charity",
    label: "Podpořit",
    items: [
      { text: "Eliščin příběh", href: "#beneficient", page: "/charity" },
      { text: "Sponzoři", href: "#sponzori", page: "/charity" },    ],
  },
  {
    key: "race",
    label: "Závodit",
    items: [
      { text: "Startovka", href: "#startovka", page: "/race" },
      { text: "Pravidla závodu", href: "#pravidla", page: "/race" },
      { text: "Mapa závodu", href: "#mapa", page: "/race" },
      { text: "Zázemí", href: "#zazemi", page: "/race" },
    ],
  },{
    key: "history",
    label: "Historie ročníků",
    items: [
      { text: "2025", href: "#year-2025", page: "/history" },
      { text: "2024", href: "#year-2024", page: "/history" },
    ],
  },
] as const;

export const BOTTOM_MENU = [
  {
    key: "race",
    label: "Závodit",
    href: "/race",
    icon: FlagIcon,
  },
  {
    key: "navigate",
    label: "Dorazit na místo",
    href: "https://maps.google.com/?q=Vyskeř",
    icon: MapIcon,
    isFab: true,
  },
  {
    key: "charity",
    label: "Podpořit",
    href: "/charity",
    icon: FavoriteIcon,
  },
] as const;
