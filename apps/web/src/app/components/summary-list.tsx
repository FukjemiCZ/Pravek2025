"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import SummaryYear from "./summary-year";
import { SummaryData } from "../types/summary";
import { EVENT_CONFIG } from "@/app/event-config";

export default function SummaryList() {
  const [data, setData] = useState<SummaryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/summary");
        const j = await r.json();
        setData(j.summaries || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const historyData = data.filter((item) => item.year !== EVENT_CONFIG.year);

  if (historyData.length === 0) {
    return <Typography>Žádné minulé ročníky nebyly nalezeny.</Typography>;
  }

  const sorted = historyData.sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <Box>
      {sorted.map((s) => (
        <section key={s.year} id={`year-${s.year}`}>
          <SummaryYear summary={s} />
        </section>
      ))}
    </Box>
  );
}
