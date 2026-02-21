"use client";

import { Box, Chip } from "@mui/material";

const EMOJI: Record<string, string> = {
  plusOne: "👍",
  minusOne: "👎",
  laugh: "😄",
  hooray: "🎉",
  confused: "😕",
  heart: "❤️",
  rocket: "🚀",
  eyes: "👀",
};

export default function ReactionsChips({ reactions }: { reactions?: any | null }) {
  if (!reactions) return null;

  const entries = Object.entries(EMOJI)
    .map(([k, e]) => ({ key: k, emoji: e, count: Number(reactions?.[k] ?? 0) }))
    .filter((x) => x.count > 0);

  if (entries.length === 0) return null;

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {entries.map((x) => (
        <Chip key={x.key} size="small" variant="outlined" label={`${x.emoji} ${x.count}`} />
      ))}
    </Box>
  );
}