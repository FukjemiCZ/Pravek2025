"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import Link from "next/link";

interface Dog {
  id: string;
  name: string;
  birthDate: string;
  chip: string;
  breed: string;
  ownerName: string; // osoba, ke které je pes přiřazen
}

export default function DogsPage() {
  // MOCK – později nahradíš daty z API
  const [dogs] = useState<Dog[]>([
    {
      id: "1",
      name: "Ben",
      birthDate: "2019-07-12",
      chip: "123456789",
      breed: "Labrador",
      ownerName: "Jan Novák",
    },
    {
      id: "2",
      name: "Sára",
      birthDate: "2021-03-05",
      chip: "987654321",
      breed: "Border kolie",
      ownerName: "Eva Nováková",
    },
  ]);

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Moji psi
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Zde můžete upravovat psy, přidávat nové nebo je přiřazovat jiným členům.
      </Typography>

      <Button
        component={Link}
        href="/account/dogs/new"
        variant="contained"
        sx={{ mb: 3 }}
      >
        ➕ Přidat nového psa
      </Button>

      <Grid container spacing={3}>
        {dogs.map((dog) => (
          <Grid item xs={12} md={6} key={dog.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{dog.name}</Typography>

                <Divider sx={{ my: 1 }} />

                <Typography>📅 Datum narození: {dog.birthDate}</Typography>
                <Typography>🐾 Chip: {dog.chip}</Typography>
                <Typography>🐶 Plemeno: {dog.breed}</Typography>

                <Typography sx={{ mt: 1 }}>
                  👤 Přiřazen k: <strong>{dog.ownerName}</strong>
                </Typography>
              </CardContent>

              <CardActions sx={{ display: "flex", gap: 1, px: 2, pb: 2 }}>
                <Button
                  size="small"
                  component={Link}
                  href={`/account/dogs/${dog.id}`}
                  variant="outlined"
                >
                  Upravit
                </Button>

                <Button
                  size="small"
                  component={Link}
                  href={`/account/dogs/${dog.id}?move=1`}
                  variant="text"
                >
                  Přesunout
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
