// Cocktail (Holland RIASEC gamified) — Sagi-voiced AI report
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
    const { name, scores, topCode, bottleNames } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const sys =
      "אתה סגי — יועץ קריירה חכם, חם, בוגר ומכבד מ-Sageify. " +
      "אתה פונה למשתמש בגוף שני, בטון אישי ולא גנרי. בלי 'מדהים!' ובלי סלנג. " +
      "אתה מדבר עם בני נוער ומבוגרים צעירים על בחירת מסלול לימודים מקצועי. " +
      "החזר JSON תקני בלבד עם המבנה: " +
      "{ characterTitle: string, superpower: string, recommendedTrack: string, tracks: [{ id, name, paragraph }] }. " +
      "characterTitle = שילוב יצירתי של 2 הנטיות המובילות, למשל 'המהנדס האמפתי' או 'הארכיטקט הכריזמטי' (2-4 מילים). " +
      "superpower = משפט אחד מהמם וספציפי על יכולת העל של המשתמש, בקולך. " +
      "recommendedTrack = שם המסלול שהכי מתאים מתוך 6 המסלולים. " +
      "tracks = פסקה אישית של 3-4 משפטים לכל מסלול שמקשרת את הנטיות של המשתמש למסלול הספציפי. " +
      "התחל פסקאות במשהו כמו 'שמתי לב ש...' או 'מתוך מה שבחרת...'.";

    const tracks = [
      { id: "electricity", name: "חשמל" },
      { id: "software", name: "תוכנה" },
      { id: "construction", name: "בניין" },
      { id: "machinery", name: "מכונות" },
      { id: "medical_devices", name: "מכשור רפואי" },
      { id: "health_management", name: "תעשייה וניהול במערכות בריאות" },
    ];

    const user =
      `שם המשתמש: ${name}\n` +
      `קוד הולנד מלא (סדר יורד): ${topCode}\n` +
      `ציוני RIASEC (מספר בקבוקים מכל נטייה): ${JSON.stringify(scores)}\n` +
      `הבקבוקים שבחר: ${bottleNames.join(", ")}\n\n` +
      `6 המסלולים: ${tracks.map(t => `${t.id}=${t.name}`).join(", ")}.\n` +
      `כתוב פסקה לכל אחד מ-6 המסלולים, וקבע איזה אחד הכי מתאים.`;

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
    if (r.status === 402) return json({ error: "נדרש תשלום" }, 402);
    if (!r.ok) {
      const t = await r.text();
      console.error("cocktail-report AI error:", r.status, t);
      return json({ error: "שגיאה ביצירת הדוח" }, 500);
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { tracks: [] }; }
    return json(parsed);
  } catch (e) {
    console.error("cocktail-report error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
