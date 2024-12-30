export const metadata = {
  title: "Pravěk v ráji",
  description: "Landing page pro benefiční sportovní událost",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  )
}
