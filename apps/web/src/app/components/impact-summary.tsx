import { Card, CardContent, Typography } from "@mui/material";

export default function ImpactSummary() {
  return (
    <Card elevation={0} sx={{ bgcolor: "primary.main", color: "primary.contrastText", borderRadius: 4, my: 4 }}>
      <CardContent sx={{ textAlign: "center", py: { xs: 4, md: 5 } }}>
        <Typography variant="overline" sx={{ opacity: 0.85 }}>
          Společná