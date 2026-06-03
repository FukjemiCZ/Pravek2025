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
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { SummaryData } from "../types/summary";
import Gallery from "../components/gallery";
import StoryMarkdown from "../components/story-markdown";
import { getHistoryStoryForBeneficiary } from "@/app/story-config";

export default function SummaryYear({ summary }: { summary: SummaryData }) {
  const [openBeneficiary, setOpenBeneficiary] = React.useState<string | null>(null);

  // ✅ Dynamický filtr na gallery v Sheets: "Pravek-{rok}"
  const galleryKey = `Pravek-${summary.year}`;

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
        const story = getHistoryStoryForBeneficiary(summary.year, ben.name);

        return (
          <Box key={key} sx={{ my: 5 }}>
            {idx > 0 && <Divider sx={{ mb: 5 }} />}

            <Box
              sx={{
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
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {ben.name}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {ben.subtitle}
                </Typography>
                <Typography sx={{ mt: 2 }}>{ben.description}</Typography>

                {ben.dialogText && (
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenBeneficiary(key)}>
                    Více o {ben.name}
                  </Button>
                )}

                <Dialog open={openBeneficiary === key} onClose={() => setOpenBeneficiary(null)}>
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
                    <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>{ben.dialogText}</Typography>
                  </DialogContent>
                </Dialog>
              </Box>
            </Box>

            {story && (
              <Box sx={{ mt: 4 }}>
                <StoryMarkdown storyPath={story.storyPath} gallery={story.gallery} />
              </Box>
            )}
          </Box>
        );
      })}

      {summary.mapImages.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Mapy ročníku
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
              mb: 4,
            }}
          >
            {summary.mapImages.map((mapImage, index) => (
              <Image
                key={`${summary.year}-map-${index}`}
                src={mapImage}
                alt={`Mapa ročníku ${summary.year} ${index + 1}`}
                width={600}
                height={400}
                style={{ borderRadius: 12, width: "100%", height: "auto" }}
              />
            ))}
          </Box>
        </>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Galerie ročníku
      </Typography>

      <Gallery galleries={galleryKey} />
    </Box>
  );
}
