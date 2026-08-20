import { supabase } from '@/integrations/supabase/client';

export type InteractionType = 'dismiss' | 'star' | 'click' | 'view' | 'explore' | 'reject' | 'save' | 'complete_phase';
export type TargetType = 'opportunity' | 'career_path' | 'activity' | 'course' | 'roadmap_task' | 'phase';

interface TrackParams {
  tokenId: string;
  interactionType: InteractionType;
  targetType: TargetType;
  targetTitle: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function trackInteraction(params: TrackParams): Promise<void> {
  try {
    await supabase.from('user_interactions' as any).insert([{
      token_id: params.tokenId,
      interaction_type: params.interactionType,
      target_type: params.targetType,
      target_title: params.targetTitle,
      target_id: params.targetId || null,
      metadata: params.metadata || {},
    }]);
  } catch (e) {
    console.warn('[Tracker] Silent track failed:', e);
  }
}

export async function getInteractionStats(adminPassword?: string): Promise<{
  totalInteractions: number;
  byType: Record<string, number>;
  byTarget: Record<string, number>;
  dismissalRate: number;
  starRate: number;
  topStarred: { title: string; count: number }[];
  topDismissed: { title: string; count: number }[];
  recentTrends: { date: string; count: number }[];
}> {
  let data: any[] | null = null;
  if (adminPassword) {
    const res = await supabase.functions.invoke('admin', {
      headers: { 'x-admin-password': adminPassword },
      body: { action: 'list-interactions' },
    });
    data = (res.data as any)?.interactions ?? null;
  }



  const interactions = (data || []) as any[];
  const byType: Record<string, number> = {};
  const byTarget: Record<string, number> = {};
  const starredMap: Record<string, number> = {};
  const dismissedMap: Record<string, number> = {};
  const dateMap: Record<string, number> = {};

  for (const i of interactions) {
    byType[i.interaction_type] = (byType[i.interaction_type] || 0) + 1;
    byTarget[i.target_type] = (byTarget[i.target_type] || 0) + 1;

    if (i.interaction_type === 'star') {
      starredMap[i.target_title] = (starredMap[i.target_title] || 0) + 1;
    }
    if (i.interaction_type === 'dismiss' || i.interaction_type === 'reject') {
      dismissedMap[i.target_title] = (dismissedMap[i.target_title] || 0) + 1;
    }

    const date = new Date(i.created_at).toISOString().split('T')[0];
    dateMap[date] = (dateMap[date] || 0) + 1;
  }

  const total = interactions.length || 1;

  return {
    totalInteractions: interactions.length,
    byType,
    byTarget,
    dismissalRate: ((byType['dismiss'] || 0) + (byType['reject'] || 0)) / total,
    starRate: (byType['star'] || 0) / total,
    topStarred: Object.entries(starredMap).sort(([, a], [, b]) => b - a).slice(0, 10).map(([title, count]) => ({ title, count })),
    topDismissed: Object.entries(dismissedMap).sort(([, a], [, b]) => b - a).slice(0, 10).map(([title, count]) => ({ title, count })),
    recentTrends: Object.entries(dateMap).sort(([a], [b]) => a.localeCompare(b)).slice(-30).map(([date, count]) => ({ date, count })),
  };
}
