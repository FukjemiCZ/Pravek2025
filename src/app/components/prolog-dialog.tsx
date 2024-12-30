"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";

function PrologDialog() {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box textAlign="center" sx={{ mb: 5 }}>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Zobrazit Prolog
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Prolog</DialogTitle>
        <DialogContent>
          <Box id="prolog">
            <Typography variant="h4" gutterBottom>
              Asi se ptáte proč zrovna "Pravěk v Ráji".
            </Typography>
            <Typography variant="body1" paragraph>
              Důvod je prostý. S partou přátel jsme se rozhodli uspořádat dogtrekking,
              který povede srdcem Českého ráje. Protože je to akce benefiční, vteřiny
              nejsou to nejdůležitější, oč tady kráčí. Čas vůbec měřit nebudeme. Celá
              akce je koncipovaná tak, aby přinesla nějaké penízky tam, kde je to potřeba.
              Od této akce si také slibujeme návrat ke kořenům dogtrekkingu. Znovu
              objevení krásy několikadenních pochodů a především bivaku v přírodě se
              čtyřnohým parťákem.
            </Typography>
            <Typography variant="h4" gutterBottom>
              .. a jak že to celé vzniklo?
            </Typography>
            <Typography variant="body1" paragraph>
              Od doby, co mám Jardu je Vyskeř v Českém ráji moje druhé doma...
              (Pokračuje obsah vašeho původního textu)
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default PrologDialog;
