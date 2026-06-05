"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  formatCzkAmount,
  formatYearsCount,
  useImpactStats,
} from "../hooks/use-impact-stats";

type ImpactSummaryProps = {
  variant?: "home" | "history";
};

export default function ImpactSummary({
  variant = "home",
}: ImpactSummaryProps) {
  const { stats, loading, error } = useImpactStats();

  if (loading) {
    return (
      <Box
        component="section"
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Alert severity="warning">
        Souhrn pomoci se nepodařilo načíst.
      </Alert>
    );
  }

  const note =
    variant === "history"
      ? "Součet vychází z částek uvedených u jednotlivých ročníků níže."
      : "Počítáno z částek uvedených u minulých ročníků.";

  return (
    <Card
      component="section"
      sx={{
        borderRadius: 3,
        boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 3, md: 4 },
          display: { xs: "block", md: "flex" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <Box>
          <Typography
            component="p"
            variant="overline"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Souhrn uzavřených ročníků
          </Typography>

          <Typography
            component="p"
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {formatYearsCount(stats.years)}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: { xs: 2.5, md: 0 },
            textAlign: { xs: "left", md: "right" },
          }}
        >
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.8rem" },
              lineHeight: 1.05,
            }}
          >
            {formatCzkAmount(stats.amount)}
          </Typography>

          <Typography
            component="p"
            variant="h6"
            sx={{
              mt: 0.75,
              fontWeight: 700,
            }}
          >
            předáno na pomoc dětem
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              maxWidth: 420,
              ml: { xs: 0, md: "auto" },
            }}
          >
            {note}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}