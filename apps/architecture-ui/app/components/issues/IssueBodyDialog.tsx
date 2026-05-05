"use client";

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Link as MuiLink,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkGemoji from "remark-gemoji";

export default function IssueBodyDialog({
    open,
    onClose,
    title,
    url,
    body,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    url?: string;
    body?: string | null;
}) {
    const value = (body ?? "").trim() || "_No description._";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900 }} noWrap>
                        {title}
                    </Typography>
                    {url && (
                        <MuiLink href={url} target="_blank" rel="noreferrer" variant="body2">
                            Open on GitHub
                        </MuiLink>
                    )}
                </Box>
                <IconButton onClick={onClose} aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box
                    sx={{
                        "& h1": { fontSize: 22, fontWeight: 900, mt: 1, mb: 1 },
                        "& h2": { fontSize: 18, fontWeight: 900, mt: 1.5, mb: 1 },
                        "& h3": { fontSize: 16, fontWeight: 800, mt: 1.25, mb: 0.75 },
                        "& p": { m: 0, mb: 1.25, lineHeight: 1.6 },
                        "& ul, & ol": { mt: 0, mb: 1.25, pl: 3 },
                        "& li": { mb: 0.5 },
                        "& blockquote": {
                            m: 0,
                            mb: 1.25,
                            pl: 2,
                            borderLeft: "4px solid",
                            borderColor: "divider",
                            opacity: 0.9,
                        },
                        "& code": {
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            fontSize: 12,
                            bgcolor: "rgba(0,0,0,0.04)",
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                        },
                        "& pre": {
                            m: 0,
                            mb: 1.25,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            overflow: "auto",
                            fontSize: 12,
                        },
                        "& pre code": { bgcolor: "transparent", p: 0 },
                        "& a": { color: "primary.main" },
                        "& hr": { border: 0, borderTop: "1px solid", borderColor: "divider", my: 2 },
                    }}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkGemoji]}
                        components={{
                            a: ({ href, children, ...props }) => (
                                <MuiLink href={href} target="_blank" rel="noreferrer" {...props}>
                                    {children}
                                </MuiLink>
                            ),
                        }}
                    >
                        {value}
                    </ReactMarkdown>
                </Box>
            </DialogContent>
        </Dialog>
    );
}