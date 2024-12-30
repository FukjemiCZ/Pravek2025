"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Link,
  List,
  ListItem,
} from "@mui/material";

// Definice typu
interface Facilities {
  accommodation: {
    own: string;
    local: Array<{ name: string; link?: string }>;
  };
  onSite: {
    water?: boolean;
    electricity?: boolean;
    partyTent?: boolean;
    mobileToilets?: boolean;
    showers?: boolean;
  };
  foodAndDrinks: {
    basicRefreshments?: boolean;
    saturdayGrill?: string;
    drinks: string[];
    local: Array<{ name: string; link?: string }>;
  };
}

export default function FacilitiesSection() {
  const [facilities, setFacilities] = React.useState<Facilities | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch("/data/facilities.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        setFacilities(data.facilities);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box id="zazemi" sx={{ mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Zázemí závodu
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Ubytování Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                height: "200px",
              }}
            >
              <iframe
                title="Location Map"
                src="https://frame.mapy.cz/s/fotesatudu"
                width="100%"
                height="100%"
                style={{ border: "none" }}
                loading="lazy"
              ></iframe>
            </Box>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Ubytování
              </Typography>
              <List>
                <ListItem disablePadding>
                  <Typography>
                    {facilities?.accommodation?.own || "Data nejsou k dispozici"}
                  </Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography variant="body2" color="textSecondary">
                    Další možnosti:
                  </Typography>
                </ListItem>
                {facilities?.accommodation?.local?.map((option, index) => (
                  <ListItem key={index} disablePadding>
                    {option.link ? (
                      <Link href={option.link} target="_blank" rel="noopener">
                        {option.name}
                      </Link>
                    ) : (
                      <Typography>{option.name}</Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Na místě Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image="/images/onsite.jpg"
              alt="Na místě"
            />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Na místě
              </Typography>
              <List>
                {facilities?.onSite?.water && (
                  <ListItem disablePadding>• Voda</ListItem>
                )}
                {facilities?.onSite?.electricity && (
                  <ListItem disablePadding>• Elektřina</ListItem>
                )}
                {facilities?.onSite?.partyTent && (
                  <ListItem disablePadding>• Párty stan</ListItem>
                )}
                {facilities?.onSite?.mobileToilets && (
                  <ListItem disablePadding>• Mobilní WC</ListItem>
                )}
                {facilities?.onSite?.showers && (
                  <ListItem disablePadding>• Sprcha</ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Občerstvení a nápoje Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image="/images/food.jpg"
              alt="Občerstvení a nápoje"
            />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Občerstvení a nápoje
              </Typography>
              <List>
                {facilities?.foodAndDrinks?.basicRefreshments && (
                  <ListItem disablePadding>
                    <Typography>• Základní občerstvení</Typography>
                  </ListItem>
                )}
                <ListItem disablePadding>
                  <Typography>
                    • {facilities?.foodAndDrinks?.saturdayGrill || "Neznámé"}
                  </Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography>
                    • Nápoje:{" "}
                    {facilities?.foodAndDrinks?.drinks?.join(", ") || "Neznámé"}
                  </Typography>
                </ListItem>
              </List>
              <Typography variant="body2" color="textSecondary">
                Další možnosti:
              </Typography>
              <List>
                {facilities?.foodAndDrinks?.local?.map((option, index) => (
                  <ListItem key={index} disablePadding>
                    {option.link ? (
                      <Link href={option.link} target="_blank" rel="noopener">
                        {option.name}
                      </Link>
                    ) : (
                      <Typography>{option.name}</Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
