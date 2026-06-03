"use client";

import { useEffect, useState } from "react";
import {
    Container,
    Divider,
    CircularProgress,
    Box,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

import AppShell from "../app-shell";
import PaymentOptionsSection from "../components/payment-section";
import SponsorsSection from "../components/sponsors-section";
import SponsorDialog, { Sponsor } from "../components/sponsor-dialog";
import { EVENT_CONFIG } from "@/app/event-config";

export default function CharityPage() {

    // 🔄 STAVY
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);

    // AUTO-SCROLL NA #ANCHOR
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const el = document.querySelector(hash);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, []);

    // LOAD SPONZORŮ
    useEffect(() => {
        const load = async () => {
            try {
                const r = await fetch("/api/sponsors");
                const data = await r.json();
                setSponsors(data.sponsors || []);
            } catch {
                setSponsors([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return (
        <AppShell menuType="charity">
            <Container maxWidth="lg" sx={{ py: 5 }}>

                {/* 🟣 AKTUÁLNÍ BENEFICIENT – připravujeme */}
                <Box id="beneficient">
                    <Card
                        elevation={1}
                        sx={{
                            borderRadius: 3,
                            mb: 5,
                            backgroundColor: "background.paper",
                        }}
                    >
                        <CardContent sx={{ py: 5 }}>
                            <Typography variant="overline" color="primary" fontWeight={700}>
                                Benefiční příběh {EVENT_CONFIG.year}
                            </Typography>

                            <Typography variant="h3" component="h1" fontWeight={700} sx={{ mt: 1, mb: 2 }}>
                                Příběh připravujeme
                            </Typography>

                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.8 }}>
                                Hrdinu aktuálního ročníku zatím vybíráme. Jakmile bude vše potvrzené,
                                doplníme sem jeho příběh, fotografie a informace o tom, kde vaše podpora
                                pomůže nejvíce.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Divider sx={{ my: 5 }} />

                <Box id="Payment">
                    <PaymentOptionsSection
                        nadpis={`Podpořte benefiční ročník ${EVENT_CONFIG.year} finančním darem.`}
                        qrCodeUrl={process.env.NEXT_PUBLIC_QRPAY!}
                        bankAccount="2887773010/3030"
                        variableSymbol={EVENT_CONFIG.year}
                        message={`Pravěk ${EVENT_CONFIG.year} + jméno a příjmení`}
                    />
                </Box>
                <Box id="sponzori">
                    {loading ? (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <SponsorsSection
                            sponsors={sponsors}
                            onSelectSponsor={(s) => setSelectedSponsor(s)}
                        />
                    )}
                </Box>
            </Container>

            <SponsorDialog sponsor={selectedSponsor} onClose={() => setSelectedSponsor(null)} />
        </AppShell>
    );
}
