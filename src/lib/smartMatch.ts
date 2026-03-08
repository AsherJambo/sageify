import { supabase } from "@/integrations/supabase/client";

export interface MatchedOpportunity {
  id: string;
  title: string;
  organization_name: string;
  description: string;
  category: "work" | "volunteer" | "course" | "freelance";
  link: string;
  logo_url: string | null;
  location: string | null;
  matchScore: number;
  reasons: string[];
  aiRationale?: string;
}

export async function getSmartMatches(
  viaScores: Record<string, number>,
  scheinScores: Record<string, number>,
  hollandScores?: Record<string, number>,
  tokenId?: string
): Promise<{ matches: MatchedOpportunity[]; totalOpportunities: number }> {
  const { data, error } = await supabase.functions.invoke("smart-match", {
    body: {
      action: "get-matches",
      viaScores,
      scheinScores,
      hollandScores,
      tokenId,
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function submitFeedback(
  tokenId: string,
  opportunityId: string,
  feedback: "accurate" | "interesting" | "not_relevant"
) {
  const { data, error } = await supabase.functions.invoke("smart-match", {
    body: { action: "submit-feedback", tokenId, opportunityId, feedback },
  });
  if (error) throw new Error(error.message);
  return data;
}
