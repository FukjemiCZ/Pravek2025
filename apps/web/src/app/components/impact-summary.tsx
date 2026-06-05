"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

type ImpactSummaryProps = {
  variant?: "home" | "history";
};

export default function ImpactSummary({ variant = "home" }: ImpactSummaryProps) {
  const isHistory = variant === "history";

  return (
    <Card
      elevation