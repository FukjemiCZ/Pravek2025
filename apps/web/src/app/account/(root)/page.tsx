"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
} from "@mui/material";

import Link from "next/link";

import AppShell from "../../app-shell";
import WeatherSection from "@/app/components/weather-section";
import DogSection from "@/app/components/dog-section";
import FamilySection from "@/app/components/family-section";
import type { FamilyMember } from "@/app/components/family-section";
import PaymentSelectionSection from "@/app/components/payment-selection-section";
import RaceProgressSection from "@/app/components/race-progress-section";


// MOCKS – replace with API later
const familyMembers: FamilyMember[] = [
  {
    id: "self",
    name: "Jan Novák",
    relation: "self",
    email: "jan.novak@example.com",
    phone: "+420 777 111 222",
    paymentStatus: "paid",
    startFee: 200,
    registrationStatus: "Zaregistrován",
    bibNumber: 101,
    pastStarts: 2,
    dogs: ["Ben", "Sára"],
    avatarUrl: "/avatars/jan.png",
  },
  {
    id: "2",
    name: "Eva Nováková",
    relation: "partner",
    email: "eva@example.com",
    phone: "+420 700 000 000",
    paymentStatus: "pending",
    startFee: 200,
    registrationStatus: "Zaregistrován",
    bibNumber: 102,
    pastStarts: 1,
    dogs: ["Sára"],
    avatarUrl: "/avatars/eva.png",
  },
  {
    id: "3",
    name: "Petr Novák",
    relation: "child",
    email: "",
    phone: "",
    startFee: 200,
    paymentStatus: "pending",
    registrationStatus: "Zaregistrován",
    bibNumber: null,
    pastStarts: 0,
    dogs: [],
    avatarUrl: "/avatars/petr.png",
  },
];

const dogs = [
  {
    id: "d1",
    name: "Ben",
    birthDate: "2019-07-12",
    breed: "Labrador",
    chip: "123456789",
    ownerId: "1",
    avatarUrl: "/dogs/ben.png",
  },
  {
    id: "d2",
    name: "Sára",
    birthDate: "2021-02-10",
    breed: "Border Collie",
    chip: "987654321",
    ownerId: "2",
    avatarUrl: "/dogs/sara.png",
  },
];


const isPaidMock = false;

export default function AccountPage() {
  const [isPaid] = useState(isPaidMock);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <AppShell menuType="race">
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* HLAVIČKA */}
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Pravěk v ráji – Můj účet
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Spravujte svou registraci, osoby, psy a sledujte historii své účasti.
        </Typography>
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

        <FamilySection members={familyMembers} />

        <Box sx={{ borderBottom: "1px solid #ddd", mb: 4 }} />

        <DogSection dogs={dogs} members={familyMembers} />

        <Box sx={{ borderBottom: "1px solid #ddd", mb: 4 }} />
        {/* ================================= */}
        {/*            DASHBOARD GRID          */}
        {/* ================================= */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {/* PAYMENT */}
          <Card
            sx={{
              minHeight: 250,
              gridColumn: { xs: "span 1", md: "span 2" },
            }}
          >
            <CardContent>
              {!isPaid && (
                <PaymentSelectionSection members={familyMembers} />
              )}
            </CardContent>
          </Card>

          {/* FOTKY */}
          <Card sx={{ minHeight: 200 }}>
            <CardContent>
              <Typography variant="h6">Fotografie</Typography>
              <Typography sx={{ mb: 2, mt: 1 }}>
                Nahrajte nebo spravujte fotografie z trasy.
              </Typography>

              <Button
                component={Link}
                href="/account/photos"
                variant="outlined"
                fullWidth
              >
                Spravovat fotografie
              </Button>
            </CardContent>
          </Card>

          {/* ÚČASTNÍCI */}
          <Card sx={{ minHeight: 200 }}>
            <CardContent>
              <Typography variant="h6">Účastníci</Typography>
              <Typography sx={{ mb: 2, mt: 1 }}>
                Zobrazit potvrzené účastníky.
              </Typography>

              <Button
                component={Link}
                href="/participants"
                variant="outlined"
                fullWidth
              >
                Zobrazit účastníky
              </Button>
            </CardContent>
          </Card>

          {/* WEATHER */}
          <Card sx={{ minHeight: 250 }}>
            <WeatherSection />
          </Card>
        </Box>
      </Container>
    </AppShell>
  );
}
