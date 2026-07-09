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

  const action = typeof payload.action === "string" ? payload.action : "";

  try {
    switch (action) {
      case "get": {
        const { data, error } = await supabase
          .from("questionnaire_responses")
          .select("*")
          .eq("token_id", tokenRow.id)
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return jsonResponse({ response: null });
          }
          return jsonResponse({ error: error.message }, 500);
        }
        return jsonResponse({ response: data });
      }

      case "save": {
        const responseData = payload.response_data;
        if (responseData === undefined || responseData === null) {
          return jsonResponse({ error: "response_data is required" }, 400);
        }

        // Upsert response for this token
        const { data, error } = await supabase
          .from("questionnaire_responses")
          .upsert(
            { token_id: tokenRow.id, response_data: responseData },
            { onConflict: "token_id" }
          )
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ response: data });
      }

      default:
        return jsonResponse({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
