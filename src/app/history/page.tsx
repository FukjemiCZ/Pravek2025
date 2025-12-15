"use client";

import { Container } from "@mui/material";
import AppShell from "../app-shell";
import SummaryList from "../components/summary-list";
import { useEffect } from "react";

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
        <SummaryList />
      </Container>
    </AppShell>
  );
}
