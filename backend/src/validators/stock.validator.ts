import { z } from "zod";

export const stockMovementSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  reason: z.string().optional(),
});