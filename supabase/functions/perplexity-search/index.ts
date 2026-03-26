const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, profileContext } = await req.json();

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Perplexity not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `אתה עוזר מחקר אסטרטגי שמתמחה במציאת הזדמנויות מתקדמות ומגוונות לאנשים בוגרים (60+) בישראל.

הרחב את החיפוש מעבר לתחביבים! חקור הזדמנויות אמיתיות מ-2026:
- **Fractional Consulting** – ייעוץ חלקי בתעשייה בתחום המומחיות
- **Micro-Entrepreneurship** – יזמות זעירה, עסקים קטנים מבוססי ניסיון
- **Intergenerational Mentoring** – מנטורינג בין-דורי בסטארטאפים ומוסדות אקדמיים
- **Board Memberships** – חברות בדירקטוריונים, ועדות מקצועיות
- **Digital Nomad Roles** – תפקידים דיגיטליים גמישים לבוגרים
- **Legacy Projects** – פרויקטים של מורשת, כתיבה, תיעוד
- **Social Impact Ventures** – יזמות חברתית, ארגוני השפעה
- **Expert-in-Residence** – מומחה-אורח בארגונים, אקסלרטורים, אוניברסיטאות

חפש הזדמנויות ספציפיות ואמיתיות - שמות ארגונים, קישורים, מיקומים.
התמקד בהזדמנויות ישראליות רלוונטיות.

${profileContext ? `פרופיל המשתמש:\n${profileContext}` : ""}

ענה בפורמט JSON מדויק:
{
  "results": [
    {
      "title": "שם ההזדמנות",
      "organization": "שם הארגון",
      "category": "work|volunteer|course|freelance|consulting|board|mentoring|entrepreneurship",
      "description": "תיאור קצר (2-3 משפטים)",
      "link": "קישור לאתר (אם נמצא)",
      "location": "מיקום",
      "whyFits": "למה זה מתאים לפרופיל המשתמש (משפט אחד)",
      "motivation_tag": "Status|Social_Connection|Legacy|Cognitive_Sharpness|Financial_Yield|Vitality",
      "scarcity_score": 7,
      "innovation_level": "high|medium|low"
    }
  ]
}

הנחיות חשובות:
- motivation_tag: בחר מהרשימה (Status, Social_Connection, Legacy, Cognitive_Sharpness, Financial_Yield, Vitality)
- scarcity_score: 1-10, כמה נדיר או קשה למצוא את התפקיד הזה בשוק הנוכחי
- innovation_level: כמה חדשני וייחודי התפקיד (high/medium/low)
- החזר 3-5 תוצאות רלוונטיות ומגוונות. ודא שכל תוצאה היא אמיתית ולא בדויה.
- נסה לכלול לפחות סוג אחד שאינו "volunteer" או "course" הקלאסיים.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Perplexity error:", response.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: \`Perplexity API error: \${response.status}\` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    // Try to parse JSON from the response
    let results = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*"results"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        results = parsed.results || [];
      }
    } catch {
      // If JSON parsing fails, return raw content
    }

    return new Response(
      JSON.stringify({ success: true, results, rawContent: content, citations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("perplexity-search error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
