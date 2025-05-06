"use client";

import * as React from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Import ikony křížku

// Data pro články
const articles = [
    {
        id: 1,
        title: `Proč zrovna "Pravěk v Ráji"?`,
        image: "/img/1685012737662.webp",
        dialogImage: "/img/1685012737662.webp", // Fotka do dialogu
        excerpt: "Důvod je prostý. S partou přátel jsme se rozhodli uspořádat dogtrekking...",
        showReadMoreButton: true,
        content: `
      <p>Důvod je prostý. S partou přátel jsme se rozhodli uspořádat dogtrekking, který povede srdcem Českého ráje. Protože je to akce benefiční, vteřiny nejsou to nejdůležitější, oč tady kráčí. Čas vůbec měřit nebudeme. Celá akce je koncipovaná tak, aby přinesla nějaké penízky tam, kde je to potřeba.</p>
      
      <p>Od této akce si také slibujeme návrat ke kořenům dogtrekkingu. 
      Znovu objevení krásy několikadenních pochodů a především bivaku 
      v přírodě se čtyřnohým parťákem.</p>
    `,
    },
    {
        id: 2,
        title: "Jak to celé vzniklo?",
        image: "/img/20220416_191043.webp",
        dialogImage: "/img/20220416_191043.webp", // Fotka do dialogu
        excerpt: "Od doby, co mám Jardu je Vyskeř v Českém ráji moje druhé doma. Krásná vesnička...",
        showReadMoreButton: true,
        content: `
      <p>Od doby, co mám Jardu je Vyskeř v Českém ráji moje druhé doma. Krásná vesnička, jejíž dominantou je kaple Sv. Anny, která se nachází na vrcholku čedičového kopce.</p>
      <p>Jednou takhle v březnu byla vypsaná hasičská brigáda právě na kapličce. Poměrně nepopulární práce, vyřezávání křoví. Když jsem odpočívala a rozhlédla se do kraje, první co mi proletělo hlavou bylo...  "Tady by byl sakra krásnej trekk".. Věděla jsem ale, že po 5 letech pořádání dogtrekkingu Po stopách Toulovce v rámci MČR do toho už nechci jít. Důvodů bylo několik, ale ten hlavní byl asi ten, že se dle mého názoru dogtrekk ubírá úplně jiným směrem než byla jeho původní myšlenka. A pak jsem taky hodně přehodnotila, svoje životní priority.. Proto jsem se rozhodla udělat to jinak - neměřit čas, aby šly sportovní ambice a honba za vteřinami stranou. Myšlenka benefice přišla v podstatě hned vzápětí.</p>
      <p>Vyskeř je vesnice, kde se mi moc líbí hlavně kvůli soudržnosti všech obyvatel. Ať už se tu pořádá nebo děje cokoli, vždy se na tom podílí velká část vesnice. Proto jsem si byla jistá, že v tom nezůstanu sama a je to vlastně důvod, proč chci pomoci někomu místnímu.. A tady příběh začíná neuvěřitelně nabírat na obrátkách. Starosta obce, Honzík Kozák, mi dal typ na mladou holčinu na vozíčku. V té chvíli jsem o Elen nevěděla o moc víc. Přesto mi to stačilo k tomu, abych se rozhodla, že do toho půjdu.</p>
      <p>Když jsem odpočívala a rozhlédla se do kraje, první co mi proletělo hlavou bylo...
      S velkým odhodláním jsem oslovila kamarády, co nám pomáhali s Toulovcem. Vsadila jsem na ty nejlepší! Všichni, které jsem o pomoc požádala souhlasili a tak si troufám říct, že tento osvědčený dream team zvládne uspořádat boží dogtrekk! :)</p>
    `,
    },
    {
        id: 3,
        title: `Geloren stánek`,
        image: "https://cdn.myshoptet.com/usr/www.geloren.cz/user/shop/big/150-1_geloren-dog-xl-mockup-web.jpg?65c5dba6",
        dialogImage: "https://cdn.myshoptet.com/usr/www.geloren.cz/user/shop/big/150-1_geloren-dog-xl-mockup-web.jpg?65c5dba6", // Fotka do dialogu
        excerpt: "V sobotu se můžeš těšit na geloren stánek, platba bude možná hotově, nebo přes QRcode",
        showReadMoreButton: false,
        content: ``,
    },
];

export default function ArticleCards() {
    const [openDialog, setOpenDialog] = React.useState<null | number>(null);

    const handleOpenDialog = (id: number) => setOpenDialog(id);
    const handleCloseDialog = () => setOpenDialog(null);

    return (
        <Box sx={{ mb: 5 }}>
            {/* Karty */}
            <Grid container spacing={3}>
                {articles.map((article) => (
                    <Grid item xs={12} md={6} key={article.id}>
                        <Card sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <CardMedia
                                component="img"
                                image={article.image}
                                alt={article.title}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    margin: 2,
                                }}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {article.title}
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    {article.excerpt}
                                </Typography>
                                {article.showReadMoreButton && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleOpenDialog(article.id)}
                                    >
                                        Číst více
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog */}
            {articles.map(
                (article) =>
                    openDialog === article.id && (
                        <Dialog
                            key={article.id}
                            open={openDialog === article.id}
                            onClose={handleCloseDialog}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogTitle>
                                {article.title}
                                {/* Křížek pro zavření dialogu */}
                                <IconButton
                                    aria-label="close"
                                    onClick={handleCloseDialog}
                                    sx={{
                                        position: "absolute",
                                        right: 8,
                                        top: 8,
                                        color: (theme) => theme.palette.grey[500],
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                {/* Fotografie v dialogu */}
                                <Box
                                    sx={{
                                        textAlign: "center",
                                        mb: 3,
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={article.dialogImage}
                                        alt={article.title}
                                        sx={{
                                            maxWidth: "100%",
                                            maxHeight: "300px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </Box>

                                {/* Obsah s odstavci */}
                                <Box
                                    sx={{
                                        typography: "body1",
                                    }}
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            </DialogContent>
                        </Dialog>
                    )
            )}
        </Box>
    );
}
