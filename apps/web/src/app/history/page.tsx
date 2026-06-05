"use client";

import { useEffect } from "react";
import { Container, Divider } from "@mui/material";

import AppShell from "../app-shell";
import SummaryList from "../components/summary-list";
import ImpactSummary from "../components/impact-summary";

export default function HistoryPage() {
  // Auto-scroll správně
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const el = document.querySelector(hash);
    if (!el) return;

    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, []);

  return (
    <AppShell menuType="charity">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ImpactSummary variant="history" />
        <Divider sx={{ my: 5 }} />
        <SummaryList />
      </Container>
    </AppShell>
  );
}