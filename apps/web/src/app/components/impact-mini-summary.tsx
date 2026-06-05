"use client";

import { alpha, Box, Skeleton, Typography } from "@mui/material";

import {
  formatCzkAmount,
  formatYearsCount,
  useImpactStats,
} from "../hooks/use-impact-stats";

type ImpactMiniSummaryProps = {
  placement: "mobileAppBar" | "drawer";
};

export default function ImpactMiniSummary({
  placement,
}: ImpactMiniSummaryProps) {
  const { stats, loading, error } = useImpactStats();

  if (error) {
    return null;
  }

  if (placement === "mobileAppBar") {
    if (loading || !stats) {
      return (
        <Box
          sx={{
            ml: 1,
            mr: 1,
            px: 1.25,
            py: 0.4,
            borderRadius: 999,
            backgroundColor: alpha("#fff", 0.16),
            maxWidth: "calc(100vw - 132px)",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <Skeleton
            variant="text"
            width={112}
            sx={{ bgcolor: alpha("#fff", 0.28) }}
          />
        </Box>
      );
    }

    return (
      <Box
        aria-label="Souhrn předané pomoci"
        sx={{
          ml: 1,
          mr: 1,
          px: 1.25,
          py: 0.45,
          borderRadius: 999,
          color: "inherit",
          backgroundColor: alpha("#fff", 0.16),
          border: `1px solid ${alpha("#fff", 0.26)}`,
          maxWidth: "calc(100vw - 132px)",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <Typography
          component="span"
          sx={{
            display: "block",
            fontSize: { xs: "0.72rem", sm: "0.78rem" },
            fontWeight: 800,
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formatCzkAmount(stats.amount)} · {stats.years} roč.
        </Typography>
      </Box>
    );
  }

  if (loading || !stats) {
    return (
      <Box
        sx={{
          mx: 0.5,
          mb: 2,
          px: 1.5,
          py: 1.25,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Skeleton variant="text" width="55%" sx={{ mx: "auto" }} />
        <Skeleton variant="text" width="75%" sx={{ mx: "auto" }} />
      </Box>
    );
  }

  return (
    <Box
      aria-label="Souhrn předané pomoci"
      sx={{
        mx: 0.5,
        mb: 2,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        textAlign: "center",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Typography
        component="p"
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        Předáno dětem
      </Typography>

      <Typography
        component="p"
        sx={{
          mt: 0.4,
          fontSize: "1.05rem",
          fontWeight: 800,
          lineHeight: 1.15,
        }}
      >
        {formatCzkAmount(stats.amount)}
      </Typography>

      <Typography
        component="p"
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mt: 0.35,
          lineHeight: 1.2,
        }}
      >
        {formatYearsCount(stats.years)}
      </Typography>
    </Box>
  );
}