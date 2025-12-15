"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface PaymentOptionsProps {
  nadpis: string;
  qrCodeUrl: string;
  bankAccount: string;
  iban?: string;
  variableSymbol?: string;
  message?: string;
}

export default function PaymentOptionsSection({
  nadpis,
  qrCodeUrl,
  bankAccount,
  iban,
  variableSymbol,
  message,
}: PaymentOptionsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box id="platba" sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        {nadpis}
      </Typography>

      <Grid container spacing={3}>
        
        {/* QR PLATBA */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              height: "100%",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Platba přes QR kód
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CardMedia
                  component="img"
                  src={qrCodeUrl}
                  alt="QR platba"
                  sx={{
                    width: 220,
                    height: 220,
                    objectFit: "contain",
                    borderRadius: 2,
                    background: "white",
                    p: 1,
                    border: "1px solid #eee",
                  }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Stačí naskenovat v aplikaci vaší banky.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* BANKOVNÍ PŘEVOD */}
        <Grid item xs={12} md={6}>
          {isMobile ? (
            // 📱 MOBILNÍ VERZE – accordion
            <Accordion
              elevation={1}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Převod na účet</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <Typography>
                    <strong>Číslo účtu:</strong> {bankAccount}
                  </Typography>

                  {iban && (
                    <Typography>
                      <strong>IBAN:</strong> {iban}
                    </Typography>
                  )}

                  {variableSymbol && (
                    <Typography>
                      <strong>Variabilní symbol:</strong> {variableSymbol}
                    </Typography>
                  )}

                  {message && (
                    <Typography>
                      <strong>Zpráva pro příjemce:</strong> {message}
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ mt: 3, mb: 1 }} />

                <Typography variant="body2" color="text.secondary">
                  Údaje můžete zkopírovat přímo z textu.
                </Typography>
              </AccordionDetails>
            </Accordion>
          ) : (
            // 🖥 DESKTOP VERZE – klasická card
            <Card
              elevation={1}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Převod na účet
                </Typography>

                <Stack spacing={1}>
                  <Typography>
                    <strong>Číslo účtu:</strong> {bankAccount}
                  </Typography>

                  {iban && (
                    <Typography>
                      <strong>IBAN:</strong> {iban}
                    </Typography>
                  )}

                  {variableSymbol && (
                    <Typography>
                      <strong>Variabilní symbol:</strong> {variableSymbol}
                    </Typography>
                  )}

                  {message && (
                    <Typography>
                      <strong>Zpráva pro příjemce:</strong> {message}
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ mt: 3, mb: 1 }} />

                <Typography variant="body2" color="text.secondary">
                  Údaje můžete zkopírovat přímo z textu.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
