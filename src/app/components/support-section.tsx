"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";
import SingleHeroView from "./single-hero-view";

export default function SupportSection() {
  const [heroes, setHeroes] = useState([]);
  const [selectedHero, setSelectedHero] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Načtení dat z JSON souboru
    fetch("/data/herosh.json")
      .then((response) => response.json())
      .then((data) => {
        setHeroes(data);
        if (data.length === 1) {
          setSelectedHero(data[0]);
        }
      });
  }, []);

  const handleHeroChange = (event) => {
    const hero = heroes.find((h) => h.id === event.target.value);
    setSelectedHero(hero);
  };

  return (
    <Box id="koho-podporujeme" sx={{ mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Koho podporujeme
      </Typography>
      {heroes.length === 1 && (
        <Typography variant="body1" paragraph>
          {`V letošním roce jsme se rozhodli pomoci ${heroes[0].perex}`}
        </Typography>
      )}
      {heroes.length > 1 && (
        <Typography variant="body1" paragraph>
          V letošním roce jsme se rozhodli pomoci několika jednotlivcům, kteří podporují zdravotně znevýhodněné.
        </Typography>
      )}

      {heroes.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            backgroundColor: "#fafafa",
            border: "1px dashed #ccc",
            fontStyle: "italic",
            color: "#999",
          }}
        >
          Brzy je zveřejníme, jen co přijde ten správný čas :)
        </Box>
      ) : heroes.length === 1 ? (
        <Box>
          <SingleHeroView hero={heroes[0]} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
          {isMobile ? (
            <Select
              fullWidth
              value={selectedHero?.id || ""}
              onChange={handleHeroChange}
              displayEmpty
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                Vyberte osobu
              </MenuItem>
              {heroes.map((hero) => (
                <MenuItem key={hero.id} value={hero.id}>
                  {hero.name}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "25%",
                mr: 3,
              }}
            >
              {heroes.map((hero) => (
                <Card
                  key={hero.id}
                  onClick={() => setSelectedHero(hero)}
                  sx={{
                    mb: 2,
                    cursor: "pointer",
                    border: selectedHero?.id === hero.id ? "2px solid #1976d2" : "1px solid #ddd",
                    boxShadow: selectedHero?.id === hero.id ? "0 0 10px rgba(25, 118, 210, 0.5)" : "none",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={hero.photo}
                    alt={hero.name}
                  />
                  <CardContent>
                    <Typography variant="h6">{hero.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hero.reason}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1, width: "75%" }}>
            {selectedHero ? (
              <SingleHeroView hero={selectedHero} />
            ) : (
              <Typography variant="body1">Vyberte osobu z nabídky.</Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
