"use client";

import { useEffect } from "react";
import { Container, Divider } from "@mui/material";

import AppShell from "../app-shell";
import ArticleCards from "../components/article-cards";
import HeroSection from "../components/hero-section";
import ContactSection from "../components/contact-section";
import CharityTeaser from "../components/charity-teaser";

export default function HomePage() {

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

    return (
        <AppShell menuType="home">
            <HeroSection />

            <Container maxWidth="lg" sx={{ py: 5 }}>
                <ArticleCards />
                <Divider sx={{ my: 5 }} />
                <CharityTeaser />

                <Divider sx={{ my: 5 }} />

                <ContactSection />
            </Container>
        </AppShell>
    );
}
