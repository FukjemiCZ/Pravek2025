// src/app/components/hero-section.tsx
"use client";

import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import DynamicButton from "@/app/components/dynamic-button";

export default function HeroSection() {
  const [openPayment, setOpenPayment] = React.useState(false);

  const handleRegister = () => {
    window.open(
      "https://prihlaseni.pravek-v-raji.cz",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handlePaymentOpen = () => setOpenPayment(true);
  const handlePaymentClose = () => setOpenPayment(false);

  return (
    <Box
      id="home"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light" ? "#F7F3EE" : "#2C3E50",
        textAlign: "center",
        py: 5,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          Benefiční dogtrekking Pravěk v Ráji 2026
        </Typography>

        <Typography variant="h6" gutterBottom>
          14. – 17. května 2026 &nbsp;|&nbsp; Fotbalové hřiště Vyskeř
        </Typography>

        <Typography variant="h6" gutterBottom>
          ve spolupráci se Sportovní klub ČSV & spol.
        </Typography>

        {/* HLAVNÍ CTA */}
        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            sx={{ m: 1 }}
            onClick={handleRegister}
          >
            Registrace
          </Button>

          <Button
            variant="outlined"
            color="primary"
            sx={{ m: 1 }}
            onClick={handlePaymentOpen}
          >
            Zaplatit startovné
          </Button>

          {/* EXISTUJÍCÍ DYNAMIC BUTTONY */}
          <DynamicButton buttonId="support" sx={{ m: 1 }} />
          <DynamicButton buttonId="nav" sx={{ m: 1 }} />
          <DynamicButton buttonId="startovka" sx={{ m: 1 }} />
        </Box>

        {/* SOCIÁLNÍ SÍTĚ */}
        <Box mt={4}>
          <DynamicButton
            buttonId="facebook"
            variantType="iconButton"
            iconButtonProps={{
              size: "large",
              "aria-label": "Facebook",
            }}
          />
          <DynamicButton
            buttonId="instagram"
            variantType="iconButton"
            iconButtonProps={{
              size: "large",
              "aria-label": "Instagram",
            }}
          />
        </Box>
      </Container>

      {/* DIALOG – PLATBA STARTOVNÉHO */}
      <Dialog
        open={openPayment}
        onClose={handlePaymentClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Platba startovného / finanční podpora</DialogTitle>

        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Pro platbu startovného a finanční podporu použijte prosím následující
            údaje:
          </Typography>

          {/* QR KÓD */}
          <Box
            component="img"
            src="https://www.pravek-v-raji.cz/img/qr2026.png"
            alt="QR kód – platba startovného"
            sx={{
              width: "100%",
              maxWidth: 260,
              mx: "auto",
              mb: 3,
              display: "block",
            }}
          />

          {/* PLATEBNÍ ÚDAJE */}
          <Box
            sx={{
              textAlign: "left",
              bgcolor: "action.hover",
              p: 2,
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography variant="body2">
              <strong>Číslo účtu:</strong>
              <br />
              2887773010 / 3030
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Poznámka:</strong>
              <br />
              Pravěk Pro Elišku 2026 + jméno příjmení
            </Typography>
          </Box>

          {/* INFORMACE O ČÁSTCE */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Startovné je stanoveno na <strong>minimálně 600 Kč</strong>, ale velmi
            oceníme, pokud se rozhodnete přispět vyšší částkou.
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Vaše štědrost pomůže Elišce tam, kde je to nejvíce potřeba.
            <br />
            <strong>Děkujeme za vaši podporu.</strong>
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
