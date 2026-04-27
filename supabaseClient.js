// Supabase client initialization (used with the Supabase JS CDN script).
// This file is loaded in the browser; anon/publishable keys are public-by-design.
// Keep RLS enabled and only allow intended reads via policies.

// Project URL (no trailing slash)
// If you want to replace it with your own, paste it here.
const SUPABASE_URL = "https://ahldlvrflijamguspxyi.supabase.co";

// anon / publishable key
// If you want to replace it with your own, paste it here.
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobGRsdnJmbGlqYW1ndXNweHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNjE2NTMsImV4cCI6MjA5MjgzNzY1M30.aQcUbGF9j2lIv8_XwJ341u1PJi49ou_RN8_Eh6cejQc";

(function initSupabaseClient() {
  if (!globalThis.supabase || typeof globalThis.supabase.createClient !== "function") {
    throw new Error(
      "Supabase CDN not loaded. Include https://cdn.jsdelivr.net/npm/@supabase/supabase-js before supabaseClient.js."
    );
  }
  globalThis.supabaseClient = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();

