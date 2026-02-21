import { z } from "zod";

export const openapi = {
  method: "post",
  path: "/api/find-person",
  tags: ["web"],
  summary: "POST /api/find-person",
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
