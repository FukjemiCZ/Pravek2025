"use client";

import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from "@mui/material";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  relationship: "self" | "partner" | "child";
  email?: string;
}

export default function PartnersPage() {
  // MOCK — později nahradíš API daty
  const partners: Partner[] = [
    { id: "1", name: "Jan Novák", relationship: "self", email: "jan@novak.cz" },
    { id: "2", name: "Eva Nováková", relationship: "partner" },
    { id: "3", name: "Petr Novák", relationship: "child" },
  ];

  const relationLabels: Record<Partner["relationship"], string> = {
    self: "Hlavní účastník",
    partner: "Partner/ka",
    child: "Dítě"
  };

  const relationColors: Record<Partner["relationship"], "primary" | "secondary" | "info"> = {
    self: "primary",
    partner: "secondary",
    child: "info"
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Moje osoby
      </Typography>

      <Typography sx={{ mb: 3 }}>
        Zde můžete přidávat nebo upravovat členy rodiny, kteří se účastní závodu.
      </Typography>

      <Button
        component={Link}
        href="/account/partners/new"
        variant="contained"
        sx={{ mb: 3 }}
      >
        ➕ Přidat osobu
      </Button>

      <Grid container spacing={3}>
        {partners.map((p) => (
          <Grid item xs={12} md={6} key={p.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.name}</Typography>

                <Chip
                  label={relationLabels[p.relationship]}
                  color={relationColors[p.relationship]}
                  sx={{ mt: 1 }}
                />

                {p.email && (
                  <Typography sx={{ mt: 1, fontSize: "0.9rem" }}>
                    Email: {p.email}
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  component={Link}
                  href={`/account/partners/${p.id}`}
                  variant="outlined"
                  size="small"
                >
                  Upravit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
