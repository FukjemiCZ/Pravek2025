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
    return "1 uzavřený ročník";
  }

  if (count >= 2 && count <= 4) {
    return `${count} uzavřené ročníky`;
  }

  return `${count} uzavřených ročníků`;
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
        Souhrn pomoci se nepodařilo načíst.
      </Alert>
    );
  }

  const note =
    variant === "history"
      ? "Součet vychází z částek uvedených u jednotlivých ročníků níže."
      : "Počítáno z částek uvedených u minulých ročníků.";

  return (
    <Card
      component="section"
      sx={{
        borderRadius: 3,
        boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 3, md: 4 },
          display: { xs: "block", md: "flex" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <Box>
          <Typography
            component="p"
            variant="overline"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Souhrn uzavřených ročníků
          </Typography>

          <Typography
            component="p"
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {formatYearsCount(impact.years)}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: { xs: 2.5, md: 0 },
            textAlign: { xs: "left", md: "right" },
          }}
        >
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.8rem" },
              lineHeight: 1.05,
            }}
          >
            {formatCzkAmount(impact.amount)}
          </Typography>

          <Typography
            component="p"
            variant="h6"
            sx={{
              mt: 0.75,
              fontWeight: 700,
            }}
          >
            předáno na pomoc dětem
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              maxWidth: 420,
              ml: { xs: 0, md: "auto" },
            }}
          >
            {note}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}