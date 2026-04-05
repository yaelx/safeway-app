import { z } from "zod";

// This helper now handles both raw numbers and strings that look like numbers
const coordNumber = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
  .refine((val) => !isNaN(val), { message: "Must be a valid number" });

// get in bounds is a post request and coords in body
export const getInBoundsSchema = z.object({
  body: z
    .object({
      minLat: coordNumber,
      maxLat: coordNumber,
      minLng: coordNumber,
      maxLng: coordNumber,
    })
    .optional(),
  // query: z
  //   .object({
  //     minLat: coordNumber,
  //     maxLat: coordNumber,
  //     minLng: coordNumber,
  //     maxLng: coordNumber,
  //   })
  //   .optional(),
});
