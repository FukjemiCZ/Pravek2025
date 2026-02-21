import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z, ErrorSchema } from "./shared";

export const registryWeb = new OpenAPIRegistry();

registryWeb.register("Error", ErrorSchema);

// Example: GET /api/health (doporučuji přidat do web appky)
const HealthSchema = registryWeb.register(
  "Health",
  z.object({
    ok: z.boolean(),
    service: z.string(),
    time: z.string(),
  })
);

registryWeb.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["web"],
  description: "Basic health endpoint for the public web app",
  responses: {
    200: { description: "OK", content: { "application/json": { schema: HealthSchema } } },
  },
});

// Example placeholder: gallery endpoints (přizpůsobíš dle reality)
const GalleryItem = registryWeb.register(
  "GalleryItem",
  z.object({
    src: z.string(),
    alt: z.string().optional(),
    position: z.number().optional(),
  })
);

registryWeb.registerPath({
  method: "get",
  path: "/api/gallery",
  tags: ["web"],
  description: "Returns gallery items",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({ items: z.array(GalleryItem) }),
        },
      },
    },
    500: {
      description: "Failure",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});