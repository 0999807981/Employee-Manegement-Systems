const SUPABASE_URL = "https://btdlumumlgqvypeeutom.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UhgYJ7k1w4l0SVOFLEy4rQ_mIEW7CB3";
const APP_STATE_ROW_ID = "main";

function hasValidSupabaseConfig() {
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("PASTE_YOUR") &&
    !SUPABASE_ANON_KEY.includes("PASTE_YOUR") &&
    window.supabase
  );
}

const supabaseClient = hasValidSupabaseConfig()
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

window.db = {
  enabled: !!supabaseClient,
  client: supabaseClient,

  async loadAppState() {
    if (!supabaseClient) return null;

    const { data, error } = await supabaseClient
      .from("app_state")
      .select("state")
      .eq("id", APP_STATE_ROW_ID)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data?.state || null;
  },

  async saveAppState(state) {
    if (!supabaseClient) return false;

    const { error } = await supabaseClient
      .from("app_state")
      .upsert(
        {
          id: APP_STATE_ROW_ID,
          state,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

    if (error) throw error;
    return true;
  }
};
