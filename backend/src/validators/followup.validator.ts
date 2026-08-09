import { z } from "zod";

export const createFollowUpSchema = z.object({
  note: z.string().min(1, "Follow-up note is required"),
});
