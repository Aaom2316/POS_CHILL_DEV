window.POS = window.POS || {};
POS.supabase = window.supabase.createClient(
  POS_CONFIG.SUPABASE_URL,
  POS_CONFIG.SUPABASE_PUBLISHABLE_KEY,
  {auth:{persistSession:true,autoRefreshToken:true}}
);
