"use client";

import { alpha, Box, Skeleton, Typography } from "@mui/material";

import {
  formatCzkAmount,
  formatYearsCount,
  useImpactStats,
} from "../hooks/use-impact-stats";

type ImpactMiniSummaryProps = {
  placement: "mobileAppBar" | "drawer";
};

export default function ImpactMiniSummary({ placement }: ImpactMiniSummaryProps) {
  const { stats, loading, error } = useImpactStats();

  if (error) return null;

  if (placement