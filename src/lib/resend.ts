import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "");

/**
 * Default "From" address for transactional email.
 *
 * Set EMAIL_FROM to a Resend-verified sender in production, e.g.
 *   EMAIL_FROM="Jagamn Palace <reservations@yourdomain.com>"
 *
 * Falls back to Resend's shared onboarding sender, which works without domain
 * verification for testing (delivers to the Resend account owner's address).
 */
export const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() || "Jagamn Palace <onboarding@resend.dev>";
