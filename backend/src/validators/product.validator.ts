import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  minStockAlert: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
});

export const updateProductSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive().optional(),
  minStockAlert: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
});