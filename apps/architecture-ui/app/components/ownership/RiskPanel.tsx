"use client";

import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

export default function RiskPanel({
  ownership,
  catalog,
  roadmap,
}: {
  ownership: any;
  catalog: any;
  roadmap?: any;
}) {
  const capOwners = new Map<string, string>();
  for (const c of ownership?.capabilities ?? []) capOwners.set(c.id, c.owner);

  const missingCapOwner = (catalog?.capabilities ?? [])
    .filter((c: any) => !capOwners.get(c.id))
    .map((c: any) => c.id);

  const domainsOwner = new Map<string, string>();
  for (const d of ownership?.domains ?? []) domainsOwner.set(d.id, d.owner);

  const missingDomainOwner = (catalog?.domains ?? [])
    .filter((d: any) => !domainsOwner.get(d.id))
    .map((d: any) => d.id);

  const totalRisks = missingCapOwner.length + missingDomainOwner.length;

  return (
    <SectionCard
      title="Governance risks"
      subtitle="Missing ownership + potential operational risks"
    >
      {totalRisks === 0 ? (
        <Alert severity="success">No obvious ownership risks detected.</Alert>
      ) : (
        <Alert severity="warning">
          Detected {totalRisks} ownership issues.
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>
          Capabilities missing owner ({missingCapOwner.length})
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {missingCapOwner.slice(0, 40).map((id: string) => (
            <Chip key={id} label={id} size="small" variant="outlined" />
          ))}
          {missingCapOwner.length > 40 && (
            <Chip label={`+${missingCapOwner.length - 40} more`} size="small" />
          )}
          {missingCapOwner.length === 0 && (
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              — none
            </Typography>
          )}
        </Stack>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>
          Domains missing owner ({missingDomainOwner.length})
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {missingDomainOwner.map((id: string) => (
            <Chip key={id} label={id} size="small" variant="outlined" />
          ))}
          {missingDomainOwner.length === 0 && (
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              — none
            </Typography>
          )}
        </Stack>
      </Box>
    </SectionCard>
  );
}