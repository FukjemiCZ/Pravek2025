"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import SummaryYear from "./summary-year";
import { SummaryData } from "../types/summary";

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

  if (data.length === 0) {
    return <Typography>Žádné ročníky nebyly nalezeny.</Typography>;
  }

  const sorted = data.sort((a, b) => Number(b.year) - Number(a.year));

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
