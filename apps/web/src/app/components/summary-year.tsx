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

const YEAR_2026_STORIES = [
  {
    title: "Eliščin příběh",
    storyPath: "/elis-story.md",
    gallery: "Eliska",
  },
  {
    title: "Daníkův příběh",
    storyPath: "/danik-story.md",
  },
  {
    title: "Elenin příběh",
    storyPath: "/elen-story.md",
  },
] as const;

export default function SummaryYear({ summary }: { summary: SummaryData }) {
  const [openBeneficiary, setOpenBeneficiary] = React.useState<string | null>(null);

  // ✅ Dynamický filtr na gallery v Sheets: "Pravek-{rok}"
  const galleryKey = `Pravek-${summary.year}`;
  const isYear2026 = summary.year === "2026";

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Ročník {summary.year}
      </Typography>

      <Typography variant="h5" sx={{ textAlign: "center", my: 3 }}>
        Vybraná částka: {summary.amount}
      </Typography>

      {isYear2026 && (
        <Box sx={{ my: 5 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            Benefiční příběhy ročníku 2026
          </Typography>

          {YEAR_2026_STORIES.map((story, index) => (
            <Box key={story.storyPath} sx={{ mb: 5 }}>
              {index > 0 && <Divider sx={{ mb: 5 }} />}
              <StoryMarkdown storyPath={story.storyPath} gallery={story.gallery} />
            </Box>
          ))}
        </Box>
      )}

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

              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenBeneficiary(key)}>
                Více o {ben.name}
              </Button>

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
        );
      })}

      {/* ✅ Galerie místo sekce "Mapa trasy" */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Galerie ročníku
      </Typography>

      <Gallery galleries={galleryKey} />
    </Box>
  );
}
