import { cloudClient } from '@/lib/cloudClient';

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
    await cloudClient.functions.invoke('save-user-profile', {
      body: {
        token: data.tokenId,
        profile_data: {
          psychometric_scores: data.psychometricScores,
          career_history: data.careerHistory || '',
          primary_interests: data.primaryInterests || [],
          personality_sliders: data.personalitySliders || {},
          value_alignment: data.valueAlignment || [],
          archetype: data.archetype || '',
        },
      },
    });
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
  // Aggregate stats are no longer fetched client-side for security.
  // They can be exposed through a separate admin Edge Function if needed.
  return {
    totalProfiles: 0,
    avgSliders: {},
    topValues: [],
    topArchetypes: [],
    acceptanceRateByMonth: [],
  };
}
