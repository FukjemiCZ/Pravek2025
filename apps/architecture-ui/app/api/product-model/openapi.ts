import { z } from "zod";

export const openapi = {
  method: "get",
  path: "/api/product-model",
  tags: ["architecture-ui"],
  summary: "Unified product-model dataset proxy (GitHub Pages source)",
  description:
    "Fetches catalog/runtime/roadmap/ownership/heatmap/compiled JSON from GitHub Pages and returns them as a single JSON payload.",
  responses: {
    200: z.object({
      catalog: z.any(),
      runtime: z.any(),
      roadmap: z.any(),
      ownership: z.any(),
      heatmap: z.any(),
      compiled: z.any(),
    }),
    500: z.object({
      error: z.string(),
      detail: z.string().optional(),
    }),
  },
} as const;