import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import Link from "next/link";

export default function CharityTeaser() {
  return (
    <Card sx={{ p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Eliščin příběh
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Eliška žije s vážným neurologickým onemocněním, nemluví a většinu emocí prožívá bez filtru.
          Každodenní péče je plná radosti, ale i velkých výzev – od epileptických záchvatů po náročné
          přesuny po schodech nebo do vany.
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Podívejte se na příběh, který vypráví o odvaze, rodině a lásce navzdory hranicím.
        </Typography>

        <Box mt={2}>
          <Button
            component={Link}
            href="/charity"
            variant="contained"
            color="primary"
            size="large"
          >
            Přečíst celý příběh
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
