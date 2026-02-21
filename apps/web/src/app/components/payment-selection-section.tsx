"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Checkbox,
  CardContent,
  Avatar,
} from "@mui/material";

import PaymentOptionsSection from "./payment-section";
import type { FamilyMember } from "./family-section";

interface Props {
  members: FamilyMember[];
}

export default function PaymentSelectionSection({ members }: Props) {
  // Ti, co nemají zaplaceno
  const unpaid = members.filter((m) => m.paymentStatus === "pending");

  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // CELKOVÁ ČÁSTKA
  const total = useMemo(() => {
    return unpaid
      .filter((m) => selected.includes(m.id))
      .reduce((sum, m) => sum + m.startFee, 0);
  }, [selected, unpaid]);

  // Message pro bankovní převod
  const message = useMemo(() => {
    const names = unpaid
      .filter((m) => selected.includes(m.id))
      .map((m) => m.name);

    return names.length > 0
      ? `Startovné: ${names.join(", ")}`
      : "Startovné: ";
  }, [selected, unpaid]);

  return (
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Platba startovného
        </Typography>

        {/* Seznam lidí */}
        <Box sx={{ mb: 3 }}>
          {unpaid.map((m) => (
            <Box
              key={m.id}
              sx={{
                display: "flex",
                alignItems: "center",
                py: 1,
                borderBottom: "1px solid #eee",
              }}
            >
              <Checkbox
                checked={selected.includes(m.id)}
                onChange={() => toggle(m.id)}
              />

              <Avatar src={m.avatarUrl} sx={{ width: 36, height: 36, mr: 1 }} />

              <Box sx={{ flexGrow: 1 }}>
                <Typography>{m.name}</Typography>
              </Box>

              <Typography sx={{ fontWeight: "bold" }}>
                {m.startFee} Kč
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Celková částka */}
        <Typography sx={{ fontSize: "1.2rem", fontWeight: "bold", mb: 2 }}>
          K úhradě: <strong>{total} Kč</strong>
        </Typography>

        {/* Reálná komponenta platby */}
        <PaymentOptionsSection
          nadpis="Zaplatit startovné"
          qrCodeUrl="/qr.png"
          bankAccount="123456789/0100"
          variableSymbol="1234"
          message={message}
        />
      </CardContent>
  );
}
