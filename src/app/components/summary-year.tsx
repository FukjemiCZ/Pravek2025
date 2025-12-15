"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  ImageList,
  ImageListItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { SummaryData } from "../types/summary";

export default function SummaryYear({ summary }: { summary: SummaryData }) {
  const [openBeneficiary, setOpenBeneficiary] = React.useState<string | null>(null);
  const [openMap, setOpenMap] = React.useState<string | null>(null);

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Ročník {summary.year}
      </Typography>

      <Typography variant="h5" sx={{ textAlign: "center", my: 3 }}>
        Vybraná částka: {summary.amount}
      </Typography>

      {summary.beneficiaries.map((ben, idx) => {
        const key = `${summary.year}-b-${idx}`;

        return (
          <Box
            key={key}
            sx={{
              my: 4,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              alignItems: "center",
            }}
          >
            <Image
              src={ben.image}
              alt={ben.name}
              width={450}
              height={300}
              style={{ borderRadius: 12, width: "100%", height: "auto" }}
            />

            <Box>
              <Typography variant="h6">{ben.subtitle}</Typography>
              <Typography sx={{ mt: 2 }}>{ben.description}</Typography>

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => setOpenBeneficiary(key)}
              >
                Více o {ben.name}
              </Button>

              <Dialog
                open={openBeneficiary === key}
                onClose={() => setOpenBeneficiary(null)}
              >
                <DialogTitle>
                  {ben.name}
                  <IconButton
                    onClick={() => setOpenBeneficiary(null)}
                    sx={{ position: "absolute", right: 10, top: 10 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent>
                  <Image
                    src={ben.image}
                    alt={ben.name}
                    width={400}
                    height={250}
                    style={{ width: "100%", borderRadius: 12 }}
                  />
                  <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>
                    {ben.dialogText}
                  </Typography>
                </DialogContent>
              </Dialog>
            </Box>
          </Box>
        );
      })}

      {summary.mapImages.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Mapa trasy
          </Typography>

          <ImageList cols={2} gap={12}>
            {summary.mapImages.map((src, idx) => {
              const key = `${summary.year}-m-${idx}`;

              return (
                <ImageListItem key={key}>
                  <Image
                    src={src}
                    alt={`Mapa ${idx}`}
                    width={300}
                    height={200}
                    style={{ borderRadius: 12, cursor: "pointer" }}
                    onClick={() => setOpenMap(key)}
                  />

                  <Dialog
                    open={openMap === key}
                    onClose={() => setOpenMap(null)}
                    maxWidth="md"
                    fullWidth
                  >
                    <DialogTitle>
                      Mapa – {summary.year}
                      <IconButton
                        onClick={() => setOpenMap(null)}
                        sx={{ position: "absolute", right: 10, top: 10 }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>

                    <DialogContent>
                      <Image
                        src={src}
                        alt="Mapa detail"
                        width={900}
                        height={600}
                        style={{ width: "100%", borderRadius: 12 }}
                      />
                    </DialogContent>
                  </Dialog>
                </ImageListItem>
              );
            })}
          </ImageList>
        </>
      )}
    </Box>
  );
}
