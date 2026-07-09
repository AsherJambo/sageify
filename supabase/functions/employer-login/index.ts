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

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
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

  const password = typeof payload.password === "string" ? payload.password.trim() : "";
  if (!password) {
    return jsonResponse({ error: "Password is required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("organizations")
    .select("id, org_name, logo_url, custom_welcome_message, admin_email")
    .eq("admin_password", password)
    .limit(1);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  if (!data || data.length === 0) {
    return jsonResponse({ error: "Invalid password or organization not found" }, 401);
  }

  return jsonResponse({ organization: data[0] });
});
