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

  const markUsed = payload.markUsed === true;
  const isAdminMode = payload.isAdminMode === true;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: tokenRow, error } = await supabase
    .from("questionnaire_tokens")
    .select("id, username, used, completed_at")
    .eq("token", token)
    .single();

  if (error || !tokenRow) {
    return jsonResponse({ error: "Invalid token" }, 401);
  }

  if (tokenRow.completed_at && !isAdminMode) {
    return jsonResponse({ error: "Token already completed" }, 410);
  }

  if (markUsed && !isAdminMode && !tokenRow.used) {
    await supabase.from("questionnaire_tokens").update({ used: true }).eq("id", tokenRow.id);
  }

  return jsonResponse({
    id: tokenRow.id,
    username: tokenRow.username,
    used: tokenRow.used,
    completed_at: tokenRow.completed_at,
  });
});
