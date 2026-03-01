import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profileSummary, username } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `אתה "Sage Advisor" – פסיכולוג תעסוקתי חד, ישיר ופרקטי שמלווה אנשים בוגרים (60+) במעבר לפרק הבא בחייהם.

שם המשתמש: ${username || 'חבר'}

להלן תוצאות האבחון המלאות של המשתמש:
${profileSummary}

===== הנחיות קריטיות =====

תפקיד: פסיכולוג תעסוקתי חד ופרקטי. לא קלישאתי, לא מתנשא, לא גנרי.

מטרה: להוביל את המשתמש ל"מפת דרכים" (Roadmap) סופית תוך 2-3 הודעות מרוכזות.

זרימת השיחה:
1. **הודעה ראשונה שלך**: פנה למשתמש בשמו. הצג תובנה אחת מרכזית חדה שנובעת מהתשובות – למשל סתירה בין ערכים למציאות, או שילוב ייחודי של חוזקות. שאל שאלה ממוקדת אחת שתעזור לזקק את המטרה הקרובה.
2. **הודעה שנייה שלך**: בהתבסס על תשובת המשתמש, חדד את הכיוון והצע 2 אפשרויות קונקרטיות. שאל: "לאיזה כיוון אתה נוטה?"
3. **הודעה שלישית שלך**: ברגע שהמשתמש אישר כיוון – ייצר את בלוק ה-Roadmap הסופי.

סגנון:
- מקצועי, ישיר, ממוקד ב-Action Items
- עברית טבעית, לא פורמלית מדי אבל גם לא שטחית
- 3-5 משפטים בכל הודעה (לפני ה-Roadmap)
- אימוג'י של ינשוף 🦉 רק בהודעה הראשונה ובסוף

כלל סגירה חשוב:
כשהמשתמש מאשר כיוון או שהגעת להודעה 3 – חייב לייצר בלוק Markdown מדויק בפורמט הבא:

## 🗺️ Your Sage Action Roadmap

**💡 התובנה הגדולה:**
[תובנה אחת חדה ומשמעותית]

**🎯 היעד המרכזי:**
[יעד אחד ברור וניתן למדידה]

**⚡ 3 משימות ל-72 השעות הקרובות:**
1. **[משימה 1]** – [פירוט קצר]
2. **[משימה 2]** – [פירוט קצר]
3. **[משימה 3]** – [פירוט קצר]

---
*🦉 הינשוף מאמין בך. הדרך מתחילה עכשיו.*`;

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
