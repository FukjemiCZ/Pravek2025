"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";
import Gallery from "./gallery";

type StoryMarkdownProps = {
  storyPath: string;
  gallery?: string | string[];
};

export default function StoryMarkdown({ storyPath, gallery }: StoryMarkdownProps) {
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    fetch(storyPath)
      .then((res) => res.text())
      .then((txt) => setMarkdown(txt))
      .catch(() => setMarkdown("Chyba při načítání obsahu."));
  }, [storyPath]);

  if (!markdown) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        "& h1": { fontSize: "2.4rem", fontWeight: 700, mb: 3 },
        "& h2": { fontSize: "1.8rem", fontWeight: 600, mt: 4, mb: 2 },
        "& h3": { fontSize: "1.4rem", fontWeight: 600, mt: 3, mb: 1 },
        "& p": { mb: 2, lineHeight: 1.7 },
      }}
    >
      <ReactMarkdown>{markdown}</ReactMarkdown>

      {gallery && <Gallery galleries={gallery} />}
    </Box>
  );
}
