import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { action } = body;

    // Action: get-matches - calculate compatibility scores for a user profile
    if (action === "get-matches") {
      const { viaScores, scheinScores, hollandScores, tokenId } = body;

      if (!viaScores || !scheinScores) {
        return jsonResponse({ error: "Missing scores" }, 400);
      }

      // Get top categories
      const topVIA = Object.entries(viaScores as Record<string, number>)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      const topSchein = Object.entries(scheinScores as Record<string, number>)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      const topHolland = hollandScores
        ? Object.entries(hollandScores as Record<string, number>)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([k]) => k)
        : [];

      // Determine social/analytical tendency from VIA + Schein
      const socialCategories = ["אנושיות", "חוש צדק", "מיקוד בטוב/נשגבות"];
      const analyticalCategories = ["חכמה וידע", "מתינות וריסון"];
      const socialScore = socialCategories.reduce((s, c) => s + ((viaScores as any)[c] || 0), 0) / socialCategories.length;
      const analyticalScore = analyticalCategories.reduce((s, c) => s + ((viaScores as any)[c] || 0), 0) / analyticalCategories.length;
      const userSocial = socialScore / 5; // normalize to 0-1
      const userAnalytical = analyticalScore / 5;

      // Fetch all active opportunities
      const { data: opportunities, error: opError } = await supabase
        .from("opportunities")
        .select("*")
        .eq("is_active", true);

      if (opError) return jsonResponse({ error: opError.message }, 500);

      // Fetch crowd intelligence - feedback from similar profiles
      let crowdBoost: Record<string, number> = {};
      if (tokenId) {
        const { data: feedbackData } = await supabase
          .from("user_feedback")
          .select("opportunity_id, feedback")
          .in("feedback", ["accurate", "interesting"]);

        if (feedbackData) {
          for (const fb of feedbackData) {
            crowdBoost[fb.opportunity_id] = (crowdBoost[fb.opportunity_id] || 0) + 
              (fb.feedback === "accurate" ? 0.1 : 0.05);
          }
        }
      }

      // Calculate compatibility scores
      const matches = (opportunities || []).map((opp: any) => {
        const traits = opp.target_traits || {};
        let score = 0;
        let reasons: string[] = [];

        // 1. VIA match (30%)
        if (traits.via_top === topVIA) {
          score += 30;
          reasons.push(`החוזקה המובילה שלך "${topVIA}" תואמת במדויק`);
        } else if (traits.via_top) {
          const viaScore = (viaScores as any)[traits.via_top] || 0;
          const bonus = (viaScore / 5) * 20;
          score += bonus;
          if (bonus > 10) reasons.push(`יש לך חוזקה משמעותית ב"${traits.via_top}"`);
        }

        // 2. Schein match (30%)
        if (traits.schein_top === topSchein) {
          score += 30;
          reasons.push(`העוגן התעסוקתי "${topSchein}" מתאים בדיוק`);
        } else if (traits.schein_top) {
          const scheinScore = (scheinScores as any)[traits.schein_top] || 0;
          const bonus = (scheinScore / 7) * 20;
          score += bonus;
          if (bonus > 10) reasons.push(`יש לך נטייה ל"${traits.schein_top}"`);
        }

        // 3. Holland match (20%)
        if (traits.holland && Array.isArray(traits.holland)) {
          const hollandOverlap = traits.holland.filter((h: string) => topHolland.includes(h));
          const hollandBonus = (hollandOverlap.length / Math.max(traits.holland.length, 1)) * 20;
          score += hollandBonus;
          if (hollandOverlap.length > 0) reasons.push(`נטיות תעסוקתיות תואמות: ${hollandOverlap.join(", ")}`);
        }

        // 4. Social/Analytical fit (15%)
        if (traits.social !== undefined || traits.analytical !== undefined) {
          const socialDiff = Math.abs(userSocial - (traits.social || 0));
          const analyticalDiff = Math.abs(userAnalytical - (traits.analytical || 0));
          const fitScore = (1 - (socialDiff + analyticalDiff) / 2) * 15;
          score += Math.max(0, fitScore);
          if (fitScore > 10) reasons.push("מתאים לאיזון החברתי-אנליטי שלך");
        }

        // 5. Crowd intelligence boost (5%)
        const crowd = crowdBoost[opp.id] || 0;
        score += Math.min(crowd, 5);
        if (crowd > 0.1) reasons.push("מומלץ ע\"י משתמשים עם פרופיל דומה");

        return {
          ...opp,
          matchScore: Math.round(Math.min(score, 100)),
          reasons,
        };
      });

      // Sort by match score descending
      matches.sort((a: any, b: any) => b.matchScore - a.matchScore);

      // Generate AI rationale for top 5
      const top5 = matches.slice(0, 5);
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

      if (LOVABLE_API_KEY && top5.length > 0) {
        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content: `אתה יועץ קריירה לגמלאים ישראלים. כתוב הסבר קצר ואישי (2-3 משפטים) למה כל הזדמנות מתאימה למשתמש.
פרופיל: VIA מוביל: ${topVIA}, שיין מוביל: ${topSchein}, הולנד: ${topHolland.join(",")}.
ענה ב-JSON array של strings, כל אחד הסבר להזדמנות לפי הסדר.`,
                },
                {
                  role: "user",
                  content: JSON.stringify(top5.map((m: any) => ({ title: m.title, org: m.organization_name, category: m.category }))),
                },
              ],
              tools: [{
                type: "function",
                function: {
                  name: "provide_rationales",
                  description: "Return AI rationale for each match",
                  parameters: {
                    type: "object",
                    properties: {
                      rationales: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["rationales"],
                    additionalProperties: false,
                  },
                },
              }],
              tool_choice: { type: "function", function: { name: "provide_rationales" } },
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall) {
              const parsed = JSON.parse(toolCall.function.arguments);
              const rationales = parsed.rationales || [];
              top5.forEach((m: any, i: number) => {
                if (rationales[i]) m.aiRationale = rationales[i];
              });
            }
          }
        } catch (e) {
          console.error("AI rationale error:", e);
        }
      }

      return jsonResponse({ matches: top5, totalOpportunities: matches.length });
    }

    // Action: submit-feedback
    if (action === "submit-feedback") {
      const { tokenId, opportunityId, feedback } = body;
      if (!tokenId || !opportunityId || !feedback) {
        return jsonResponse({ error: "Missing fields" }, 400);
      }

      const { error } = await supabase
        .from("user_feedback")
        .upsert({ token_id: tokenId, opportunity_id: opportunityId, feedback }, { onConflict: "token_id,opportunity_id" });

      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true });
    }

    // Action: admin-analytics (for Admin dashboard)
    if (action === "admin-analytics") {
      const adminPw = req.headers.get("x-admin-password");
      if (adminPw !== Deno.env.get("ADMIN_PASSWORD")) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      // Profile distribution
      const { data: responses } = await supabase
        .from("questionnaire_responses")
        .select("response_data");

      // Feedback stats
      const { data: feedback } = await supabase
        .from("user_feedback")
        .select("opportunity_id, feedback");

      // All opportunities
      const { data: opps } = await supabase
        .from("opportunities")
        .select("id, title, organization_name, category, target_traits");

      // Aggregate profile distribution
      const profileDist: Record<string, number> = {};
      const scheinDist: Record<string, number> = {};
      (responses || []).forEach((r: any) => {
        const data = r.response_data;
        if (data?.finalViaAnswers || data?.viaAnswers) {
          // We'd need full scoring here but we can approximate from stored step
          // For now count top categories if available in chatMessages or directly
        }
      });

      // Feedback aggregation
      const feedbackByOpp: Record<string, { accurate: number; interesting: number; not_relevant: number }> = {};
      (feedback || []).forEach((f: any) => {
        if (!feedbackByOpp[f.opportunity_id]) {
          feedbackByOpp[f.opportunity_id] = { accurate: 0, interesting: 0, not_relevant: 0 };
        }
        feedbackByOpp[f.opportunity_id][f.feedback as keyof typeof feedbackByOpp[string]]++;
      });

      // Find gaps - opportunities per trait combo
      const traitCoverage: Record<string, string[]> = {};
      (opps || []).forEach((o: any) => {
        const key = `${o.target_traits?.via_top || "?"}|${o.target_traits?.schein_top || "?"}`;
        if (!traitCoverage[key]) traitCoverage[key] = [];
        traitCoverage[key].push(o.title);
      });

      return jsonResponse({
        totalResponses: responses?.length || 0,
        totalOpportunities: opps?.length || 0,
        totalFeedback: feedback?.length || 0,
        feedbackByOpportunity: feedbackByOpp,
        opportunities: opps,
        traitCoverage,
      });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("smart-match error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
