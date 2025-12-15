// components/PersonSection.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Box,
  Button,
  ButtonGroup,
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

const PersonSection = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<{ [key: number]: "description" | "items" }>({});

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await fetch("/api/persons");
        if (!response.ok) {
          throw new Error(`Chyba API: ${response.status}`);
        }
        const data: Person[] = await response.json();
        setPersons(data);
      } catch (error) {
        console.error("Chyba při načítání osob:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersons();
  }, []);

  const toggleView = (index: number, mode: "description" | "items") => {
    setViewMode((prev) => ({ ...prev, [index]: mode }));
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  // Pokud není žádný hrdina pro tento ročník, zobrazíme informaci
  if (persons.length === 0) {
    return (
      <Container sx={{ py: 4 }} id="koho-podporujeme">
        <Typography variant="body1" color="text.secondary">
        Zůstaňte s námi, brzy zveřejníme hrdinu pro tento ročník!
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }} id="koho-podporujeme">
      <Grid container spacing={4} justifyContent="center">
        {persons.map((person, index) => (
          <Grid item xs={12} md={8} key={index}>
            <Card
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                p: 2,
                borderRadius: 3,
                boxShadow: 4,
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", md: "40%" },
                  textAlign: "center",
                  p: 2,
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 160,
                      backgroundImage: `url(${person.photo2})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "10px",
                      filter: "blur(5px)",
                    }}
                  />
                  <Avatar
                    src={person.photo2}
                    alt={person.name}
                    sx={{
                      width: 100,
                      height: 100,
                      position: "absolute",
                      left: "50%",
                      bottom: -50,
                      transform: "translateX(-50%)",
                      border: "4px solid white",
                      boxShadow: 3,
                    }}
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 6 }}>
                  {person.name}
                </Typography>
              </Box>

              <CardContent
                sx={{
                  width: { xs: "100%", md: "60%" },
                  textAlign: "center",
                }}
              >
                {viewMode[index] === "items" && person.items && person.items.length > 0 ? (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {person.items.map((item, i) => (
                      <Grid item xs={12} key={i}>
                        <Card
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1,
                          }}
                        >
                          <Avatar
                            src={item.photo}
                            alt={item.name}
                            sx={{ width: 60, height: 60, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={item.koupeno ? "green" : "red"}
                            >
                              {item.koupeno ? "Společně jsme pořídili" : ""}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {person.description}
                  </Typography>
                )}

                {person.items && person.items.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <ButtonGroup fullWidth variant="contained">
                      <Button onClick={() => toggleView(index, "description")}>
                        O {person.sestypad}
                      </Button>
                      <Button onClick={() => toggleView(index, "items")}>
                        Chceme pořídit
                      </Button>
                    </ButtonGroup>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PersonSection;
