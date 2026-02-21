import { z } from "zod";

export const openapi = {
  method: "get",
  path: "/api/articles",
  tags: ["web"],
  summary: "GET /api/articles",
  description: "TODO: describe this endpoint.",
  // Optional: request schemas
  // request: {
  //   query: z.object({}),
  //   params: z.object({}),
  //   body: z.object({}),
  // },
  responses: {
    200: z.any(),
    500: z.object({ error: z.string(), detail: z.string().optional() }),
  },
} as const;
