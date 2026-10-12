(() => {
  const config = window.RUQO_SUPABASE_CONFIG;
  const createClient = window.supabase?.createClient;
  if (!config?.url || !config?.publishableKey || !createClient) {
    console.warn("RUQO Supabase client is not configured; using the local catalog.");
    return;
  }

  const client = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  window.RUQO_SUPABASE = client;
  window.RUQO_SUPABASE_READY = window.NoursData?.loadFromSupabase(client)
    .then((loaded) => {
      if (!loaded) return false;
      window.dispatchEvent(new CustomEvent("ruqo:catalog-updated"));
      return true;
    })
    .catch((error) => {
      console.warn("Could not load the RUQO catalog from Supabase; using the local catalog.", error.message);
      return false;
    });
})();
