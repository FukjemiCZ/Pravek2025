"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Card, CardContent, Typography } from "@mui/material";

export default function PaymentWidget() {
  const { user } = useUser();

  const hasPaid = user?.app_metadata?.hasPaid === true;

  return (
    <Card sx={{ maxWidth: 480, mt: 2 }}>
      <CardContent>
        <Typography variant="h6">Startovné</Typography>

        {hasPaid ? (
          <Typography color="success.main" sx={{ mt: 1 }}>
            Máš zaplaceno.
          </Typography>
        ) : (
          <Typography color="error.main" sx={{ mt: 1 }}>
            Nemáš zaplaceno.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
