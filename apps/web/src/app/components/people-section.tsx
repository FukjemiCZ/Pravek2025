"use client";

import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import DynamicButton from "@/app/components/dynamic-button";
interface PersonResult {
  Platba: string;
  Stav: string;
  "Časová značka": string;
  "E-mailová adresa": string;
  Jméno: string;
  Přijmení: string;
  "Telefonní číslo": string;
}

export default function PeopleSection() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<PersonResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const nahradniciAktivni = process.env.NEXT_PUBLIC_NAHRADNICI_AKTIVNI !== "false";

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/find-person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error("Chyba při načítání dat");
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Neznámá chyba");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCardStyle = (stav: string, platba: string) => {
    if (stav === "ANO" && platba === "ANO") {
      return { backgroundColor: "#e8f5e9", border: "2px solid green" };
    }
    if (stav.toLowerCase() === "náhradník") {
      return { backgroundColor: "#fffde7", border: "2px solid #fbc02d" };
    }
    if (stav.startsWith("Odhlásil se")) {
      return { backgroundColor: "#f5f5f5", border: "1px solid #ccc" };
    }
    return {};
  };

  const getStatusLine = (stav: string, platba: string) => {
    let stavText = "ℹ️ Stav neznámý";
    if (stav === "ANO") stavText = "✅ Na startovce";
    else if (stav.toLowerCase() === "náhradník") stavText = "🕒 Náhradník";
    else if (stav.startsWith("Odhlásil se")) stavText = "❌ Odhlásil se";

    const platbaText = platba === "ANO" ? "💰 Zaplaceno" : "🚫 Nezaplaceno";
    return stav.startsWith("Odhlásil se") ? stavText : `${stavText} • ${platbaText}`;
  };

  return (
    <Box id="startovka" sx={{ mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Jsem na startovce a mám zaplaceno?
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Zadej telefon nebo email"
          variant="outlined"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Čmuchat
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {results.length > 0 && (
        <Grid container spacing={3}>
          {results.map((person, index) => {
            const isConfirmed = person.Stav === "ANO";
            const isWithdrawn = person.Stav.startsWith("Odhlásil se");
            const isWithdrawnHard = person.Stav === "Odhlásil se, záporné body";
            const isBackup = person.Stav.toLowerCase() === "náhradník";
            const isPaid = person.Platba === "ANO";

            return (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={getCardStyle(person.Stav, person.Platba)}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {person.Jméno} {person.Přijmení}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      {getStatusLine(person.Stav, person.Platba)}
                    </Typography>

                    <Typography variant="body2">
                      Email: {person["E-mailová adresa"]}
                    </Typography>
                    <Typography variant="body2">
                      Telefon: {person["Telefonní číslo"]}
                    </Typography>
                    <Typography variant="body2">
                      Datum registrace: {person["Časová značka"]}
                    </Typography>

                    {isConfirmed && isPaid && (
                      <Box mt={2}>
                        <Typography variant="body1" color="success.main" fontWeight="bold">
                          Děkujeme za zaplacení startovného! Těšíme se na vás!
                        </Typography>
                      </Box>
                    )}

                    {isConfirmed && !isPaid && (
                      <Box mt={3}>
                        <CardMedia
                          component="img"
                          image={process.env.NEXT_PUBLIC_QRPAY!}
                          alt="QR kód pro platbu"
                          sx={{ maxWidth: 200, mb: 2 }}
                        />
                        <Typography variant="body2">
                          <strong>Pro platbu startovného a finanční podporu použijte prosím následující údaje:</strong>
                        </Typography>
                        <Typography variant="body2" mt={1}>
                          Číslo účtu: <strong>2887773010/3030</strong>
                        </Typography>
                        <Typography variant="body2">
                          Poznámka: <strong>Pravěk Pro Elisku 2026 + {person.Jméno} {person.Přijmení}</strong>
                        </Typography>
                        <Typography variant="body2" mt={2}>
                          Startovné je stanoveno na minimálně <strong>600 Kč</strong>, ale velmi oceníme, pokud se rozhodnete přispět vyšší částkou.
                          Vaše štědrost pomůže Elišce tam, kde je to nejvíce potřeba. <strong>Děkujeme za vaši podporu!</strong>
                        </Typography>
                      </Box>
                    )}

                    {isWithdrawn && (
                      <Box mt={2}>
                        <Typography variant="body1" color="error" fontWeight="bold">
                          Mrzí nás, že jste se odhlásili 😢
                        </Typography>
                        <Typography variant="body2" mt={1}>
                          {isWithdrawnHard ? (
                            <>Přesto vám přejeme všechno dobré a organizátor si zaslouží oříškovou čokoládu 🍫 za každou ztracenou dušičku!</>
                          ) : (
                            <>Přesto vám přejeme všechno dobré a snad se potkáme příště!</>
                          )}
                        </Typography>
                      </Box>
                    )}

                    {isBackup && isPaid && (
                      <Box mt={2}>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          🎆 DĚKUJEME TI, NÁHRADNÍKU! 🎆
                        </Typography>
                        <Typography variant="body2" mt={1}>
                          Tvoje podpora je pro nás velmi cenná a pokud se dostaneš na startovku, budeme tě kontaktovat e-mailem.
                          Tvoje platba se v takovém případě automaticky počítá jako startovné.
                        </Typography>
                      </Box>
                    )}

                    {isBackup && !isPaid && (
                      <Box mt={3}>
                        <Typography variant="body1" fontWeight="bold">
                          Věříme, že se na startovce brzy objevíš!
                        </Typography>
                        <Typography variant="body2" mt={1}>
                          Nezapomeň sledovat náš web. Pokud nás chceš podpořit, můžeš využít QR kód níže. Pokud se dostaneš na startovku,
                          platba bude automaticky brána jako startovné.
                        </Typography>

                        <CardMedia
                          component="img"
                          image={process.env.NEXT_PUBLIC_QRPAY!}
                          alt="QR kód pro platbu"
                          sx={{ maxWidth: 200, my: 2 }}
                        />

                        <Typography variant="body2">
                          <strong>Číslo účtu:</strong> 2887773010/3030
                        </Typography>
                        <Typography variant="body2">
                          <strong>Poznámka:</strong> Pravěk Pro Elišku 2026 + {person.Jméno} {person.Přijmení}
                        </Typography>
                        <Typography variant="body2" mt={2}>
                          V případě, že se na startovku nedostaneš, platbu považujeme za dobrovolnou podporu a nebudeme ji vracet.
                          <strong> Děkujeme ti za ochotu a podporu!</strong>
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

{!loading && hasSearched && results.length === 0 && !error && (
  <Box sx={{ mt: 4, textAlign: "center" }}>
    <Typography gutterBottom>
      🐾 Tebe jsme tu nevyčmuchali – zkus to znovu pomocí telefonu nebo e-mailu.
    </Typography>
    <Typography gutterBottom>
      Pokud se ti to ani na podruhé nedaří, je dost možné, že ses nepřihlásil.
    </Typography>

    {nahradniciAktivni && (
      <>
        <Typography gutterBottom>
          Klikni níže a zaregistruj se jako náhradník. Budeme tě kontaktovat, pokud se uvolní místo.
        </Typography>
        <DynamicButton buttonId="register" sx={{ mt: 2 }} />
      </>
    )}
  </Box>
)}
    </Box>
  );
}
