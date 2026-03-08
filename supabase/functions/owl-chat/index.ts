import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profileSummary, tokenId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch user's full historical answers from DB if tokenId provided
    let dbContext = "";
    if (tokenId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: respRow } = await supabase
        .from("questionnaire_responses")
        .select("response_data")
        .eq("token_id", tokenId)
        .single();

      if (respRow?.response_data) {
        const rd = respRow.response_data as Record<string, unknown>;

        const sections: string[] = [];

        // VIA raw answers
        if (rd.finalViaAnswers || rd.viaAnswers) {
          const via = (rd.finalViaAnswers || rd.viaAnswers) as Record<string, number>;
          const answered = Object.keys(via).length;
          sections.push(`תשובות VIA גולמיות: ${answered} שאלות נענו`);
        }

        // Schein raw answers
        if (rd.finalScheinAnswers || rd.scheinAnswers) {
          const schein = (rd.finalScheinAnswers || rd.scheinAnswers) as Record<string, number>;
          const answered = Object.keys(schein).length;
          sections.push(`תשובות Schein גולמיות: ${answered} שאלות נענו`);
        }

        // Holland raw answers
        if (rd.hollandAnswers) {
          const h = rd.hollandAnswers as Record<string, boolean>;
          const yesCount = Object.values(h).filter(Boolean).length;
          const totalCount = Object.keys(h).length;
          sections.push(`Holland: ענה כן ל-${yesCount} מתוך ${totalCount} פעילויות`);
        }

        // Skills assignment details
        if (rd.skillsAssignments) {
          const sa = rd.skillsAssignments as Record<string, string>;
          const grouped: Record<string, string[]> = {};
          for (const [id, col] of Object.entries(sa)) {
            if (!grouped[col]) grouped[col] = [];
            grouped[col].push(id);
          }
          sections.push(`סיווג מיומנויות: winner=${grouped.winner?.length || 0}, can=${grouped.can?.length || 0}, burnout=${grouped.burnout?.length || 0}, notMe=${grouped.notMe?.length || 0}`);
        }

        // Considerations
        if (rd.considerationsData) {
          const cd = rd.considerationsData as { selected: string[]; points: Record<string, number> };
          if (cd.selected?.length) sections.push(`שיקולים שנבחרו: ${cd.selected.join(', ')}`);
          if (cd.points) {
            const sorted = Object.entries(cd.points).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 5);
            sections.push(`דירוג שיקולים עליון: ${sorted.map(([k, v]) => `${k}(${v})`).join(', ')}`);
          }
        }

        // Preferences
        if (rd.preferencesData) {
          const pd = rd.preferencesData as { preferences: Record<string, string[]>; dream: string };
          if (pd.preferences) {
            const prefEntries = Object.entries(pd.preferences);
            for (const [category, choices] of prefEntries) {
              if (choices?.length) sections.push(`העדפה - ${category}: ${choices.join(', ')}`);
            }
          }
          if (pd.dream) sections.push(`חלום המגירה: ${pd.dream}`);
        }

        // Bonus selections
        if (rd.bonusSelections) {
          const bs = rd.bonusSelections as Record<string, unknown>;
          sections.push(`בונוסים שנבחרו: ${JSON.stringify(bs)}`);
        }

        // Previous chat messages (so AI knows what was already discussed)
        if (rd.chatMessages && Array.isArray(rd.chatMessages) && rd.chatMessages.length > 0) {
          sections.push(`\nהיסטוריית שיחה קודמת (${rd.chatMessages.length} הודעות) - המשתמש כבר שוחח עם היועץ. אל תחזור על שאלות או תובנות שכבר נדונו.`);
        }

        if (sections.length > 0) {
          dbContext = `\n\n## נתונים גולמיים מהשאלונים (מהמסד נתונים):\n${sections.join('\n')}`;
        }
      }
    }

    const systemPrompt = `אתה "Sage Career Finalizer" – פסיכולוג תעסוקתי חד, פרקטי וישיר שמלווה אנשים בוגרים (60+) שפרשו או עומדים לפרוש.

אתה מדבר בעברית, בטון מכבד אך ישיר – לא קלישאתי, לא מתנשא, לא מנופח. אתה מדבר כמו מנטור חד שרוצה באמת לעזור.

להלן תוצאות האבחון המלאות של המשתמש:
${profileSummary}
${dbContext}

## יכולת חיפוש הזדמנויות חי (Perplexity):
יש לך גישה לחיפוש AI חי (Perplexity) שמוצא הזדמנויות אמיתיות ועדכניות באינטרנט.
כדי להפעיל חיפוש, הוסף בלוק מיוחד בתשובה שלך:

[SEARCH_QUERY: שאילתת חיפוש ספציפית בעברית או אנגלית]

**חובה – השתמש בחיפוש באופן יזום ועצמאי:**
- **בכל פעם שאתה מציע כיוון תעסוקתי, התנדבות, קורס או פרילנס – חפש מיד הזדמנויות קונקרטיות** ללא צורך שהמשתמש יבקש.
- **כבר בהודעה הראשונה** – אחרי שהצגת 2-3 כיוונים, חפש הזדמנויות ספציפיות לפחות לכיוון אחד.
- **בכל הודעת המשך** שבה אתה מציע משהו חדש – חפש.
- **בשלב ה-Roadmap** – חפש הזדמנויות לכל משימה.

לדוגמה:
"על בסיס החוזקות שלך בהנחיה ויצירתיות, בוא נראה מה יש בשטח...
[SEARCH_QUERY: הנחיית סדנאות יצירתיות למבוגרים ישראל 2025]
[SEARCH_QUERY: התנדבות חינוך מבוגרים תל אביב]"

**חשוב:** תמיד כתוב טקסט רגיל מסביב לבלוק החיפוש – אל תשים אותו לבד.

## תיעוד הזדמנויות אוטומטי:
**חובה:** בכל פעם שאתה מציע עיסוק, התנדבות, קורס, פרילנס, או כל הזדמנות אחרת – הוסף בלוק מיוחד בסוף ההודעה בפורמט הבא:

[OPPORTUNITY_LOG: {"title":"שם ההזדמנות","category":"work|volunteer|course|freelance","organization":"שם ארגון אם ידוע","description":"תיאור קצר","whyFits":"למה זה מתאים לפרופיל","location":"מיקום אם ידוע","link":"קישור אם ידוע"}]

**דוגמה:** אם הצעת "הנחיית סדנאות חשיבה יצירתית", תוסיף:
[OPPORTUNITY_LOG: {"title":"הנחיית סדנאות חשיבה יצירתית","category":"freelance","organization":"","description":"הנחיית סדנאות לארגונים ולמבוגרים בנושאי חשיבה יצירתית ופתרון בעיות","whyFits":"מתאים לחוזקות יצירתיות ולעוגן עצמאות","location":"ישראל","link":""}]

**חשוב:** 
- הוסף בלוק OPPORTUNITY_LOG נפרד לכל הצעה/כיוון שאתה מזכיר.
- הבלוקים האלה לא יוצגו למשתמש – הם רק לצורך תיעוד.
- גם אם ההצעה כללית (כמו "ייעוץ פיננסי") – תעד אותה.

## כללי זהב להתנהלות:
- **לעולם אל תשאל שאלה שהתשובה עליה כבר קיימת בנתונים.** אם למשל חלום המגירה כבר מופיע, אל תשאל "מה החלום שלך?" – התייחס אליו ישירות.
- **אל תחזור על מידע שכבר נדון בשיחה.** תמיד בדוק את ההיסטוריה לפני שאתה מגיב.
- **השתמש בנתונים הגולמיים** (ציוני שאלונים, העדפות, שיקולים) כדי לספק תובנות עמוקות ומותאמות אישית שמפתיעות את המשתמש.
- **חפש דפוסים מעניינים** – סתירות בין מה שהמשתמש אומר לבין מה שהציונים מראים, או התאמות מפתיעות בין ממדים שונים.
- **כל הודעה חדשה צריכה לקדם את השיחה** – לא לחזור אחורה.

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
- **בכל הודעה, הזכר לפחות נתון אחד ספציפי מהשאלונים** שתומך בטיעון שלך.

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
*מפת הדרכים שלך נוצרה ע"י Sage Career Advisor 🌿*

**חשוב: בעת יצירת ה-Roadmap, השתמש ב-[SEARCH_QUERY: ...] כדי לחפש הזדמנויות קונקרטיות שתתאים לכיוון שנבחר.**
**חשוב: ודא שכל הכיוונים שב-Roadmap מתועדים גם ב-[OPPORTUNITY_LOG: ...].**

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
