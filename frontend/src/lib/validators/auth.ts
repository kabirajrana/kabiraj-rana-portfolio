import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  csrfToken: z.string().min(10),
});
