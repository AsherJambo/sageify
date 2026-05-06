// Haredi vocational matching — AI explanation for top tracks
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topTracks, profile } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const sys =
      "אתה יועץ קריירה מקצועי, חם ומכבד, המתמחה בליווי בחורים מהציבור החרדי בכניסתם הראשונה לשוק העבודה. " +
      "השתמש בלשון מכובדת ('אתה'), הימנע מסלנג, והדגש את היתרונות של ההכשרה המקצועית והפרנסה בכבוד. " +
      "החזר JSON תקני בלבד עם המבנה: { tracks: [{ name, why, dayInLife, firstStep }] }. " +
      "'why' = פסקה קצרה (3-4 משפטים) שמסבירה למה המסלול הזה מתאים לפי הפרופיל. " +
      "'dayInLife' = תיאור קצר (2-3 משפטים) של איך נראה יום עבודה במקצוע. " +
      "'firstStep' = הצעד הקונקרטי הראשון להתחיל (קורס/מכללה/הכשרה ספציפית בישראל).";

    const user =
      `הפרופיל של המועמד:\n${JSON.stringify(profile, null, 2)}\n\n` +
      `שלושת המסלולים שהאלגוריתם בחר עבורו (לפי סדר התאמה): ${topTracks.join(", ")}.\n` +
      `כתוב הסבר אישי לכל אחד מהשלושה.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (r.status === 429) return json({ error: "יותר מדי בקשות, נסה שוב בעוד רגע" }, 429);
    if (r.status === 402) return json({ error: "נדרש תשלום, פנה למנהל המערכת" }, 402);
    if (!r.ok) {
      const t = await r.text();
      console.error("haredi-match AI error:", r.status, t);
      return json({ error: "שגיאה ביצירת ההסבר" }, 500);
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { tracks: [] }; }
    return json(parsed);
  } catch (e) {
    console.error("haredi-match error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
