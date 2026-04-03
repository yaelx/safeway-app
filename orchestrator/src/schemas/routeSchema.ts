import { z } from "zod";

export const routeSchema = z.object({
  query: z.object({
    start: z
      .string()
      .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "Invalid start coordinates"),
    end: z
      .string()
      .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "Invalid end coordinates"),
  }),
});
