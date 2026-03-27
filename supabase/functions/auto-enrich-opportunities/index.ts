import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEARCH_QUERIES = [
  "הזדמנויות התנדבות חינוך למבוגרים גיל שלישי ישראל 2026",
  "קורסים והכשרות מקצועיות לגמלאים ופורשים ישראל 2026",
  "עבודה פרילנס עצמאית לגילאי 60 פלוס ישראל 2026",
  "הזדמנויות ייעוץ ומנטורינג לפורשים בכירים ישראל 2026",
  "התנדבות בתחום טכנולוגיה ודיגיטל למבוגרים ישראל 2026",
  "יזמות חברתית לגיל השלישי תוכניות מאיצים ישראל 2026",
  "חברות בדירקטוריונים ועדות מקצועיות לפורשים ישראל 2026",
  "מנטורינג בין-דורי סטארטאפים אקדמיה ישראל 2026",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!PERPLEXITY_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Pick 2 random queries each run to avoid hitting rate limits
    const shuffled = [...SEARCH_QUERIES].sort(() => Math.random() - 0.5);
    const selectedQueries = shuffled.slice(0, 2);

    const systemPrompt = `אתה עוזר מחקר אסטרטגי שמתמחה במציאת הזדמנויות מתקדמות ומגוונות לאנשים בוגרים (60+) בישראל.

הרחב את החיפוש מעבר לתחביבים! חקור הזדמנויות אמיתיות מ-2026:
- Fractional Consulting, Micro-Entrepreneurship, Intergenerational Mentoring
- Board Memberships, Digital Nomad Roles, Legacy Projects
- Social Impact Ventures, Expert-in-Residence

חפש הזדמנויות ספציפיות ואמיתיות - שמות ארגונים, קישורים, מיקומים.
התמקד בהזדמנויות ישראליות רלוונטיות.

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
      "whyFits": "למה זה מתאים לפורשים בגיל השלישי",
      "motivation_tag": "Status|Social_Connection|Legacy|Cognitive_Sharpness|Financial_Yield|Vitality",
      "scarcity_score": 7,
      "innovation_level": "high|medium|low"
    }
  ]
}

הנחיות: החזר 4-6 תוצאות מגוונות ואמיתיות. כלול לפחות 2 סוגים שונים של קטגוריות.`;

    let totalSaved = 0;
    let totalSkipped = 0;

    for (const query of selectedQueries) {
      console.log("Searching:", query);

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
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        console.error("Perplexity error:", response.status, await response.text());
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      let results: any[] = [];
      try {
        const jsonMatch = content.match(/\{[\s\S]*"results"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          results = parsed.results || [];
        }
      } catch {
        console.error("Failed to parse results for query:", query);
        continue;
      }

      // De-duplicate against existing opportunities by title
      for (const result of results) {
        const { data: existing } = await supabase
          .from("opportunities")
          .select("id")
          .ilike("title", result.title)
          .limit(1);

        if (existing && existing.length > 0) {
          totalSkipped++;
          continue;
        }

        const { error: insertError } = await supabase.from("opportunities").insert([{
          title: result.title,
          organization_name: result.organization || "לא צוין",
          category: result.category || "work",
          description: result.description || "",
          link: result.link || "",
          location: result.location || null,
          target_traits: {
            source: "auto-enrichment",
            whyFits: result.whyFits || "",
            motivation_tag: result.motivation_tag || "",
            scarcity_score: result.scarcity_score || 0,
            innovation_level: result.innovation_level || "medium",
          },
        }]);

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          totalSaved++;
        }
      }

      // Small delay between queries
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Auto-enrichment complete: ${totalSaved} saved, ${totalSkipped} skipped (duplicates)`);

    return new Response(
      JSON.stringify({
        success: true,
        saved: totalSaved,
        skipped: totalSkipped,
        queriesRun: selectedQueries.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("auto-enrich error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
