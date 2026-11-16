const SUPABASE_URL = "https://oanbtzteruovfjnsoowp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Qu-RcdwiPFJ2PAdFaEIM8w_tOg0eWcw";

let supabase = null;

if (
    SUPABASE_URL.startsWith("https://oanbtzteruovfjnsoowp.supabase.co") &&
    !SUPABASE_URL.includes("https://oanbtzteruovfjnsoowp.supabase.co") &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes("sb_publishable_Qu-RcdwiPFJ2PAdFaEIM8w_tOg0eWcw")
) {
    const { createClient } = await import(
        "https://esm.sh/@supabase/supabase-js@2"
    );
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export {supabase};