import { z } from "zod";

export const phoneSchema = z.object({
    // Validates a standard 10-digit Indian phone number (we will prepend '91' on submit)
    phone: z.string()
        .length(10, "Phone number must be exactly 10 digits")
        .regex(/^[0-9]+$/, "Must contain only numbers"),
});

export const otpSchema = z.object({
    otp: z.string()
        .length(4, "OTP must be exactly 4 digits") // Based on your 'XXXX' example
        .regex(/^[0-9]+$/, "OTP must contain only numbers"),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;