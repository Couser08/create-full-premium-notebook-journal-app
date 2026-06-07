import { createClient } from "@supabase/supabase-js";

// Grab variables from Vite environment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (isSupabaseConfigured) {
  console.log("✅ Supabase is configured and active.");
} else {
  console.warn("⚠️ Supabase keys are missing. Running in Mock Mode (Local Storage only).");
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
