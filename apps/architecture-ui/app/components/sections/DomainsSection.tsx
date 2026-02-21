"use client";

import { Card, CardContent, Grid, Typography } from "@mui/material";

export default function DomainsSection({ domains }: any) {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Domains
      </Typography>
      <Grid container spacing={2}>
        {domains?.map((d: any) => (
          <Grid item xs={12} sm={6} md={4} key={d.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{d.id}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}