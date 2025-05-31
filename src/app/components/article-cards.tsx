// components/ArticleCards.tsx

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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ArticleItem {
  id: number;
  title: string;
  image: string;
  dialogImage: string;
  excerpt: string;
  showReadMoreButton: boolean;
  content: string;
  url?: string;
}

export default function ArticleCards() {
  const [articles, setArticles] = React.useState<ArticleItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [openDialog, setOpenDialog] = React.useState<null | number>(null);

  React.useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles");
        if (!res.ok) {
          throw new Error("Chyba při načítání článků");
        }
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const handleOpenDialog = (id: number) => setOpenDialog(id);
  const handleCloseDialog = () => setOpenDialog(null);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 5 }}>
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
                {article.url && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ ml: article.showReadMoreButton ? 1 : 0 }}
                  >
                    Zjistit více
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
                <Box sx={{ textAlign: "center", mb: 3 }}>
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
