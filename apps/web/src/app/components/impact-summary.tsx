"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";

import { EVENT_CONFIG } from "../event-config";
import { SummaryData, SummariesResponse } from "../types/summary";

type ImpactSummaryProps = {
  variant?: "home" | "history";
};

type ImpactState = {
  amount: number;
  years: number;
};

function parseCzkAmount(value: string): number {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function formatCzkAmount(value: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatYearsCount(count: number): string {
  if (count === 1) {
    return "1 ročník";
  }

  if (count >= 2 && count <= 4) {
    return `${count} ročníky`;
  }

  return `${count} ročníků`;
}

export default function ImpactSummary({
  variant = "home",
}: ImpactSummaryProps) {
  const [impact, setImpact] = useState<ImpactState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadImpact() {
      try {
        const response = await fetch("/api/summary", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Nepodařilo se načíst souhrn ročníků.");
        }

        const json: SummariesResponse = await response.json();
        const summaries: SummaryData[] = json.summaries || [];

        const historicalSummaries = summaries.filter(
          (summary) => summary.year !== EVENT_CONFIG.year
        );

        const amount = historicalSummaries.reduce((sum, summary) => {
          return sum + parseCzkAmount(summary.amount);
        }, 0);

        if (!cancelled) {
          setImpact({
            amount,
            years: historicalSummaries.length,
          });
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadImpact();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box
        component="section"
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !impact) {
    return (
      <Alert severity="warning">
        Souhrn předané pomoci se nepodařilo načíst.
      </Alert>
    );
  }

  const title =
    variant === "history"
      ? "Historie pomoci"
      : "Kolik jsme už společně předali";

  const description =
    variant === "history"
      ? `Za ${formatYearsCount(
          impact.years
        )} jsme společně pomohli celkovou částkou ${formatCzkAmount(
          impact.amount
        )}.`
      : `Za ${formatYearsCount(
          impact.years
        )} jsme společně předali nemocným dětem přesně ${formatCzkAmount(
          impact.amount
        )}.`;

  return (
    <Card
      component="section"
      sx={{
        borderRadius: 4,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,245,230,0.98))",
        boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 3, md: 5 },
          textAlign: { xs: "left", md: "center" },
        }}
      >
        <Typography
          component="p"
          variant="overline"
          sx={{
            color: "primary.main",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Benefiční dopad
        </Typography>

        <Typography
          component="h2"
          variant="h3"
          sx={{
            mt: 1,
            fontWeight: 800,
            fontSize: { xs: "2rem", md: "3rem" },
            lineHeight: 1.1,
          }}
        >
          {formatCzkAmount(impact.amount)}
        </Typography>

        <Typography
          component="h3"
          variant="h5"
          sx={{
            mt: 1.5,
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mt: 2,
            maxWidth: 760,
            mx: { xs: 0, md: "auto" },
            fontSize: { xs: "1rem", md: "1.1rem" },
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}