// GoldenCanvas — AI Creative Discovery for seniors
// Modes: "image" (Visual Arts), "music" (Musical Legacy SFX), "story" (Memoir Writing)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, prompt, mood, genre } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    // ===== STORY (Memoir) =====
    if (mode === "story") {
      const sysPrompt =
        "אתה סופר חם וחומל הכותב סיפורי זיכרונות בעברית למבוגרים בני 65+. " +
        "קח את התשובה של המשתמש (זיכרון, חוויה או רגע מהחיים) והפוך אותה לסיפור קצר (200-300 מילים) " +
        "מעוצב, פיוטי, מרגש ומכבד. כתוב בגוף ראשון, בעברית עשירה אך נגישה. " +
        "פתח בכותרת קצרה ויפה (שורה אחת), ואז שורת רווח, ואז הסיפור עצמו בפסקאות קצרות.";

      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: String(prompt || "").slice(0, 2000) },
          ],
        }),
      });

      if (r.status === 429) return json({ error: "יותר מדי בקשות, נסו שוב בעוד רגע" }, 429);
      if (r.status === 402) return json({ error: "נדרש תשלום, פנו למנהל המערכת" }, 402);
      if (!r.ok) {
        const t = await r.text();
        console.error("AI story error:", r.status, t);
        return json({ error: "שגיאה ביצירת הסיפור" }, 500);
      }
      const data = await r.json();
      const story = data?.choices?.[0]?.message?.content || "";
      return json({ story });
    }

    // ===== IMAGE (Visual Arts) =====
    if (mode === "image") {
      const enhanced =
        `A beautiful classical oil painting in warm pastel tones, soft brushstrokes, ` +
        `museum-quality, peaceful atmosphere, depicting: ${String(prompt || "").slice(0, 800)}. ` +
        `Style: impressionist watercolor, gentle light, nostalgic mood, vintage canvas texture.`;

      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: enhanced }],
          modalities: ["image", "text"],
        }),
      });

      if (r.status === 429) return json({ error: "יותר מדי בקשות, נסו שוב בעוד רגע" }, 429);
      if (r.status === 402) return json({ error: "נדרש תשלום, פנו למנהל המערכת" }, 402);
      if (!r.ok) {
        const t = await r.text();
        console.error("AI image error:", r.status, t);
        return json({ error: "שגיאה ביצירת הציור" }, 500);
      }
      const data = await r.json();
      const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
      return json({ imageUrl });
    }

    // ===== MUSIC (description-based, since real audio gen requires ElevenLabs) =====
    if (mode === "music") {
      const sysPrompt =
        "אתה מלחין ומבקר מוזיקה חם וחומל הכותב למבוגרים בני 65+ בעברית. " +
        "תאר בפסקה קצרה ופיוטית (80-120 מילים) קטע מוזיקלי דמיוני באורך 30 שניות, " +
        "המבוסס על הסגנון והמצב-רוח שהמשתמש בחר. ציין: כלים, קצב, רגש, ודמיון של רגע מהחיים שמתאים. " +
        "סיים במשפט מעודד.";

      const userMsg = `סגנון: ${genre || "ג'אז קלאסי"}. מצב רוח: ${mood || "נוסטלגי"}. ` +
        `הוסף תיאור חי וחם של הקטע.`;

      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: userMsg },
          ],
        }),
      });

      if (r.status === 429) return json({ error: "יותר מדי בקשות, נסו שוב בעוד רגע" }, 429);
      if (r.status === 402) return json({ error: "נדרש תשלום, פנו למנהל המערכת" }, 402);
      if (!r.ok) {
        const t = await r.text();
        console.error("AI music error:", r.status, t);
        return json({ error: "שגיאה ביצירת המוזיקה" }, 500);
      }
      const data = await r.json();
      const description = data?.choices?.[0]?.message?.content || "";
      return json({ description });
    }

    return json({ error: "Unknown mode" }, 400);
  } catch (e) {
    console.error("golden-canvas error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
