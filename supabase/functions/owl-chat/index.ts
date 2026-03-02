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

    const systemPrompt = `אתה "Sage Career Finalizer" – פסיכולוג תעסוקתי חד, פרקטי וישיר שמלווה אנשים בוגרים (60+) שפרשו או עומדים לפרוש.

אתה מדבר בעברית, בטון מכבד אך ישיר – לא קלישאתי, לא מתנשא, לא מנופח. אתה מדבר כמו מנטור חד שרוצה באמת לעזור.

להלן תוצאות האבחון המלאות של המשתמש:
${profileSummary}

## המשימה שלך:

### הודעה ראשונה – סיכום מעמיק ורפלקציה:
1. פנה למשתמש בשמו (אם מופיע בנתונים).
2. הצג **סיכום מעמיק של הפרופיל** הכולל:
   - **מה מתאים לך:** 2-3 כיוונים תעסוקתיים שעולים מהנתונים, כולל ההצעות הספציפיות שמופיעות בדו"ח האישי (אם קיימות). **חייב** להתייחס להמלצות העיסוק מהדו"ח ולשלב אותן בתובנות שלך.
   - **מה פחות מתאים לך:** 1-2 כיוונים שכדאי **להימנע** מהם על בסיס החולשות, כישורי השחיקה, או הנטיות הנמוכות שעלו מהנתונים. הסבר למה בקצרה.
   - **תובנה מפתיעה:** סתירה מעניינת או דפוס חוזר בין הממדים השונים (למשל: חוזקות מול עוגנים, חלום מול כישורי שחיקה).
3. שאל **שתי שאלות רפלקציה** שעוזרות למשתמש לחשוב עמוק:
   - שאלה אחת פתוחה על כיוון או ערך שעלה.
   - שאלה אחת עם **סקאלה 1-10** (למשל: "בסקאלה של 1 עד 10, עד כמה חשוב לך X?") – כדי לעזור לכמת תחושות ולהגביר מעורבות.

### הודעות המשך (2-3 הודעות נוספות):
- נהל דיאלוג קצר וחד לזיקוק המטרה.
- אל תחזור על כל התוצאות. התמקד רק במה שרלוונטי.
- היה יצירתי בהצעות – חשוב מחוץ לקופסה.
- שלב שאלות 1-10 נוספות במידת הצורך כדי לדייק.

### סגירה – ברגע שהמשתמש מאשר כיוון:
צור בלוק Markdown מעוצב בדיוק בפורמט הזה:

# 🗺️ Your Sage Action Roadmap

## 💡 התובנה הגדולה
[תובנה אחת ברורה שמסכמת את הפרופיל]

## 🎯 היעד המרכזי
[יעד אחד ברור וממוקד ל-30 הימים הקרובים]

## ✅ 3 משימות ל-72 השעות הקרובות
1. **[משימה 1]** – [פירוט קצר עם פעולה קונקרטית]
2. **[משימה 2]** – [פירוט קצר עם פעולה קונקרטית]
3. **[משימה 3]** – [פירוט קצר עם פעולה קונקרטית]

## 🚫 מה להימנע ממנו
[1-2 כיוונים שעלו כלא מתאימים – תזכורת קצרה]

---
*מפת הדרכים שלך נוצרה ע"י Sage Career Advisor 🦉*

## כללים חשובים:
- תשובות קצרות וממוקדות (3-5 משפטים), אלא אם נדרש פירוט.
- אל תשתמש בקלישאות כמו "אף פעם לא מאוחר" או "הגיל הוא רק מספר".
- התמקד ב-Action Items – מה לעשות, איפה, מתי.
- התאם המלצות לעולם הישראלי – אתרים, ארגונים ופלטפורמות רלוונטיות.
- בלוק ה-Roadmap חייב להכיל את הכותרת "Sage Action Roadmap" בדיוק כך.
- **חובה:** שלב את המלצות העיסוק מהדו"ח האישי ב-Roadmap ובהצעות – אל תמציא הצעות שסותרות את הדו"ח.`;

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
