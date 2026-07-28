export type Team = {
  id: string;
  name: string;
  plan?: string;
  slug?: string;
  createdAt?: string;
  [key: string]: any; // Catch-all so it never breaks on unexpected fields
};

// Fallback utility type just in case your template needs it later
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
