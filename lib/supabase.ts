import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase environment variables are missing! Check your .env file.");
}

// Use dummy values to prevent build-time crashes if env vars are missing
export const supabase = createClient(
  supabaseUrl || "https://dummy.supabase.co", 
  supabaseAnonKey || "dummy-key"
);
