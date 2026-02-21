// src/app/components/DynamicButton.tsx

"use client";

import React from "react";
import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
} from "@mui/material";
import { useButtons, ButtonItem } from "@/app/lib/button-context";
import { useDialog } from "@/app/lib/dialog-context";

// Import ikon, které plánujete používat (musí odpovídat hodnotám IconName v tabulce):
import NavigationIcon from "@mui/icons-material/Navigation";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ListAltIcon from "@mui/icons-material/ListAlt";
// … Další ikony podle potřeby …

/**
 * Mapa názvu v tabulce (IconName) → komponenta z @mui/icons-material
 */
const iconMap: Record<string, React.ElementType> = {
  Navigation: NavigationIcon,
  Facebook:   FacebookIcon,
  Instagram:  InstagramIcon,
  Search:     SearchIcon,
  PersonAdd:  PersonAddIcon,
  HowToReg:   HowToRegIcon,
  CreditCard: CreditCardIcon,
  ListAlt:    ListAltIcon,
  // … ostatní podle toho, co máte v Google Sheets …
};

interface DynamicButtonProps extends ButtonProps {
  /**
   * ID tlačítka definované v Google Sheets (povinné).
   */
  buttonId: string;
  /**
   * Pokud z nějakého důvodu chcete přepsat chování onClick (např. zavolat vlastní handleSearch()),
   * předáte sem funkci. Pokud ne, DynamicButton použije `actionType`/`actionPayload` z tabulky.
   */
  overrideOnClick?: () => void;
  /**
   * Když chcete, aby se vykreslilo jako IconButton (tj. kruhové tlačítko s ikonou),
   * předáte sem `"iconButton"`. V opačném případě (nebo když necháte undefined),
   * vykreslí se klasické `<Button>` s textem a (volitelnou) ikonou vlevo.
   */
  variantType?: "button" | "iconButton";
  /**
   * Volitelné props, které se mají předat do <IconButton> (např. size, sx atd.).
   */
  iconButtonProps?: IconButtonProps;
}

export default function DynamicButton({
  buttonId,
  overrideOnClick,
  variantType,
  iconButtonProps,
  ...muiProps
}: DynamicButtonProps) {
  const { buttons, loading, error } = useButtons();
  const { openDialog } = useDialog();

  if (loading) {
    return null; // Nebo skeleton, pokud chcete vizuálně indikovat „loading“
  }
  if (error) {
    return null; // Nebo fallback tlačítko, ale pro přehlednost: nic
  }

  const config: ButtonItem | undefined = buttons[buttonId];
  if (!config) {
    console.error(`Button s ID "${buttonId}" nebyl nalezen v konfiguraci.`);
    return null;
  }

  // 1) Pokud je status "Skryté", taučíko se vůbec nevykreslí
  if (config.status === "Skryté") {
    return null;
  }

  // 2) Rozhodneme, jestli bude <IconButton> nebo <Button>. Priorita:
  //    a) Když explicitně předáte prop variantType="iconButton" → použijeme IconButton.
  //    b) Nebo když config.label === "" (tj. v tabulce Label nechcete zobrazit) → také IconButton.
  //    c) Jinak se to vykreslí jako běžné <Button>.
  const renderAsIconButton =
    variantType === "iconButton" || config.label.trim() === "";

  // 3) Zakázání: pokud je status "Zakázané", disabled = true, jinak (status=="Funkční") disabled=false.
  const disabled = config.status === "Zakázané";

  // 4) Najdeme komponentu ikony (pokud je definováno config.iconName)
  let IconComponent: React.ElementType | null = null;
  if (config.iconName) {
    const found = iconMap[config.iconName];
    if (found) {
      IconComponent = found;
    } else {
      console.warn(
        `IconName "${config.iconName}" není v iconMap, tlačítko bez ikony.`
      );
    }
  }

  // 5) Definice onClick: buď overrideOnClick, jinak podle actionType/actionPayload
  const handleClick = () => {
    if (overrideOnClick) {
      overrideOnClick();
      return;
    }
    switch (config.actionType) {
      case "dialog":
        if (config.actionPayload) {
          openDialog(config.actionPayload);
        }
        break;
      case "navigate":
      case "externalLink":
        if (config.actionPayload) {
          window.open(config.actionPayload, "_blank");
        }
        break;
      case "apiCall":
        if (config.actionPayload) {
          // Např. fetch(config.actionPayload).then(...)
        }
        break;
      default:
        console.warn(`Neznámý actionType: ${config.actionType}`);
        break;
    }
  };

  // 6) Konečné renderování:
  if (renderAsIconButton) {
    // Pokud chceme ikonku bez textu, vykreslíme <IconButton>
    return (
      <IconButton
        disabled={disabled}
        onClick={handleClick}
        {...iconButtonProps}
      >
        {IconComponent ? <IconComponent fontSize="large" /> : null}
      </IconButton>
    );
  }

  // Jinak vykreslíme běžné <Button> s textem a ikonou vlevo
  return (
    <Button
      variant={config.variant as ButtonProps["variant"]}
      color={config.color as ButtonProps["color"]}
      disabled={disabled}
      onClick={handleClick}
      startIcon={IconComponent ? <IconComponent /> : undefined}
      {...muiProps}
    >
      {config.label}
    </Button>
  );
}
