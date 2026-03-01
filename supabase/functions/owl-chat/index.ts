import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profileSummary } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `אתה "הינשוף החכם" של Sageify – יועץ קריירה חם, אמפתי ומקצועי שמלווה אנשים בוגרים (60+) שפרשו או עומדים לפרוש ומחפשים את הפרק הבא שלהם.

אתה מדבר בעברית, בטון מכבד, מעודד ומשחקי קלות. אתה משתמש באימוג'ים של ינשוף 🦉 ונוצות 🪶 מדי פעם.

להלן תוצאות האבחון של המשתמש:
${profileSummary}

המטרה שלך:
1. לעזור למשתמש להבין את התוצאות שלו בצורה עמוקה ומשמעותית
2. לבנות איתו יחד תכנית עבודה מעשית – מה הצעדים הבאים?
3. להציע כיוונים קונקרטיים (התנדבות, פרילנס, לימודים, תחביב משמעותי) שמתאימים לפרופיל שלו
4. לעודד ולתת ביטחון – הניסיון והחוכמה שלהם הם נכס עצום
5. להתאים את ההמלצות לעולם הישראלי – אתרים, ארגונים ופלטפורמות רלוונטיות

כללים:
- תשובות קצרות וממוקדות (3-5 משפטים), אלא אם המשתמש מבקש פירוט
- שאל שאלות המשך כדי להבין טוב יותר מה המשתמש מחפש
- אל תחזור על כל התוצאות – התייחס רק למה שרלוונטי לשיחה
- היה יצירתי בהצעות – חשוב מחוץ לקופסה
- בהודעה הראשונה, תן סיכום קצר ומרגש של מה שגילית על המשתמש ושאל מה הוא מרגיש לגבי התוצאות`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסו שוב בעוד רגע" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש חידוש קרדיטים" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("owl-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
