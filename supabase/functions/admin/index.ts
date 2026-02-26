import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

  const adminPassword = Deno.env.get("ADMIN_PASSWORD");
  const providedPassword = req.headers.get("x-admin-password")?.trim();

  if (!adminPassword) {
    return jsonResponse({ error: "Admin password is not configured" }, 500);
  }

  if (!providedPassword || providedPassword !== adminPassword.trim()) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "create-token": {
        const { username } = await req.json();
        if (!username || typeof username !== "string" || username.trim().length === 0) {
          return jsonResponse({ error: "Username is required" }, 400);
        }
        const { data, error } = await supabase
          .from("questionnaire_tokens")
          .insert({ username: username.trim() })
          .select()
          .single();
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ token: data });
      }

      case "create-tokens-bulk": {
        const { usernames } = await req.json();
        if (!Array.isArray(usernames) || usernames.length === 0) {
          return jsonResponse({ error: "Usernames array is required" }, 400);
        }
        const rows = usernames
          .filter((u: string) => typeof u === "string" && u.trim().length > 0)
          .map((u: string) => ({ username: u.trim() }));
        const { data, error } = await supabase
          .from("questionnaire_tokens")
          .insert(rows)
          .select();
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ tokens: data });
      }

      case "list-tokens": {
        const { data, error } = await supabase
          .from("questionnaire_tokens")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ tokens: data });
      }

      case "get-responses": {
        const tokenId = url.searchParams.get("tokenId");
        if (!tokenId) return jsonResponse({ error: "tokenId required" }, 400);
        const { data, error } = await supabase
          .from("questionnaire_responses")
          .select("*")
          .eq("token_id", tokenId)
          .single();
        if (error) return jsonResponse({ error: error.message }, 404);
        return jsonResponse({ response: data });
      }

      case "all-responses": {
        const { data, error } = await supabase
          .from("questionnaire_tokens")
          .select("*, questionnaire_responses(*)");
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data });
      }

      case "delete-token": {
        const { tokenId } = await req.json();
        if (!tokenId) return jsonResponse({ error: "tokenId required" }, 400);
        const { error } = await supabase
          .from("questionnaire_tokens")
          .delete()
          .eq("id", tokenId);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true });
      }

      default:
        return jsonResponse({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
