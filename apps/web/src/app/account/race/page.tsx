"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";

import AppShell from "../../app-shell";
import RaceProgressSection from "@/app/components/race-progress-section";
import WeatherSection from "@/app/components/weather-section";


// =============================================================
// MOCK API (nahradíš reálným voláním)
// =============================================================
const user = {
  isRegistered: false,
  isPaid: false,
  bibNumber: 101,
};

const RACE_START = new Date("2026-05-14T06:00:00");
// =============================================================


// Formátování odpočtu – včetně dnů
function formatCountdown(ms: number) {
  if (ms <= 0) return "0d 00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);

  const hours = Math.floor((totalSeconds % 86400) / 3600)
    .toString()
    .padStart(2, "0");

  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${days}d ${hours}:${minutes}:${seconds}`;
}


export default function RacePage() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const msToStart = RACE_START.getTime() - now;
  const raceOpen = msToStart <= 0;


  // ---------------------------------------------------------
  // PODMÍNKY ZOBRAZENÍ (POŘADÍ DLE POŽADAVKU)
  // 1) není registrován
  // 2) nemá zaplaceno
  // 3) countdown
  // 4) závodní obsah
  // ---------------------------------------------------------

  const notRegistered = !user.isRegistered;
  const notPaid = user.isRegistered && !user.isPaid;
  const showCountdown = user.isRegistered && user.isPaid && !raceOpen;
  const canEnter = user.isRegistered && user.isPaid && raceOpen;


  return (
    <AppShell menuType="race">
      <Container maxWidth="lg" sx={{ py: 5 }}>

        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Průběh závodu – Pravěk v ráji
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Sledujte svůj postup na trase a potvrzujte průchody během závodu.
        </Typography>

        {/* ================================================================= */}
        {/* 1) UPOZORNĚNÍ – NEJSTE REGISTROVÁN */}
        {/* ================================================================= */}
        {notRegistered && (
          <Card sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" color="error">
              Nejste přihlášen k závodu.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Zaregistrujte se v sekci <strong>Můj účet → Rodinní členové</strong>.
            </Typography>
          </Card>
        )}

        {/* ================================================================= */}
        {/* 2) UPOZORNĚNÍ – NEMÁTE ZAPLACENO */}
        {/* ================================================================= */}
        {notPaid && (
          <Card sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" color="warning.main">
              Nemáte zaplaceno startovné.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Pro vstup do závodní sekce je třeba mít zaplacené startovné.
            </Typography>
          </Card>
        )}

        {/* ================================================================= */}
        {/* 3) COUNTDOWN DO STARTU */}
        {/* ================================================================= */}
        {showCountdown && (
          <Card sx={{ p: 3, mb: 4, textAlign: "center" }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Závod ještě nezačal
            </Typography>

            <Typography sx={{ mb: 2 }}>
              Startovní pole se otevře za:
            </Typography>

            <Typography variant="h3" fontWeight="bold" color="primary">
              {formatCountdown(msToStart)}
            </Typography>

            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              Oficiální start: {RACE_START.toLocaleString()}
            </Typography>
          </Card>
        )}

        {/* ================================================================= */}
        {/* 4) ZÁVODNÍ SEKCE */}
        {/* ================================================================= */}
        {canEnter && (
          <>
            <RaceProgressSection
              startTime={null}
              startPhoto={null}
              finishTime={null}
              finishPhoto={null}
              checkpoints={[
                { id: "k1", name: "Kontrola 1", km: 12 },
                { id: "k2", name: "Kontrola 2", km: 22 },
                { id: "k3", name: "Kontrola 3", km: 35 },
              ]}
            />

            <Box sx={{ mt: 4, mb: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Aktuální počasí</Typography>
                  <WeatherSection />
                </CardContent>
              </Card>
            </Box>
          </>
        )}

      </Container>
    </AppShell>
  );
}
