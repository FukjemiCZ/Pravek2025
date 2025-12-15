"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";

interface Item {
  name: string;
  photo: string;
  description: string;
  koupeno: boolean;
}

interface Person {
  name: string;
  photo1: string;
  photo2: string;
  description: string;
  sestypad: string;
  items?: Item[];
}

export default function SupportHeroCard() {
  const [person, setPerson] = React.useState<Person | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/persons");
        const data: Person[] = await res.json();
        setPerson(data[0] || null);
      } catch (err) {
        console.error("Chyba při načítání beneficienta:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Pokud není osoba pro tento ročník
  if (!person) {
    return (
      <Card sx={{ p: 3, mb: 5 }}>
        <Typography variant="body2" color="text.secondary">
          Brzy vám představíme beneficienta pro tento ročník. Sledujte nás!
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ mb: 5 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              p: 1,
            }}
          >
            {/* FOTO jako v ArticleCards */}
            <CardMedia
              component="img"
              image={person.photo2}
              alt={person.name}
              sx={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: "8px",
                margin: 2,
              }}
            />

            <CardContent>

              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                {person.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {person.description.substring(0, 120)}…
              </Typography>

              {/* JEDINÉ CTA */}
              <Button
                variant="contained"
                color="primary"
                href="/charity#beneficient"
              >
                Více o {person.sestypad}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
