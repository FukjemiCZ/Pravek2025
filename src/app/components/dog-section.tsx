"use client";

import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Grid,
  Avatar,
} from "@mui/material";
import Link from "next/link";

interface Dog {
  id: string;
  name: string;
  birthDate: string;
  chip: string;
  breed: string;
  ownerId: string;
  avatarUrl?: string;
}

interface FamilyMember {
  id: string;
  name: string;
}

interface Props {
  dogs: Dog[];
  members: FamilyMember[];
}

export default function DogSection({ dogs, members }: Props) {
  const getOwnerName = (id: string) => {
    const owner = members.find((m) => m.id === id);
    return owner ? owner.name : "Nepřiřazen";
  };

  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Moje psí smečka
      </Typography>

      <Grid container spacing={2}>
        {dogs.map((dog) => (
          <Grid item xs={12} sm={6} md={3} key={dog.id}>
            <Card
              sx={{
                p: 2,
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Avatar */}
              <Box sx={{ textAlign: "center" }}>
                <Avatar
                  src={dog.avatarUrl}
                  sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 1,
                  }}
                />

                <Typography variant="h6">{dog.name}</Typography>
                <Chip
                  label={getOwnerName(dog.ownerId)}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>

              {/* Info o psovi */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Plemeno:</strong> {dog.breed}
                </Typography>
                <Typography variant="body2">
                  <strong>Narozen:</strong> {dog.birthDate}
                </Typography>
                <Typography variant="body2">
                  <strong>Čip:</strong> {dog.chip}
                </Typography>
              </Box>

              {/* Akce */}
              <Box sx={{ mt: 2 }}>
                <Button
                  component={Link}
                  href={`/account/dogs/${dog.id}`}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upravit
                </Button>

                <Button
                  component={Link}
                  href={`/account/dogs/${dog.id}?move=1`}
                  variant="outlined"
                  color="secondary"
                  size="small"
                  fullWidth
                >
                  Přesunout psa
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}

        {/* + nový pes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={Link}
            href="/account/dogs/new"
            sx={{
              p: 2,
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              border: "2px dashed #ccc",
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            <Typography variant="h6" color="primary">
              + Přidat psa
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: "1px solid #ddd", mt: 4 }} />
    </Box>
  );
}
