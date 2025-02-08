export const metadata = {
  title: "Pravěk v ráji",
  description: "Benefiční dogtrekking",
  openGraph: {
    title: "Pravěk v ráji",
    description: "Benefiční dogtreking",
    url: "https://pravek-v-raji.cz",
    siteName: "Pravěk v ráji",
    images: [
      {
        url: "/img/image.png", // Použití cesty z public/
        width: 1200,
        height: 630,
        alt: "Pravěk v ráji - Benefiční dogtrekking",
      },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pravěk v ráji",
    description: "Benefiční dogtrekking",
    images: ["/img/image.png"], // Twitter také použije stejný obrázek
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
