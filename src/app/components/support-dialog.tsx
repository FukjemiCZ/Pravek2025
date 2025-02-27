"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/** Interface, pokud používáte TypeScript, jinak lze vynechat */
interface SupportDialogProps {
  open: boolean;       // Říká, zda je dialog zobrazen
  onClose: () => void; // Funkce pro zavření dialogu
}

export default function SupportDialog({ open, onClose }: SupportDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Podpora
        {/* Křížek pro zavření dialogu */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Card>
          {/* Obrázek s QR kódem */}
          <CardMedia
            component="img"
            alt="QR Kód"
            src="/img/qr2025.jpeg"
            // Sem vložte cestu k vašemu skutečnému QR kódu
            sx={{
              objectFit: "contain",
              maxHeight: 300,
              width: "auto",
              backgroundColor: "white",
              margin: "0 auto",
              pt: 2,
            }}
          />
          <CardContent>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              Pro finanční podporu použijte prosím následující údaje:
            </Typography>
            <Typography variant="body2" paragraph>
              Číslo účtu: 2887773010/3030<br />
              Poznámka: `Pravěk 2025 + jméno startujícího`
            </Typography>
            <Typography variant="body2" paragraph sx={{ mt: 3, fontStyle: "italic" }}>
            Startovné je stanoveno na minimálně 500 Kč, ale velmi oceníme, pokud se rozhodnete přispět vyšší částkou. Vaše štědrost pomůže tam, kde je to nejvíce potřeba. Děkujeme za vaši podporu!
            </Typography>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
