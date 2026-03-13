import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  tokenId: string;
  psychometricScores: Record<string, number>;
  careerHistory?: string;
  primaryInterests?: string[];
  personalitySliders?: Record<string, number>;
  valueAlignment?: string[];
  archetype?: string;
}

export async function saveUserProfile(data: ProfileData): Promise<void> {
  try {
    await supabase.from('user_profiles' as any).upsert({
      token_id: data.tokenId,
      psychometric_scores: data.psychometricScores,
      career_history: data.careerHistory || '',
      primary_interests: data.primaryInterests || [],
      personality_sliders: data.personalitySliders || {},
      value_alignment: data.valueAlignment || [],
      archetype: data.archetype || '',
    }, { onConflict: 'token_id' });
  } catch (e) {
    console.warn('[Profile] Silent save failed:', e);
  }
}

export async function getAggregateProfileStats(): Promise<{
  totalProfiles: number;
  avgSliders: Record<string, number>;
  topValues: { value: string; count: number }[];
  topArchetypes: { archetype: string; count: number }[];
  acceptanceRateByMonth: { month: string; rate: number; total: number }[];
}> {
  const [{ data: profiles }, { data: feedback }, { data: interactions }] = await Promise.all([
    supabase.from('user_profiles' as any).select('*').limit(1000),
    supabase.from('user_feedback').select('feedback, created_at').limit(1000),
    supabase.from('user_interactions' as any).select('interaction_type, created_at').limit(1000),
  ]);

  const allProfiles = (profiles || []) as any[];
  const allFeedback = (feedback || []) as any[];
  const allInteractions = (interactions || []) as any[];

  // Average sliders
  const sliderSums: Record<string, { sum: number; count: number }> = {};
  for (const p of allProfiles) {
    const sliders = p.personality_sliders || {};
    for (const [key, val] of Object.entries(sliders)) {
      if (typeof val === 'number') {
        if (!sliderSums[key]) sliderSums[key] = { sum: 0, count: 0 };
        sliderSums[key].sum += val;
        sliderSums[key].count += 1;
      }
    }
  }
  const avgSliders: Record<string, number> = {};
  for (const [key, { sum, count }] of Object.entries(sliderSums)) {
    avgSliders[key] = Math.round(sum / count);
  }

  // Top values
  const valueCounts: Record<string, number> = {};
  for (const p of allProfiles) {
    const vals = p.value_alignment || [];
    for (const v of vals) {
      valueCounts[v] = (valueCounts[v] || 0) + 1;
    }
  }
  const topValues = Object.entries(valueCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));

  // Top archetypes
  const archCounts: Record<string, number> = {};
  for (const p of allProfiles) {
    if (p.archetype) archCounts[p.archetype] = (archCounts[p.archetype] || 0) + 1;
  }
  const topArchetypes = Object.entries(archCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([archetype, count]) => ({ archetype, count }));

  // Acceptance rate by month (from feedback + interactions)
  const monthlyStats: Record<string, { positive: number; total: number }> = {};

  for (const f of allFeedback) {
    const month = new Date(f.created_at).toISOString().slice(0, 7);
    if (!monthlyStats[month]) monthlyStats[month] = { positive: 0, total: 0 };
    monthlyStats[month].total += 1;
    if (f.feedback === 'accurate' || f.feedback === 'interesting') {
      monthlyStats[month].positive += 1;
    }
  }

  for (const i of allInteractions) {
    const month = new Date(i.created_at).toISOString().slice(0, 7);
    if (!monthlyStats[month]) monthlyStats[month] = { positive: 0, total: 0 };
    monthlyStats[month].total += 1;
    if (i.interaction_type === 'star' || i.interaction_type === 'save' || i.interaction_type === 'explore') {
      monthlyStats[month].positive += 1;
    }
  }

  const acceptanceRateByMonth = Object.entries(monthlyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { positive, total }]) => ({
      month,
      rate: Math.round((positive / Math.max(total, 1)) * 100),
      total,
    }));

  return {
    totalProfiles: allProfiles.length,
    avgSliders,
    topValues,
    topArchetypes,
    acceptanceRateByMonth,
  };
}
