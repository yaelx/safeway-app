import { z } from "zod";

// Helper to transform string to number and validate coordinate range
const coordNumber = z
  .string()
  .transform((val) => parseFloat(val))
  .refine((val) => !isNaN(val), { message: "Must be a valid number" });

export const getInBoundsSchema = z.object({
  query: z.object({
    minLat: coordNumber,
    maxLat: coordNumber,
    minLng: coordNumber,
    maxLng: coordNumber,
  }),
});
