import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid clinical or patient email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  rolePreference: z.enum(["patient", "doctor", "admin"]).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const MagicLinkSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export type MagicLinkInput = z.infer<typeof MagicLinkSchema>;

export const SignupSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
    role: z.enum(["patient", "doctor"], {
      message: "Please select your clinical or patient role.",
    }),
    phone: z.string().optional(),
    // Patient medical fields
    age: z.string().optional(),
    gender: z.string().optional(),
    bloodGroup: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    chronicConditions: z.string().optional(),
    allergies: z.string().optional(),
    currentMedications: z.string().optional(),
    emergencyContact: z.string().optional(),
    city: z.string().optional(),
    enableCallAssistant: z.boolean().optional(),
    // Doctor clinical fields
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    workExperience: z.string().optional(),
    hospital: z.string().optional(),
    registrationNo: z.string().optional(),
    consultationFee: z.string().optional(),
    consultationMode: z.string().optional(),
    bio: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "doctor") {
        return !!data.specialization && data.specialization.length >= 2;
      }
      return true;
    },
    {
      message: "Doctors must specify their clinical specialization.",
      path: ["specialization"],
    }
  );

export type SignupInput = z.infer<typeof SignupSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ConsentSchema = z.object({
  consentGiven: z.literal(true, {
    message: "You must check the agreement to grant intake consent.",
  }),
  understoodAi: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge that AI agents augment clinical transcription.",
  }),
  understoodDoctorReview: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge that a licensed physician verifies all diagnoses and prescriptions.",
  }),
  understoodSynthetic: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge this trial uses synthetic prototype safeguards.",
  }),
});

export type ConsentInput = z.infer<typeof ConsentSchema>;
