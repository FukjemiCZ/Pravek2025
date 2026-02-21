// apps/architecture-ui/app/page.tsx
import Shell from "@/app/components/layout/Shell";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { getProductModel } from "@/app/lib/getProductModel";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getProductModel();

  return (
    <Shell>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Feature Flags</Typography>
              <Typography>
                {data.runtime?.featureFlags?.length ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Epics</Typography>
              <Typography>
                {data.roadmap?.epics?.length ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Domains</Typography>
              <Typography>
                {data.catalog?.domains?.length ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Shell>
  );
}