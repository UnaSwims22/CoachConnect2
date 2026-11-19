import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.0?bundle";

// Supabase project credentials.
const SUPABASE_URL = "https://oanbtzteruovfjnsoowp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Qu-RcdwiPFJ2PAdFaEIM8w_tOg0eWcw";



// Connect to Supabase.
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

