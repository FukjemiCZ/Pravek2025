import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import Link from "next/link";
import { EVENT_CONFIG } from "@/app/event-config";

export default function CharityTeaser() {
  return (
    <Card sx={{ p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Benefiční příběh {EVENT_CONFIG.year}
        </Typography>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          Příběh připravujeme
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Hrdinu aktuálního ročníku zatím vybíráme. Jakmile bude vše potvrzené,
          doplníme jeho příběh a informace o tom, kde vaše podpora pomůže nejvíce.
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Eliščin příběh na webu zůstává zachovaný jako předchozí benefiční příběh.
        </Typography>

        <Box mt={2}>
          <Button
            component={Link}
            href="/charity#beneficient"
            variant="contained"
            color="primary"
            size="large"
          >
            Zobrazit benefiční příběh
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
