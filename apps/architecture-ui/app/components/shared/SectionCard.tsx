"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
import React from "react";

export default function SectionCard({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "baseline" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Box>

        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}