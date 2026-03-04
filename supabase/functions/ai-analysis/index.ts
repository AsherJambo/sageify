import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminPassword = Deno.env.get("ADMIN_PASSWORD");
  const providedPassword = req.headers.get("x-admin-password")?.trim();

  if (!adminPassword || !providedPassword || providedPassword !== adminPassword.trim()) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all completed tokens with responses
    const { data: tokens, error } = await supabase
      .from("questionnaire_tokens")
      .select("*, questionnaire_responses(response_data)")
      .not("completed_at", "is", null);

    if (error) throw error;

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ error: "אין נתונים מספיקים לניתוח. נדרשים שאלונים שהושלמו." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a summary of all responses for the AI
    const summaries = tokens.map((t: any) => {
      const resp = Array.isArray(t.questionnaire_responses)
        ? t.questionnaire_responses[0]?.response_data
        : t.questionnaire_responses?.response_data;
      if (!resp) return null;

      return {
        username: t.username,
        viaScores: resp.viaScores,
        scheinScores: resp.scheinScores,
        hollandScores: resp.hollandScores,
        skillsAssignment: resp.skillsAssignment,
        considerations: resp.considerations,
        preferences: resp.preferences,
        bonusSelections: resp.bonusSelections,
        chatMessages: resp.chatMessages ? `${(resp.chatMessages as any[]).length} messages` : "none",
      };
    }).filter(Boolean);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `אתה אנליסט דאטה אסטרטגי מומחה בתחום פיתוח קריירה וניהול כוח אדם.
קיבלת נתוני אבחון קריירה של ${summaries.length} משתתפים. כל משתתף עבר שאלוני VIA (ערכים), Schein (עוגנים תעסוקתיים), Holland (סביבות עבודה), מיומנויות, שיקולים והעדפות.

נתח את הדאטה וצור דוח אסטרטגי מקיף בעברית הכולל:

## 📊 סיכום כללי
- מספר משתתפים, מגמות כלליות

## 🏆 חוזקות דומיננטיות
- ערכי VIA הנפוצים ביותר בקרב כל המשתתפים
- עוגני Schein דומיננטיים
- טיפוסי Holland שכיחים

## 🔍 תובנות מפתח
- דפוסים מעניינים שחוזרים על עצמם
- פערים או ניגודים בולטים
- קורלציות בין ציונים שונים

## 💡 המלצות אסטרטגיות
- כיצד לנצל את החוזקות הקבוצתיות
- תחומי עיסוק מומלצים לקבוצה
- הצעות לפיתוח מקצועי

## ⚠️ נקודות לתשומת לב
- תחומים שדורשים חיזוק
- סיכונים פוטנציאליים

השתמש באימוג'ים, כותרות ברורות וניסוח מקצועי אך נגיש. הדוח צריך לספק ערך אמיתי למנהל/יועץ.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `הנה נתוני ${summaries.length} משתתפים:\n\n${JSON.stringify(summaries, null, 2)}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "חריגה ממגבלת בקשות, נסו שוב בעוד דקה." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש טעינת קרדיטים." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-analysis error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
