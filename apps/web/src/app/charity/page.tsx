"use client";

import { useEffect, useState } from "react";
import {
    Container,
    Divider,
    CircularProgress,
    Box,
    Typography,
} from "@mui/material";

import AppShell from "../app-shell";
import PaymentOptionsSection from "../components/payment-section";
import SponsorsSection from "../components/sponsors-section";
import SponsorDialog, { Sponsor } from "../components/sponsor-dialog";
import StoryMarkdown from "../components/story-markdown";
import { EVENT_CONFIG } from "@/app/event-config";
import { CURRENT_BENEFICIARY_STORY } from "@/app/story-config";

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

                {/* 🟣 AKTUÁLNÍ BENEFICIENT */}
                <Box id="beneficient">
                    <Typography variant="overline" color="primary" fontWeight={700}>
                        Benefiční příběh {EVENT_CONFIG.year}
                    </Typography>

                    <StoryMarkdown
                        storyPath={CURRENT_BENEFICIARY_STORY.storyPath}
                        gallery={CURRENT_BENEFICIARY_STORY.gallery}
                    />
                </Box>

                <Divider sx={{ my: 5 }} />

                <Box id="Payment">
                    <PaymentOptionsSection
                        nadpis={`Podpořte ${CURRENT_BENEFICIARY_STORY.paymentMessageName ?? CURRENT_BENEFICIARY_STORY.name} finančním darem.`}
                        qrCodeUrl={process.env.NEXT_PUBLIC_QRPAY!}
                        bankAccount="2887773010/3030"
                        variableSymbol={EVENT_CONFIG.year}
                        message={`Pravěk Pro ${CURRENT_BENEFICIARY_STORY.paymentMessageName ?? CURRENT_BENEFICIARY_STORY.name} ${EVENT_CONFIG.year} + jméno a příjmení`}
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
