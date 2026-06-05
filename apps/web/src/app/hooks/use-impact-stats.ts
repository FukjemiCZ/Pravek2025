"use client";

import { useEffect, useState } from "react";

import { EVENT_CONFIG } from "../event-config";
import { SummaryData, SummariesResponse } from "../types/summary";

export type ImpactStats = {
  amount: number;
  years: number;
};

type ImpactStatsState = {
  stats: ImpactStats | null;
  loading: boolean;
  error: boolean;
};

let cachedStats: ImpactStats | null = null;
let inflightRequest: Promise<ImpactStats> | null = null;

export function parseCzkAmount(value: string): number {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

export function formatCzkAmount(value: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatYearsCount(count: number): string {
  if (count === 1) {
    return "1 uzavřený ročník";
  }

  if (count >= 2 && count <= 4) {
    return `${count} uzavřené ročníky`;
  }

  return `${count} uzavřených ročníků`;
}

async function fetchImpactStats(): Promise<ImpactStats> {
  if (cachedStats) {
    return cachedStats;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = fetch("/api/summary", {
    cache: "no-store",
  })
    .then(async (response) => {
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

      cachedStats = {
        amount,
        years: historicalSummaries.length,
      };

      return cachedStats;
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}

export function useImpactStats(): ImpactStatsState {
  const [stats, setStats] = useState<ImpactStats | null>(cachedStats);
  const [loading, setLoading] = useState(!cachedStats);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (cachedStats) {
      setStats(cachedStats);
      setLoading(false);
      setError(false);
      return;
    }

    fetchImpactStats()
      .then((result) => {
        if (!cancelled) {
          setStats(result);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    stats,
    loading,
    error,
  };
}