import { z } from "zod";

export const YEARS = ["1st year", "2nd year", "3rd year", "Postgraduate"] as const;

export const waitlistSchema = z.object({
  name: z
    .string({ required_error: "Enter your first name." })
    .trim()
    .min(1, "Enter your first name.")
    .max(40, "Keep it under 40 characters.")
    .regex(/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u, "Use letters only, please."),
  email: z
    .string({ required_error: "Enter a valid email address." })
    .trim()
    .toLowerCase()
    .max(254, "Enter a valid email address.")
    .email("Enter a valid email address."),
  year: z.enum(YEARS, {
    errorMap: () => ({ message: "Pick your year of study." }),
  }),
  isAdult: z.literal(true, {
    errorMap: () => ({ message: "You must be 18 or older to join." }),
  }),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please agree to the Privacy Policy and Terms." }),
  }),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type FieldErrors = Partial<Record<keyof WaitlistInput, string>>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof WaitlistInput | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
