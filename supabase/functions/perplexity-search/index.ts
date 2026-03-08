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

    const systemPrompt = `אתה עוזר מחקר שמתמחה במציאת הזדמנויות עבודה, התנדבות, קורסים ופעילויות לאנשים בוגרים (60+) בישראל.

חפש הזדמנויות ספציפיות ואמיתיות - שמות ארגונים, קישורים, מיקומים.
התמקד בהזדמנויות ישראליות רלוונטיות.

${profileContext ? `פרופיל המשתמש:\n${profileContext}` : ""}

ענה בפורמט JSON מדויק:
{
  "results": [
    {
      "title": "שם ההזדמנות",
      "organization": "שם הארגון",
      "category": "work|volunteer|course|freelance",
      "description": "תיאור קצר (2-3 משפטים)",
      "link": "קישור לאתר (אם נמצא)",
      "location": "מיקום",
      "whyFits": "למה זה מתאים לפרופיל המשתמש (משפט אחד)"
    }
  ]
}

החזר 3-5 תוצאות רלוונטיות. ודא שכל תוצאה היא אמיתית ולא בדויה.`;

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
        JSON.stringify({ success: false, error: `Perplexity API error: ${response.status}` }),
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
