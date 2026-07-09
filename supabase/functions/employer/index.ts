import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-employer-password, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

  const employerPassword = req.headers.get("x-employer-password")?.trim();
  if (!employerPassword) {
    return jsonResponse({ error: "Employer password is required" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify organization by password
  const { data: orgs, error: orgError } = await supabase
    .from("organizations")
    .select("id, org_name, logo_url, custom_welcome_message, admin_email")
    .eq("admin_password", employerPassword)
    .limit(1);

  if (orgError || !orgs || orgs.length === 0) {
    return jsonResponse({ error: "Invalid employer password" }, 401);
  }

  const org = orgs[0];

  let payload: Record<string, unknown> = {};
  if (req.method !== "GET") {
    try {
      const parsed = await req.json();
      if (parsed && typeof parsed === "object") {
        payload = parsed as Record<string, unknown>;
      }
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || (typeof payload.action === "string" ? payload.action : "");

  try {
    switch (action) {
      case "get-org": {
        return jsonResponse({ organization: org });
      }

      case "list-tokens": {
        const { data, error } = await supabase
          .from("questionnaire_tokens")
          .select("*, questionnaire_responses(*)")
          .eq("organization_id", org.id)
          .order("created_at", { ascending: false });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ tokens: data });
      }

      case "create-token": {
        const username = typeof payload.username === "string" ? payload.username.trim() : "";
        if (!username) return jsonResponse({ error: "Username is required" }, 400);
        const { data, error } = await supabase
          .from("questionnaire_tokens")
          .insert({ username, organization_id: org.id })
          .select()
          .single();
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ token: data });
      }

      case "create-tokens-bulk": {
        const usernames = Array.isArray(payload.usernames) ? payload.usernames : [];
        const rows = usernames
          .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
          .map((u) => ({ username: u.trim(), organization_id: org.id }));
        if (rows.length === 0) return jsonResponse({ error: "No valid usernames" }, 400);
        const { error } = await supabase.from("questionnaire_tokens").insert(rows);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true, count: rows.length });
      }

      case "delete-token": {
        const tokenId = typeof payload.tokenId === "string" ? payload.tokenId : null;
        if (!tokenId) return jsonResponse({ error: "tokenId required" }, 400);
        const { error } = await supabase.from("questionnaire_tokens").delete().eq("id", tokenId);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true });
      }

      case "submit-feedback": {
        const feedbackText = typeof payload.feedback_text === "string" ? payload.feedback_text.trim() : "";
        if (!feedbackText) return jsonResponse({ error: "feedback_text is required" }, 400);
        const { error } = await supabase.from("employer_feedback").insert({
          organization_id: org.id,
          feedback_text: feedbackText,
          feedback_type: typeof payload.feedback_type === "string" ? payload.feedback_type : "ui_suggestion",
        });
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
