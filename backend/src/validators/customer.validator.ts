import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z
    .enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"])
    .optional(),
  address: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional(),
  followUpDate: z.coerce.date().optional(),
});

export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "Customer name must be at least 2 characters")
    .optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z
    .enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"])
    .optional(),
  address: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional(),
  followUpDate: z.coerce.date().optional(),
});