import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key. Never import this
 * from a "use client" component — it must stay on the server, since RLS is
 * enabled with no public policies and this key bypasses it entirely.
 */
export function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
