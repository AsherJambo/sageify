import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let payload: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    if (parsed && typeof parsed === "object") {
      payload = parsed as Record<string, unknown>;
    }
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const token = typeof payload.token === "string" ? payload.token.trim() : "";
  if (!token) {
    return jsonResponse({ error: "Token is required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Validate token exists
  const { data: tokenRow, error: tokenError } = await supabase
    .from("questionnaire_tokens")
    .select("id")
    .eq("token", token)
    .single();

  if (tokenError || !tokenRow) {
    return jsonResponse({ error: "Invalid token" }, 401);
  }

  const profileData = payload.profile_data;
  if (!profileData || typeof profileData !== "object") {
    return jsonResponse({ error: "profile_data is required" }, 400);
  }

  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        token_id: tokenRow.id,
        ...profileData,
      },
      { onConflict: "token_id" }
    );

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ success: true });
});
