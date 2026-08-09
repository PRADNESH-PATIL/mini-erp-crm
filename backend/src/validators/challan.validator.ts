import { z } from "zod";

export const createChallanSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),

  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z
          .number()
          .int()
          .positive("Quantity must be greater than 0"),
      })
    )
    .min(1, "Challan must contain at least one item"),
});

export const updateChallanSchema = z.object({
  customerId: z
    .string()
    .min(1, "Customer ID is required"),

  items: z
    .array(
      z.object({
        productId: z
          .string()
          .min(1, "Product ID is required"),

        quantity: z
          .number()
          .int()
          .positive("Quantity must be greater than 0"),
      })
    )
    .min(1, "Challan must contain at least one item"),
});