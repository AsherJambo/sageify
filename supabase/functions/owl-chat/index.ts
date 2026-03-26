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
    let activityWisdom = "";

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
        if (rd.motivationData) {
          const md = rd.motivationData as { motivationScores: Record<string, number>; intentionAnswers: Record<string, number> };
          if (md.motivationScores) {
            const clusterScores = Object.entries(md.motivationScores).map(([k, v]) => `${k}=${v}`).join(', ');
            sections.push(`מניעים תעסוקתיים: ${clusterScores}`);
          }
          if (md.intentionAnswers) {
            const answers = Object.entries(md.intentionAnswers).map(([k, v]) => `Q${k}=${v}`).join(', ');
            sections.push(`כוונות תעסוקתיות (תשובות גולמיות): ${answers}`);
          }
        }
        if (rd.chatMessages && Array.isArray(rd.chatMessages) && rd.chatMessages.length > 0) {
          sections.push(`\nהיסטוריית שיחה קודמת (${rd.chatMessages.length} הודעות) - אל תחזור על מה שכבר נדון.`);
        }
        if (sections.length > 0) {
          dbContext = `\n\n## נתונים גולמיים מהשאלונים:\n${sections.join('\n')}`;
        }
      }

      // === ACTIVITY CHOICES WISDOM ===
      try {
        const { data: allChoices } = await supabase
          .from("activity_choices")
          .select("activity_type, activity_name, organization, category, reasons, psychological_drivers, source")
          .order("created_at", { ascending: false })
          .limit(500);

        if (allChoices && allChoices.length > 0) {
          const typeCounts: Record<string, number> = {};
          const reasonCounts: Record<string, number> = {};
          const topActivities: Record<string, number> = {};
          const reasonsByActivity: Record<string, Record<string, number>> = {};

          for (const c of allChoices) {
            typeCounts[c.activity_type] = (typeCounts[c.activity_type] || 0) + 1;
            topActivities[c.activity_name] = (topActivities[c.activity_name] || 0) + 1;
            const reasons = (c.reasons || []) as string[];
            if (!reasonsByActivity[c.activity_name]) reasonsByActivity[c.activity_name] = {};
            for (const r of reasons) {
              reasonCounts[r] = (reasonCounts[r] || 0) + 1;
              reasonsByActivity[c.activity_name][r] = (reasonsByActivity[c.activity_name][r] || 0) + 1;
            }
          }

          const topTypes = Object.entries(typeCounts).sort(([,a],[,b]) => b - a);
          const topReasons = Object.entries(reasonCounts).sort(([,a],[,b]) => b - a).slice(0, 10);
          const topActs = Object.entries(topActivities).sort(([,a],[,b]) => b - a).slice(0, 8);

          // Build enriched activity wisdom with reasons PER activity
          const actsWithReasons = topActs.map(([name, count]) => {
            const reasons = reasonsByActivity[name] || {};
            const topR = Object.entries(reasons).sort(([,a],[,b]) => b - a).slice(0, 3);
            const reasonStr = topR.length > 0 ? ` (סיבות: ${topR.map(([r,c]) => `"${r}" ×${c}`).join(', ')})` : '';
            return `- "${name}" (${count} בחירות)${reasonStr}`;
          });

          activityWisdom = `\n\n## 📊 מאגר בחירות תעסוקה נצבר (${allChoices.length} בחירות מתועדות):
**סוגי פעילות:**
${topTypes.map(([t,c]) => `- ${t === 'volunteer' ? 'התנדבות' : t === 'work' ? 'עבודה' : t === 'course' ? 'קורסים' : t === 'freelance' ? 'פרילנס' : t}: ${c} בחירות`).join('\n')}

**פעילויות פופולריות + למה נבחרו:**
${actsWithReasons.join('\n')}

**הסיבות המובילות לבחירת תעסוקה (כל הפעילויות):**
${topReasons.map(([r,c]) => `- "${r}" (${c} ציונים)`).join('\n')}

**חובה קריטית:**
1. השתמש בסיבות הבחירה כדי לדייק המלצות: אם המשתמש מחפש "משמעות", הצע פעילויות שנבחרו בגלל "נותן תחושת משמעות" או "מחבר לאנשים".
2. ציין למשתמש: "מתוך ${allChoices.length} בחירות תעסוקה, ${topActs[0]?.[1] || 0} אנשים בחרו ב-'${topActs[0]?.[0] || ''}' – הסיבה המרכזית: '${topReasons[0]?.[0] || ''}'."
3. אם יש חפיפה בין הפרופיל הפסיכולוגי של המשתמש לסיבות הבחירה של אחרים – הדגש את זה!`;
        }
      } catch (e) {
        console.error("Activity wisdom error (non-fatal):", e);
      }

      // === RETIREE ARCHETYPES from global_retiree_insights ===
      let archetypeWisdom = "";
      try {
        const { data: allInsights, count: insightCount } = await supabase
          .from("global_retiree_insights")
          .select("user_persona, motivation_tag, profession_category, dream, activity_suggested, skills_winner, via_top, schein_top", { count: "exact" });

        if (allInsights && allInsights.length > 0) {
          const totalProfiles = insightCount || allInsights.length;
          const personaCounts: Record<string, number> = {};
          const personaActivities: Record<string, string[]> = {};
          const personaDreams: Record<string, string[]> = {};
          const professionPivots: Record<string, Record<string, number>> = {};

          for (const insight of allInsights) {
            const persona = insight.user_persona;
            personaCounts[persona] = (personaCounts[persona] || 0) + 1;
            if (!personaActivities[persona]) personaActivities[persona] = [];
            if (insight.activity_suggested) personaActivities[persona].push(insight.activity_suggested);
            if (!personaDreams[persona]) personaDreams[persona] = [];
            if (insight.dream) personaDreams[persona].push(insight.dream);

            const prof = insight.profession_category || 'כללי';
            const motiv = insight.motivation_tag || 'Other';
            if (!professionPivots[prof]) professionPivots[prof] = {};
            professionPivots[prof][motiv] = (professionPivots[prof][motiv] || 0) + 1;
          }

          const sortedPersonas = Object.entries(personaCounts).sort(([,a],[,b]) => b - a);

          archetypeWisdom = `\n\n## 🧬 ארכיטיפים של פורשים (מבוסס ${totalProfiles}+ פרופילים):
**סה"כ פרופילים מנותחים:** ${totalProfiles}

**פרסונות מזוהות:**
${sortedPersonas.map(([p, c]) => {
  const pct = Math.round((c / totalProfiles) * 100);
  const activities = personaActivities[p]?.filter(a => a !== 'ממתין לנתוני יועץ').slice(0, 2) || [];
  return `- "${p}" (${pct}% מהפורשים)${activities.length > 0 ? ` → פעילויות מובילות: ${activities.join(', ')}` : ''}`;
}).join('\n')}

**מגמות מקצועיות:**
${Object.entries(professionPivots).slice(0, 5).map(([prof, motivs]) => {
  const topMotiv = Object.entries(motivs).sort(([,a],[,b]) => b - a)[0];
  return `- ${prof}: מניע מרכזי = ${topMotiv?.[0] || 'N/A'} (${topMotiv?.[1] || 0} פרופילים)`;
}).join('\n')}

**חובה:** כשאתה מזהה שהמשתמש שייך לארכיטיפ מסוים, ציין: "מתוך ${totalProfiles}+ פורשים עם רקע דומה, הנתיב המוצלח ביותר עבורך הוא..."
השתמש במספרים ואחוזים קונקרטיים. ציין את שם הפרסונה.`;
        }
      } catch (e) {
        console.error("Archetype wisdom error (non-fatal):", e);
      }

      // === INTERACTION DATA (behavioral signals) ===
      let interactionWisdom = "";
      try {
        const { data: interactions } = await supabase
          .from("user_interactions")
          .select("interaction_type, target_type, target_title")
          .order("created_at", { ascending: false })
          .limit(500);

        if (interactions && interactions.length > 0) {
          const starredItems: Record<string, number> = {};
          const dismissedItems: Record<string, number> = {};
          for (const i of interactions) {
            if (i.interaction_type === 'star') {
              starredItems[i.target_title] = (starredItems[i.target_title] || 0) + 1;
            }
            if (i.interaction_type === 'dismiss' || i.interaction_type === 'reject') {
              dismissedItems[i.target_title] = (dismissedItems[i.target_title] || 0) + 1;
            }
          }

          const topStarred = Object.entries(starredItems).sort(([,a],[,b]) => b - a).slice(0, 5);
          const topDismissed = Object.entries(dismissedItems).sort(([,a],[,b]) => b - a).slice(0, 5);

          if (topStarred.length > 0 || topDismissed.length > 0) {
            interactionWisdom = `\n\n## 📈 סיגנלים התנהגותיים (${interactions.length} אינטראקציות):`;
            if (topStarred.length > 0) {
              interactionWisdom += `\n**הכי נשמר/אהוב ע"י כל המשתמשים:**\n${topStarred.map(([t,c]) => `- "${t}" (${c} שמירות)`).join('\n')}`;
            }
            if (topDismissed.length > 0) {
              interactionWisdom += `\n**הכי הרבה דחיות:**\n${topDismissed.map(([t,c]) => `- "${t}" (${c} דחיות)`).join('\n')}`;
            }
            interactionWisdom += `\n**חובה:** הימנע מלהמליץ על פריטים שנדחו הרבה. העדף פריטים עם שמירות גבוהות.`;
          }
        }
      } catch (e) {
        console.error("Interaction wisdom error (non-fatal):", e);
      }

      // === LEARNING LOOP: Collaborative Filtering ===
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
          const currentTopVIA = profileSummary?.match(/חוזקות VIA מובילות:\s*([^,]+)/)?.[1]?.trim() || "";
          const currentTopSchein = profileSummary?.match(/עוגני קריירה מובילים:\s*([^,]+)/)?.[1]?.trim() || "";

          const similarTokens: string[] = [];
          for (const resp of allResponses) {
            const rd = resp.response_data as Record<string, unknown>;
            if (!rd.chatMessages || !(rd.chatMessages as unknown[]).length) continue;
            similarTokens.push(resp.token_id);
          }

          const positiveFeedback = (allFeedback || []).filter(
            f => similarTokens.includes(f.token_id) && (f.feedback === 'accurate' || f.feedback === 'interesting')
          );

          const oppPopularity: Record<string, number> = {};
          for (const fb of positiveFeedback) {
            oppPopularity[fb.opportunity_id] = (oppPopularity[fb.opportunity_id] || 0) + 1;
          }

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
${activityWisdom}
${archetypeWisdom}
${interactionWisdom}

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

## 📌 תיעוד בחירות פעילות (DATA COLLECTION):
**חובה קריטית** — בכל פעם שהמשתמש מביע עניין, בוחר, או מאשר שהוא רוצה לפעול בכיוון מסוים, תעד את הבחירה עם הסיבות:

[ACTIVITY_CHOICE: {"activity":"שם הפעילות/עיסוק","type":"work|volunteer|course|freelance|other","organization":"ארגון אם ידוע","reasons":["סיבה 1 למה בחר","סיבה 2","סיבה 3"]}]

**מתי לתעד:**
- כשהמשתמש אומר "זה מדבר אליי", "אני רוצה לנסות", "זה מעניין אותי", "כן, בוא נחקור את זה"
- כשהמשתמש מדרג כיוון גבוה (7+/10)
- כשהמשתמש בוחר משימה מתוך ה-Roadmap
- כשהמשתמש מספר על פעילות שכבר עושה או עשה

**הסיבות חייבות להיות מנוסחות כך:**
- סיבות פסיכולוגיות מבוססות האבחון (למשל: "מתאים לעוגן שליחות/ייעוד", "ממנף חוזקה באנושיות")
- סיבות פרקטיות (למשל: "גמישות בשעות", "קרוב לבית", "ניתן להתחיל מיד")
- סיבות רגשיות (למשל: "נותן תחושת משמעות", "מחבר לאנשים", "ממלא חלום ישן")

## כללי זהב:
- **לעולם אל תשאל שאלה שהתשובה עליה כבר קיימת בנתונים.**
- **אל תחזור על מידע שכבר נדון בשיחה.**
- **השתמש בנתונים הגולמיים** לתובנות מפתיעות ומותאמות אישית.
- **חפש דפוסים מעניינים** – סתירות, התאמות מפתיעות.
- **כל הודעה חדשה צריכה לקדם את השיחה.**

## המשימה שלך:

### הודעה ראשונה – Micro-Insight (תובנה אחת בלבד!):
**חובה: ההודעה הראשונה חייבת להיות קצרה – 4-6 משפטים בלבד!**
1. פנה למשתמש בשמו.
2. הצג **תובנה אחת בלבד** – הדבר הכי מפתיע או מעניין שעלה מהאבחון. זה יכול להיות:
   - סתירה מעניינת בין שני ציונים
   - חוזקה דומיננטית בולטת
   - דפוס חוזר מפתיע בין השאלונים
   - נתון מחוכמת הקהל שרלוונטי
3. סיים ב**שאלה פתוחה פשוטה** – למשל: "מה מתוך זה הכי מדבר אלייך? ולמה?" או "איך זה מהדהד עם מה שאת/ה מרגיש/ה היום?"
   - **אל תשאל שאלות מספריות (1-10) בהודעה הראשונה.** שאלות סולם מתאימות להודעות המשך כשצריך לדייק כיוון ספציפי.
   - **אל תשאל "איזה מהכיוונים" כי בהודעה הראשונה אין רשימת כיוונים.**
4. **אל תציג סיכום מלא, אל תציג כיוונים, אל תציג רשימות.** התובנות הנוספות יתגלו בהדרגה לאורך השיחה.
5. **הפעל חיפוש Perplexity** רק אם התובנה מובילה לכיוון ספציפי.

### הודעות המשך – Micro-Insights:
- **כל הודעה חושפת תובנה חדשה אחת בלבד** – בנה את התמונה בהדרגה.
- דיאלוג קצר וחד (3-5 משפטים). אל תחזור על תוצאות.
- שאלות סולם 1-10 מתאימות רק כשמציגים כיוון ספציפי אחד ורוצים לדייק – למשל: "עד כמה הכיוון של הנחיית סדנאות מדבר אלייך, מ-1 עד 10?"
- **בכל הודעה, ציין נתון ספציפי אחד מהשאלונים** + **הפעל חיפוש כשרלוונטי**.
- רק אחרי 3-4 הודעות של דיאלוג, התחל להציע כיוונים קונקרטיים.

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


## 🚫 מה להימנע ממנו
[כיוונים לא מתאימים]

---
*מפת הדרכים שלך נוצרה ע"י Sage Career Advisor 🌿*

**חשוב: בעת יצירת ה-Roadmap, השתמש ב-[SEARCH_QUERY: ...] כדי לחפש הזדמנויות.**
**חשוב: ודא שכל הכיוונים מתועדים ב-[OPPORTUNITY_LOG: ...].**
**חשוב: תעד כל בחירה שהמשתמש עשה במהלך השיחה ב-[ACTIVITY_CHOICE: ...].**

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
