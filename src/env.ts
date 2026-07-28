// src/env.ts
const requiredServerEnvVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "GROQ_API_KEY", // optional; but we validate if AI feature is required
] as const;

const requiredPublicEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredServerEnvVars) {
    if (!process.env[key]) missing.push(key);
  }
  for (const key of requiredPublicEnvVars) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map((k) => `  - ${k}`)
        .join("\n")}\n` +
        `Please check your .env.local file. See .env.local.example for reference.`
    );
  }
}

// Optionally parse and export typed variables
export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  GROQ_API_KEY: process.env.GROQ_API_KEY!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
