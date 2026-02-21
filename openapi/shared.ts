import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export { z };

export const ErrorSchema = z.object({
  error: z.string(),
  detail: z.string().optional(),
});
