"use client";

import { useEffect, useState } from "react";
import { Container, Divider, CircularProgress, Box } from "@mui/material";

import AppShell from "../app-shell";
import CharityPageComponent from "../components/charity-page";
// import PaymentOptionsSection from "../components/payment-section";
import SponsorsSection from "../components/sponsors-section";
import SponsorDialog, { Sponsor } from "../components/sponsor-dialog";

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

                {/* 🟣 BENEFICIENT – celý příběh z Markdownu */}

                <div id="beneficient">
                    <CharityPageComponent />
                </div>
                <Divider sx={{ my: 5 }} />
                {/* Odkomentovat se spuštěním platby
                    <div id="Payment">
                    <PaymentOptionsSection
                        nadpis="Podpořte Elišku finančním darem."
                        qrCodeUrl={process.env.NEXT_PUBLIC_QRPAY!}
                        bankAccount="2887773010/3030"
                        variableSymbol="2026"
                        message="Pravěk Pro Elisku 2026 + jmeno a příjmení"
                    />
                </div>
                */}
                <div id="sponzori">
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
                </div>
            </Container>

            <SponsorDialog sponsor={selectedSponsor} onClose={() => setSelectedSponsor(null)} />
        </AppShell>
    );
}
