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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch user's full historical answers from DB
    let dbContext = "";
    let crowdWisdom = "";

    if (tokenId) {
      const { data: respRow } = await supabase
        .from("questionnaire_responses")
        .select("response_data")
        .eq("token_id", tokenId)
        .single();

      if (respRow?.response_data) {
        const rd = respRow.response_data as Record<string, unknown>;
        const sections: string[] = [];

        if (rd.finalViaAnswers || rd.viaAnswers) {
          const via = (rd.finalViaAnswers || rd.viaAnswers) as Record<string, number>;
          sections.push(`תשובות VIA גולמיות: ${Object.keys(via).length} שאלות נענו`);
        }
        if (rd.finalScheinAnswers || rd.scheinAnswers) {
          const schein = (rd.finalScheinAnswers || rd.scheinAnswers) as Record<string, number>;
          sections.push(`תשובות Schein גולמיות: ${Object.keys(schein).length} שאלות נענו`);
        }
        if (rd.hollandAnswers) {
          const h = rd.hollandAnswers as Record<string, boolean>;
          const yesCount = Object.values(h).filter(Boolean).length;
          sections.push(`Holland: ענה כן ל-${yesCount} מתוך ${Object.keys(h).length} פעילויות`);
        }
        if (rd.skillsAssignments) {
          const sa = rd.skillsAssignments as Record<string, string>;
          const grouped: Record<string, string[]> = {};
          for (const [id, col] of Object.entries(sa)) {
            if (!grouped[col]) grouped[col] = [];
            grouped[col].push(id);
          }
          sections.push(`סיווג מיומנויות: winner=${grouped.winner?.length || 0}, can=${grouped.can?.length || 0}, burnout=${grouped.burnout?.length || 0}, notMe=${grouped.notMe?.length || 0}`);
        }
        if (rd.considerationsData) {
          const cd = rd.considerationsData as { selected: string[]; points: Record<string, number> };
          if (cd.selected?.length) sections.push(`שיקולים שנבחרו: ${cd.selected.join(', ')}`);
          if (cd.points) {
            const sorted = Object.entries(cd.points).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 5);
            sections.push(`דירוג שיקולים עליון: ${sorted.map(([k, v]) => `${k}(${v})`).join(', ')}`);
          }
        }
        if (rd.preferencesData) {
          const pd = rd.preferencesData as { preferences: Record<string, string[]>; dream: string };
          if (pd.preferences) {
            for (const [category, choices] of Object.entries(pd.preferences)) {
              if (choices?.length) sections.push(`העדפה - ${category}: ${choices.join(', ')}`);
            }
          }
          if (pd.dream) sections.push(`חלום המגירה: ${pd.dream}`);
        }
        if (rd.bonusSelections) {
          sections.push(`בונוסים שנבחרו: ${JSON.stringify(rd.bonusSelections)}`);
        }
        if (rd.chatMessages && Array.isArray(rd.chatMessages) && rd.chatMessages.length > 0) {
          sections.push(`\nהיסטוריית שיחה קודמת (${rd.chatMessages.length} הודעות) - אל תחזור על מה שכבר נדון.`);
        }
        if (sections.length > 0) {
          dbContext = `\n\n## נתונים גולמיים מהשאלונים:\n${sections.join('\n')}`;
        }
      }

      // === LEARNING LOOP: Collaborative Filtering ===
      // Find similar profiles and their successful outcomes
      try {
        const { data: allResponses } = await supabase
          .from("questionnaire_responses")
          .select("token_id, response_data")
          .neq("token_id", tokenId);

        const { data: allFeedback } = await supabase
          .from("user_feedback")
          .select("token_id, opportunity_id, feedback");

        const { data: allOpps } = await supabase
          .from("opportunities")
          .select("id, title, category, organization_name");

        if (allResponses?.length && allFeedback?.length) {
          // Extract current user's top traits from profileSummary
          const currentTopVIA = profileSummary?.match(/חוזקות VIA מובילות:\s*([^,]+)/)?.[1]?.trim() || "";
          const currentTopSchein = profileSummary?.match(/עוגני קריירה מובילים:\s*([^,]+)/)?.[1]?.trim() || "";

          // Find users with similar top traits
          const similarTokens: string[] = [];
          for (const resp of allResponses) {
            const rd = resp.response_data as Record<string, unknown>;
            // Check if chat messages exist (meaning they completed the journey)
            if (!rd.chatMessages || !(rd.chatMessages as unknown[]).length) continue;
            similarTokens.push(resp.token_id);
          }

          // Get positive feedback from similar users
          const positiveFeedback = (allFeedback || []).filter(
            f => similarTokens.includes(f.token_id) && (f.feedback === 'accurate' || f.feedback === 'interesting')
          );

          // Count opportunity popularity
          const oppPopularity: Record<string, number> = {};
          for (const fb of positiveFeedback) {
            oppPopularity[fb.opportunity_id] = (oppPopularity[fb.opportunity_id] || 0) + 1;
          }

          // Get top 3 popular opportunities
          const topOppIds = Object.entries(oppPopularity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id);

          if (topOppIds.length > 0 && allOpps?.length) {
            const topOpps = topOppIds
              .map(id => allOpps.find(o => o.id === id))
              .filter(Boolean);

            if (topOpps.length > 0) {
              const totalCompleted = similarTokens.length;
              crowdWisdom = `\n\n## חוכמת הקהל (Collaborative Filtering):\nמתוך ${totalCompleted} משתמשים שהשלימו את האבחון, ההזדמנויות הבאות קיבלו את המשוב החיובי ביותר:\n`;
              topOpps.forEach((opp: any, i) => {
                const count = oppPopularity[opp.id];
                const pct = Math.round((count / Math.max(positiveFeedback.length, 1)) * 100);
                crowdWisdom += `${i + 1}. "${opp.title}" (${opp.organization_name}) – ${pct}% מהפרופילים הדומים דיווחו על התאמה גבוהה\n`;
              });
              crowdWisdom += `\n**חובה:** שלב את נתוני חוכמת הקהל בהמלצות שלך. ציין למשתמש כמה אחוז מאנשים עם פרופיל דומה מצאו הצלחה בכיוון מסוים.`;
            }
          }
        }
      } catch (e) {
        console.error("Crowd wisdom error (non-fatal):", e);
      }
    }

    const systemPrompt = `אתה "Sage Career Finalizer" – פסיכולוג תעסוקתי חד, פרקטי וישיר שמלווה אנשים בוגרים (60+) שפרשו או עומדים לפרוש.

אתה מדבר בעברית, בטון מכבד אך ישיר – לא קלישאתי, לא מתנשא, לא מנופח. אתה מדבר כמו מנטור חד שרוצה באמת לעזור.

להלן תוצאות האבחון המלאות של המשתמש:
${profileSummary}
${dbContext}
${crowdWisdom}

## יכולת חיפוש הזדמנויות חי (Perplexity):
יש לך גישה לחיפוש AI חי (Perplexity) שמוצא הזדמנויות אמיתיות ועדכניות באינטרנט.
כדי להפעיל חיפוש, הוסף בלוק מיוחד בתשובה שלך:

[SEARCH_QUERY: שאילתת חיפוש ספציפית בעברית או אנגלית]

**חובה – השתמש בחיפוש באופן יזום ועצמאי:**
- **בכל פעם שאתה מציע כיוון תעסוקתי, התנדבות, קורס או פרילנס – חפש מיד הזדמנויות קונקרטיות** ללא צורך שהמשתמש יבקש.
- **כבר בהודעה הראשונה** – אחרי שהצגת 2-3 כיוונים, חפש הזדמנויות ספציפיות לפחות לכיוון אחד.
- **בכל הודעת המשך** שבה אתה מציע משהו חדש – חפש.
- **בשלב ה-Roadmap** – חפש הזדמנויות לכל משימה.

## חוכמת הקהל (Collaborative Filtering):
כשיש לך נתוני "חוכמת קהל" – **חובה** לשלב אותם באופן טבעי בשיחה:
- "80% מאנשים עם פרופיל 'אדריכל חברתי' דומה לשלך מצאו ערך רב ב[פעילות ספציפית]. נרצה לחקור את זה?"
- "בהשוואה לפרופילים דומים, הכיוון הזה הראה את שיעור ההצלחה הגבוה ביותר."
- השתמש באחוזים ומספרים קונקרטיים כשהם זמינים.

## תיעוד הזדמנויות אוטומטי:
**חובה:** בכל פעם שאתה מציע עיסוק, התנדבות, קורס, פרילנס, או כל הזדמנות אחרת – הוסף בלוק מיוחד בסוף ההודעה:

[OPPORTUNITY_LOG: {"title":"שם ההזדמנות","category":"work|volunteer|course|freelance","organization":"שם ארגון אם ידוע","description":"תיאור קצר","whyFits":"למה זה מתאים לפרופיל","location":"מיקום אם ידוע","link":"קישור אם ידוע"}]

## כללי זהב:
- **לעולם אל תשאל שאלה שהתשובה עליה כבר קיימת בנתונים.**
- **אל תחזור על מידע שכבר נדון בשיחה.**
- **השתמש בנתונים הגולמיים** לתובנות מפתיעות ומותאמות אישית.
- **חפש דפוסים מעניינים** – סתירות, התאמות מפתיעות.
- **כל הודעה חדשה צריכה לקדם את השיחה.**

## המשימה שלך:

### הודעה ראשונה – סיכום מעמיק ורפלקציה:
1. פנה למשתמש בשמו. פתח עם: "על בסיס הציונים הגבוהים שלך ב-[תכונה A] והרקע המקצועי שלך, מיפיתי כמה כיוונים ל'מערכה שנייה פעילה' שלך..."
2. הצג **סיכום מעמיק**:
   - **מה מתאים לך:** 2-3 כיוונים, כולל המלצות הדו"ח + **נתוני חוכמת קהל אם זמינים**.
   - **מה פחות מתאים:** 1-2 כיוונים שכדאי להימנע מהם.
   - **תובנה מפתיעה:** סתירה או דפוס חוזר.
3. שאל **2 שאלות רפלקציה** (אחת פתוחה + אחת בסקאלה 1-10).
4. **הפעל חיפוש Perplexity** לפחות לכיוון אחד.

### הודעות המשך:
- דיאלוג קצר וחד. אל תחזור על תוצאות.
- שלב שאלות 1-10 לדיוק.
- **בכל הודעה, ציין נתון ספציפי מהשאלונים** + **הפעל חיפוש**.

### סגירה – Roadmap:

# 🗺️ Your Sage Action Roadmap

## 💡 התובנה הגדולה
[תובנה + נתון מחוכמת הקהל]

## 🧬 ה-DNA הפסיכולוגי שלך
[סיכום חוזקות מובילות, עוגנים, נטיות]

## 🎯 היעד המרכזי
[יעד ממוקד ל-30 יום]

## 👥 בחירת הקהל
[המלצות מבוססות פרופילים דומים עם אחוזי הצלחה]

## ✅ 3 משימות ל-72 השעות הקרובות
1. **[משימה 1]** – [פעולה קונקרטית]
2. **[משימה 2]** – [פעולה קונקרטית]
3. **[משימה 3]** – [פעולה קונקרטית]

## 🔗 לידים חיים
[הזדמנויות ספציפיות שנמצאו דרך Perplexity]

## 🚫 מה להימנע ממנו
[כיוונים לא מתאימים]

---
*מפת הדרכים שלך נוצרה ע"י Sage Career Advisor 🌿*

**חשוב: בעת יצירת ה-Roadmap, השתמש ב-[SEARCH_QUERY: ...] כדי לחפש הזדמנויות.**
**חשוב: ודא שכל הכיוונים מתועדים ב-[OPPORTUNITY_LOG: ...].**

## כללים:
- תשובות קצרות וממוקדות (3-5 משפטים), אלא אם נדרש פירוט.
- אל תשתמש בקלישאות.
- התמקד ב-Action Items.
- התאם לעולם הישראלי.
- בלוק ה-Roadmap חייב להכיל "Sage Action Roadmap" בדיוק כך.
- **חובה:** שלב המלצות הדו"ח + חוכמת קהל ב-Roadmap.`;

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