"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { EVENT_CONFIG } from "@/app/event-config";
import { SummaryData } from "@/app/types/summary";

type ImpactSummaryProps = {
  variant?: "home" | "history";
};

function parseAmount(amount: string) {
  const normalized = amount.replace(/[^0-9]/g, "");
  return normalized ? Number(normalized) : 0;
}

function formatCurrency(amount: number) {
  return new Intl