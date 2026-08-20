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
  let payload: Record<string, unknown> = {};

  if (req.method !== "GET") {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const parsed = await req.json();
        if (parsed && typeof parsed === "object") {
          payload = parsed as Record<string, unknown>;
        }
      } catch {
        payload = {};
      }
    }
  }

  const bodyAction = typeof payload.action === "string" ? payload.action : null;
  const action = url.searchParams.get("action") ?? bodyAction;

  try {
    switch (action) {
      case "create-token": {
        const username = typeof payload.username === "string" ? payload.username : "";
        if (username.trim().length === 0) {
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
        const usernames = Array.isArray(payload.usernames) ? payload.usernames : [];
        if (usernames.length === 0) {
          return jsonResponse({ error: "Usernames array is required" }, 400);
        }
        const rows = usernames
          .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
          .map((u) => ({ username: u.trim() }));

        if (rows.length === 0) {
          return jsonResponse({ error: "No valid usernames provided" }, 400);
        }

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
        const tokenIdFromBody = typeof payload.tokenId === "string" ? payload.tokenId : null;
        const tokenId = url.searchParams.get("tokenId") ?? tokenIdFromBody;
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
        const tokenId = typeof payload.tokenId === "string" ? payload.tokenId : null;
        if (!tokenId) return jsonResponse({ error: "tokenId required" }, 400);
        const { error } = await supabase
          .from("questionnaire_tokens")
          .delete()
          .eq("id", tokenId);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true });
      }

      case "list-contact-submissions": {
        const { data, error } = await supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ submissions: data });
      }

      case "list-meeting-bookings": {
        const { data, error } = await supabase
          .from("meeting_bookings")
          .select("*")
          .order("meeting_date", { ascending: true })
          .order("meeting_time", { ascending: true });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ bookings: data });
      }

      case "delete-meeting-booking": {
        const bookingId = typeof payload.bookingId === "string" ? payload.bookingId : null;
        if (!bookingId) return jsonResponse({ error: "bookingId required" }, 400);
        const { error } = await supabase
          .from("meeting_bookings")
          .delete()
          .eq("id", bookingId);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true });
      }

      case "list-global-retiree-insights": {
        const { data, error } = await supabase
          .from("global_retiree_insights")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ insights: data });
      }

      case "list-organizations": {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, org_name, logo_url, admin_email, custom_welcome_message, created_at")
          .order("created_at", { ascending: false });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ organizations: data });
      }

      case "create-organization": {
        const name = typeof payload.org_name === "string" ? payload.org_name.trim() : "";
        const email = typeof payload.admin_email === "string" ? payload.admin_email.trim() : "";
        const pw = typeof payload.admin_password === "string" ? payload.admin_password : "";
        if (!name || !email || !pw) {
          return jsonResponse({ error: "org_name, admin_email, and admin_password are required" }, 400);
        }
        const { data, error } = await supabase
          .from("organizations")
          .insert({
            org_name: name,
            admin_email: email,
            admin_password: pw,
            logo_url: typeof payload.logo_url === "string" ? payload.logo_url.trim() || null : null,
            custom_welcome_message: typeof payload.custom_welcome_message === "string" ? payload.custom_welcome_message.trim() : "",
          })
          .select("id, org_name, logo_url, admin_email, custom_welcome_message, created_at")
          .single();
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ organization: data });
      }

      case "update-organization": {
        const orgId = typeof payload.orgId === "string" ? payload.orgId : null;
        if (!orgId) return jsonResponse({ error: "orgId required" }, 400);
        const updates: Record<string, unknown> = {};
        if (typeof payload.org_name === "string") updates.org_name = payload.org_name.trim();
        if (typeof payload.admin_email === "string") updates.admin_email = payload.admin_email.trim();
        if (typeof payload.admin_password === "string") updates.admin_password = payload.admin_password;
        if (typeof payload.logo_url === "string") updates.logo_url = payload.logo_url.trim() || null;
        if (typeof payload.custom_welcome_message === "string") updates.custom_welcome_message = payload.custom_welcome_message.trim();
        if (Object.keys(updates).length === 0) {
          return jsonResponse({ error: "No fields to update" }, 400);
        }
        const { data, error } = await supabase
          .from("organizations")
          .update(updates)
          .eq("id", orgId)
          .select("id, org_name, logo_url, admin_email, custom_welcome_message, created_at")
          .single();
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ organization: data });
      }

      case "delete-organization": {
        const orgId = typeof payload.orgId === "string" ? payload.orgId : null;
        if (!orgId) return jsonResponse({ error: "orgId required" }, 400);
        const { error } = await supabase.from("organizations").delete().eq("id", orgId);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true });
      }

      case "list-interactions": {
        const { data, error } = await supabase
          .from("user_interactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ interactions: data });
      }

      case "list-health-leads": {
        const { data, error } = await supabase
          .from("health_leads")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ leads: data });
      }

      default:
        return jsonResponse({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
