import { useState, useEffect, useMemo } from 'react';
import { cloudClient } from '@/lib/cloudClient';
import { getInteractionStats } from '@/lib/interactionTracker';
import { deriveProfessionCategory } from '@/lib/insightsSaver';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import { skills } from '@/data/skillsData';
import { calculateCategoryScores, getTopCategories } from '@/lib/scoring';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, Brain, TrendingUp, Target, Database, Users, Star, ThumbsDown, Activity, AlertTriangle, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const COLORS = ['hsl(158, 64%, 40%)', 'hsl(260, 60%, 60%)', 'hsl(210, 45%, 35%)', 'hsl(35, 80%, 55%)', 'hsl(340, 65%, 50%)', 'hsl(180, 50%, 40%)', 'hsl(15, 70%, 50%)', 'hsl(280, 50%, 55%)'];

const MOTIVATION_LABELS: Record<string, string> = {
  Status: 'סטטוס',
  Social_Connection: 'חיבור חברתי',
  Legacy: 'מורשת',
  Cognitive_Sharpness: 'חדות קוגניטיבית',
  Financial_Yield: 'תשואה כלכלית',
  Vitality: 'חיוניות',
};

const ACTIVITY_LABELS: Record<string, string> = {
  volunteering: 'התנדבות',
  education: 'לימודים',
  consulting: 'ייעוץ',
  social: 'פעילות חברתית',
  creative: 'יצירה',
  business: 'יזמות',
  fitness: 'כושר ובריאות',
  other: 'אחר',
};

function classifyActivityType(activity: string): string {
  if (!activity) return 'other';
  const a = activity.toLowerCase();
  if (a.includes('התנדבות') || a.includes('volunteer')) return 'volunteering';
  if (a.includes('לימוד') || a.includes('קורס') || a.includes('study') || a.includes('course')) return 'education';
  if (a.includes('ייעוץ') || a.includes('מנטור') || a.includes('consult') || a.includes('mentor')) return 'consulting';
  if (a.includes('חברתי') || a.includes('קהילה') || a.includes('social') || a.includes('community')) return 'social';
  if (a.includes('יצירה') || a.includes('אמנות') || a.includes('creat') || a.includes('art')) return 'creative';
  if (a.includes('עסק') || a.includes('יזמות') || a.includes('business') || a.includes('startup')) return 'business';
  if (a.includes('כושר') || a.includes('ספורט') || a.includes('fitness') || a.includes('health')) return 'fitness';
  return 'other';
}

function escCSV(val: string) {
  if (!val) return '';
  if (val.includes(',') || val.includes('"') || val.includes('\n')) return `"${val.replace(/"/g, '""')}"`;
  return val;
}

interface TokenRow {
  id: string;
  username: string;
  completed_at: string | null;
  used: boolean;
  questionnaire_responses?: { response_data: Record<string, unknown> } | { response_data: Record<string, unknown> }[] | null;
}

interface InsightRow {
  id: string;
  token_id: string;
  activity_suggested: string;
  motivation_logic: string;
  user_persona: string;
  constraints: string;
  via_top: { category: string; score: number }[];
  schein_top: { category: string; score: number }[];
  holland_top: string[];
  skills_winner: string[];
  dream: string;
  scarcity_score: number;
  motivation_tag: string;
  gap_detected: boolean;
  market_unmet_need: string;
  profession_category: string;
  created_at: string;
  preferences: Record<string, string[]>;
}

interface Props {
  tokens: TokenRow[];
  adminPassword: string;
}

export default function AdminUnifiedInsights({ tokens, adminPassword }: Props) {
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [activityChoices, setActivityChoices] = useState<any[]>([]);
  const [interactionStats, setInteractionStats] = useState<Awaited<ReturnType<typeof getInteractionStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [insightsRes, oppsRes, interactions, choicesRes] = await Promise.all([
        cloudClient.from('global_retiree_insights').select('*').order('created_at', { ascending: false }),
        cloudClient.from('opportunities').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(50),
        getInteractionStats(),
        cloudClient.from('activity_choices').select('*').order('created_at', { ascending: false }).limit(1000),
      ]);
      if (insightsRes.data) setInsights(insightsRes.data as unknown as InsightRow[]);
      if (oppsRes.data) setOpportunities(oppsRes.data);
      if (choicesRes.data) setActivityChoices(choicesRes.data);
      setInteractionStats(interactions);
      setLoading(false);
    })();
  }, []);

  // ===== ACTIVITY CHOICES AGGREGATION =====
  const activityAgg = useMemo(() => {
    if (activityChoices.length === 0) return null;

    // Top activities by count
    const actNameCounts: Record<string, number> = {};
    const actTypeCounts: Record<string, number> = {};
    const reasonCounts: Record<string, number> = {};
    const reasonsByActivity: Record<string, Record<string, number>> = {};

    for (const c of activityChoices) {
      actNameCounts[c.activity_name] = (actNameCounts[c.activity_name] || 0) + 1;
      actTypeCounts[c.activity_type] = (actTypeCounts[c.activity_type] || 0) + 1;

      const reasons = (c.reasons || []) as string[];
      if (!reasonsByActivity[c.activity_name]) reasonsByActivity[c.activity_name] = {};
      for (const r of reasons) {
        reasonCounts[r] = (reasonCounts[r] || 0) + 1;
        reasonsByActivity[c.activity_name][r] = (reasonsByActivity[c.activity_name][r] || 0) + 1;
      }
    }

    const topActivities = Object.entries(actNameCounts).sort(([, a], [, b]) => b - a).slice(0, 15);
    const topReasons = Object.entries(reasonCounts).sort(([, a], [, b]) => b - a).slice(0, 12);
    const topTypes = Object.entries(actTypeCounts).sort(([, a], [, b]) => b - a);

    // Enrich top activities with their top reasons
    const activitiesWithReasons = topActivities.map(([name, count]) => {
      const reasons = reasonsByActivity[name] || {};
      const topR = Object.entries(reasons).sort(([, a], [, b]) => b - a).slice(0, 3);
      return { name, count, topReasons: topR };
    });

    return { total: activityChoices.length, topActivities: activitiesWithReasons, topReasons, topTypes };
  }, [activityChoices]);

  // ===== POPULATION PSYCHOLOGY FROM TOKENS =====
  const populationInsights = useMemo(() => {
    const completedTokens = tokens.filter(t => t.questionnaire_responses != null);
    if (completedTokens.length === 0) return null;

    const viaAgg: Record<string, { total: number; count: number }> = {};
    viaCategories.forEach(c => { viaAgg[c] = { total: 0, count: 0 }; });
    const scheinAgg: Record<string, { total: number; count: number }> = {};
    scheinCategories.forEach(c => { scheinAgg[c] = { total: 0, count: 0 }; });
    const hollandAgg: Record<string, { total: number; count: number }> = {};
    hollandCategories.forEach(c => { hollandAgg[c] = { total: 0, count: 0 }; });

    const topVIACount: Record<string, number> = {};
    const topScheinCount: Record<string, number> = {};
    const topHollandCount: Record<string, number> = {};
    const dreamCount: Record<string, number> = {};
    const skillWinnerCount: Record<string, number> = {};
    let totalProfiles = 0;

    completedTokens.forEach(t => {
      const raw = (Array.isArray(t.questionnaire_responses)
        ? t.questionnaire_responses[0]?.response_data
        : t.questionnaire_responses?.response_data) as Record<string, any> || {};

      const viaAnswers = raw.finalViaAnswers || raw.viaAnswers;
      const scheinAnswers = raw.finalScheinAnswers || raw.scheinAnswers;
      const hollandAnswers = raw.hollandAnswers;
      if (!viaAnswers && !scheinAnswers) return;
      totalProfiles++;

      if (viaAnswers) {
        const scores = calculateCategoryScores(viaAnswers, viaQuestions, viaCategories);
        Object.entries(scores).forEach(([cat, score]) => {
          if (score > 0) { viaAgg[cat].total += score; viaAgg[cat].count++; }
        });
        const top = getTopCategories(scores, 1)[0];
        if (top) topVIACount[top.category] = (topVIACount[top.category] || 0) + 1;
      }
      if (scheinAnswers) {
        const scores = calculateCategoryScores(scheinAnswers, scheinQuestions, scheinCategories);
        Object.entries(scores).forEach(([cat, score]) => {
          if (score > 0) { scheinAgg[cat].total += score; scheinAgg[cat].count++; }
        });
        const top = getTopCategories(scores, 1)[0];
        if (top) topScheinCount[top.category] = (topScheinCount[top.category] || 0) + 1;
      }
      if (hollandAnswers) {
        const hScores: Record<string, number> = {};
        hollandCategories.forEach(c => { hScores[c] = 0; });
        Object.entries(hollandAnswers).forEach(([id, val]) => {
          if (val) {
            const q = hollandQuestions.find(q => q.id === Number(id));
            if (q) hScores[q.category]++;
          }
        });
        Object.entries(hScores).forEach(([cat, score]) => {
          hollandAgg[cat].total += score; hollandAgg[cat].count++;
        });
        const topH = Object.entries(hScores).sort(([, a], [, b]) => b - a)[0];
        if (topH) topHollandCount[topH[0]] = (topHollandCount[topH[0]] || 0) + 1;
      }

      const prefs = raw.preferencesData as { dream?: string } | undefined;
      if (prefs?.dream) dreamCount[prefs.dream] = (dreamCount[prefs.dream] || 0) + 1;

      const sa = raw.skillsAssignments as Record<string, string> | undefined;
      if (sa) {
        Object.entries(sa).forEach(([id, col]) => {
          const skill = skills.find(s => s.id === Number(id))?.text || id;
          if (col === 'winner') skillWinnerCount[skill] = (skillWinnerCount[skill] || 0) + 1;
        });
      }
    });

    return {
      totalProfiles,
      viaAvg: Object.entries(viaAgg).map(([cat, { total, count }]) => ({
        category: cat, avg: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
      })).sort((a, b) => b.avg - a.avg),
      scheinAvg: Object.entries(scheinAgg).map(([cat, { total, count }]) => ({
        category: cat, avg: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
      })).sort((a, b) => b.avg - a.avg),
      hollandAvg: Object.entries(hollandAgg).map(([cat, { total, count }]) => ({
        category: cat, avg: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
      })).sort((a, b) => b.avg - a.avg),
      topVIACount: Object.entries(topVIACount).sort(([, a], [, b]) => b - a),
      topScheinCount: Object.entries(topScheinCount).sort(([, a], [, b]) => b - a),
      topHollandCount: Object.entries(topHollandCount).sort(([, a], [, b]) => b - a),
      dreams: Object.entries(dreamCount).sort(([, a], [, b]) => b - a),
      winnerSkills: Object.entries(skillWinnerCount).sort(([, a], [, b]) => b - a).slice(0, 8),
    };
  }, [tokens]);

  // ===== INSIGHTS AGGREGATION =====
  const enrichedInsights = useMemo(() => {
    return insights.map(i => ({
      ...i,
      profession_category: i.profession_category || deriveProfessionCategory((i.skills_winner || []) as string[]),
    }));
  }, [insights]);

  const personaCounts = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach(i => { map[i.user_persona] = (map[i.user_persona] || 0) + 1; });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [insights]);

  const constraintCounts = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach(i => {
      (i.constraints || '').split(',').map(c => c.trim()).filter(Boolean).forEach(c => {
        map[c] = (map[c] || 0) + 1;
      });
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 8);
  }, [insights]);

  const gapIndex = useMemo(() => {
    const demandMap: Record<string, number> = {};
    const scarcityMap: Record<string, { total: number; count: number }> = {};
    enrichedInsights.forEach(i => {
      const actType = classifyActivityType(i.activity_suggested);
      demandMap[actType] = (demandMap[actType] || 0) + 1;
      if (!scarcityMap[actType]) scarcityMap[actType] = { total: 0, count: 0 };
      scarcityMap[actType].total += (i.scarcity_score || 1);
      scarcityMap[actType].count++;
    });
    const supplyMap: Record<string, number> = {};
    opportunities.forEach(o => { supplyMap[o.category || 'other'] = (supplyMap[o.category || 'other'] || 0) + 1; });

    const allTypes = new Set([...Object.keys(demandMap), ...Object.keys(supplyMap)]);
    const results: { activity: string; label: string; demand: number; avgScarcity: number; supply: number; gapIndex: number }[] = [];
    allTypes.forEach(type => {
      const demand = demandMap[type] || 0;
      const avgScarcity = scarcityMap[type] ? scarcityMap[type].total / scarcityMap[type].count : 5;
      const supply = supplyMap[type] || 1;
      const gi = Math.round(((demand * avgScarcity) / supply) * 10) / 10;
      results.push({ activity: type, label: ACTIVITY_LABELS[type] || type, demand, avgScarcity: Math.round(avgScarcity * 10) / 10, supply, gapIndex: gi });
    });
    return results.sort((a, b) => b.gapIndex - a.gapIndex);
  }, [enrichedInsights, opportunities]);

  const unmetNeeds = useMemo(() => {
    return enrichedInsights
      .filter(i => i.gap_detected || i.scarcity_score >= 6)
      .sort((a, b) => b.scarcity_score - a.scarcity_score)
      .slice(0, 10)
      .map(i => ({
        persona: i.user_persona,
        motivation: MOTIVATION_LABELS[i.motivation_tag] || i.motivation_tag || '—',
        gapReason: i.market_unmet_need || i.constraints || 'לא זוהה',
        scarcity: i.scarcity_score,
        profession: i.profession_category,
      }));
  }, [enrichedInsights]);

  const exportCSV = () => {
    const headers = ['רקע מקצועי', 'פרסונה', 'פעילות מומלצת', 'מניע', 'ציון נדירות', 'Gap Index', 'חלום', 'מגבלות'];
    const rows = enrichedInsights.map(i => {
      const actType = classifyActivityType(i.activity_suggested);
      const gi = gapIndex.find(g => g.activity === actType)?.gapIndex || 0;
      return [i.profession_category, i.user_persona, i.activity_suggested, MOTIVATION_LABELS[i.motivation_tag] || i.motivation_tag, String(i.scarcity_score), String(gi), i.dream, i.constraints].map(v => escCSV(v));
    });
    const csv = '\uFEFF' + [headers.map(h => escCSV(h)), ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sageify-insights-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-card rounded-3xl border border-secondary/20 p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-foreground">מרכז תובנות ודאטה</h2>
              <p className="text-muted-foreground text-sm mt-1">
                כל הנתונים הפסיכומטריים, מגמות, פערי שוק ואינטראקציות — במקום אחד
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 shrink-0">
            <Download className="w-4 h-4" /> ייצוא CSV
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard icon={<Users className="w-5 h-5 text-secondary" />} value={populationInsights?.totalProfiles || 0} label="פרופילים מנותחים" />
        <KPICard icon={<Brain className="w-5 h-5 text-primary" />} value={insights.length} label="תובנות AI" />
        <KPICard icon={<Briefcase className="w-5 h-5 text-foreground" />} value={activityAgg?.total || 0} label="בחירות תעסוקה" />
        <KPICard icon={<Target className="w-5 h-5 text-destructive" />} value={opportunities.length} label="הזדמנויות פעילות" />
        <KPICard icon={<Activity className="w-5 h-5 text-secondary" />} value={interactionStats?.totalInteractions || 0} label="אינטראקציות" />
      </div>

      {/* Sub-tabs for organized sections */}
      <Tabs defaultValue="psychology" className="space-y-4">
        <TabsList className="flex flex-wrap w-full h-auto gap-1 p-1">
          <TabsTrigger value="psychology" className="gap-1.5 text-xs">🧠 DNA פסיכולוגי</TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5 text-xs">📊 פרסונות ומגמות</TabsTrigger>
          <TabsTrigger value="gaps" className="gap-1.5 text-xs">🎯 פערים ואסטרטגיה</TabsTrigger>
          <TabsTrigger value="interactions" className="gap-1.5 text-xs">💎 אינטראקציות</TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: PSYCHOLOGY DNA ===== */}
        <TabsContent value="psychology" className="space-y-6">
          {populationInsights ? (
            <>
              {/* VIA + Schein + Holland averages table */}
              <div className="bg-card rounded-2xl border border-border/60 p-5">
                <h3 className="font-bold font-display text-foreground mb-4">ממוצעי ציונים פסיכומטריים (אוכלוסייה)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ScoreTable title="VIA – חוזקות אופי" data={populationInsights.viaAvg} color="hsl(158, 64%, 40%)" />
                  <ScoreTable title="שיין – עוגנים תעסוקתיים" data={populationInsights.scheinAvg} color="hsl(260, 60%, 60%)" />
                  <ScoreTable title="הולנד – נטיות" data={populationInsights.hollandAvg} color="hsl(210, 45%, 35%)" />
                </div>
              </div>

              {/* Top traits table */}
              <div className="bg-card rounded-2xl border border-border/60 p-5">
                <h3 className="font-bold font-display text-foreground mb-4">התכונות הנפוצות ביותר</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TopTraitsTable title="Top VIA" data={populationInsights.topVIACount} total={populationInsights.totalProfiles} />
                  <TopTraitsTable title="Top שיין" data={populationInsights.topScheinCount} total={populationInsights.totalProfiles} />
                  <TopTraitsTable title="Top הולנד" data={populationInsights.topHollandCount} total={populationInsights.totalProfiles} />
                </div>
              </div>

              {/* Dreams + Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl border border-border/60 p-5">
                  <h3 className="font-bold font-display text-foreground mb-3">חלומות נפוצים</h3>
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-right">חלום</TableHead><TableHead className="text-center w-20">מספר</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {populationInsights.dreams.slice(0, 8).map(([dream, count]) => (
                        <TableRow key={dream}><TableCell className="text-right text-sm">{dream}</TableCell><TableCell className="text-center font-bold text-secondary">{count}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-5">
                  <h3 className="font-bold font-display text-foreground mb-3">מיומנויות מנצחות</h3>
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-right">מיומנות</TableHead><TableHead className="text-center w-20">מספר</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {populationInsights.winnerSkills.map(([skill, count]) => (
                        <TableRow key={skill}><TableCell className="text-right text-sm">{skill}</TableCell><TableCell className="text-center font-bold text-primary">{count}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Radar charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl border border-border/60 p-5">
                  <h3 className="font-bold font-display text-foreground mb-3 text-center">VIA – מפת רדאר</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={populationInsights.viaAvg.map(v => ({ subject: v.category.substring(0, 10), A: v.avg }))}>
                      <PolarGrid /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} /><PolarRadiusAxis />
                      <Radar dataKey="A" stroke="hsl(158, 64%, 40%)" fill="hsl(158, 64%, 40%)" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-5">
                  <h3 className="font-bold font-display text-foreground mb-3 text-center">הולנד – מפת רדאר</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={populationInsights.hollandAvg.map(v => ({ subject: v.category.substring(0, 10), A: v.avg }))}>
                      <PolarGrid /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} /><PolarRadiusAxis />
                      <Radar dataKey="A" stroke="hsl(210, 45%, 35%)" fill="hsl(210, 45%, 35%)" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין עדיין נתונים פסיכומטריים — הנתונים ייאספו אוטומטית</p>
            </div>
          )}
        </TabsContent>

        {/* ===== TAB 2: PERSONAS & TRENDS ===== */}
        <TabsContent value="trends" className="space-y-6">
          {insights.length > 0 ? (
            <>
              {/* Persona distribution table */}
              <div className="bg-card rounded-2xl border border-border/60 p-5">
                <h3 className="font-bold font-display text-foreground mb-4">התפלגות פרסונות</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-right">פרסונה</TableHead><TableHead className="text-center w-20">מספר</TableHead><TableHead className="text-center w-24">אחוז</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {personaCounts.map(([name, count]) => (
                        <TableRow key={name}><TableCell className="text-right text-sm">{name}</TableCell><TableCell className="text-center font-bold">{count}</TableCell><TableCell className="text-center text-muted-foreground">{((count / insights.length) * 100).toFixed(0)}%</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={personaCounts.map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                        {personaCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Constraints table */}
              <div className="bg-card rounded-2xl border border-border/60 p-5">
                <h3 className="font-bold font-display text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" /> מגבלות נפוצות
                </h3>
                <Table>
                  <TableHeader><TableRow><TableHead className="text-right">מגבלה</TableHead><TableHead className="text-center w-20">מספר</TableHead><TableHead className="text-right w-48">אחוז</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {constraintCounts.map(([name, count]) => (
                      <TableRow key={name}>
                        <TableCell className="text-right text-sm">{name}</TableCell>
                        <TableCell className="text-center font-bold">{count}</TableCell>
                        <TableCell>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-destructive/60 h-2 rounded-full" style={{ width: `${(count / (constraintCounts[0]?.[1] || 1)) * 100}%` }} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין עדיין נתוני תובנות</p>
            </div>
          )}
        </TabsContent>

        {/* ===== TAB 3: GAPS & STRATEGY ===== */}
        <TabsContent value="gaps" className="space-y-6">
          {/* Gap Index table */}
          <div className="bg-card rounded-2xl border border-border/60 p-5">
            <h3 className="font-bold font-display text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" /> Gap Index — פערי שוק
            </h3>
            {gapIndex.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">סוג פעילות</TableHead>
                      <TableHead className="text-center">ביקוש</TableHead>
                      <TableHead className="text-center">נדירות ממוצעת</TableHead>
                      <TableHead className="text-center">היצע</TableHead>
                      <TableHead className="text-center">Gap Index</TableHead>
                      <TableHead className="text-center w-20">רמה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gapIndex.map(g => (
                      <TableRow key={g.activity}>
                        <TableCell className="text-right font-medium">{g.label}</TableCell>
                        <TableCell className="text-center">{g.demand}</TableCell>
                        <TableCell className="text-center">{g.avgScarcity}</TableCell>
                        <TableCell className="text-center">{g.supply}</TableCell>
                        <TableCell className="text-center font-bold">{g.gapIndex}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            g.gapIndex >= 20 ? 'bg-destructive/15 text-destructive' :
                            g.gapIndex >= 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {g.gapIndex >= 20 ? 'קריטי' : g.gapIndex >= 10 ? 'בינוני' : 'תקין'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={gapIndex}>
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="gapIndex" radius={[6, 6, 0, 0]}>
                        {gapIndex.map((g, i) => (
                          <Cell key={i} fill={g.gapIndex >= 20 ? 'hsl(340, 65%, 50%)' : g.gapIndex >= 10 ? 'hsl(35, 80%, 55%)' : 'hsl(158, 64%, 40%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">אין נתונים</p>
            )}
          </div>

          {/* Unmet needs */}
          {unmetNeeds.length > 0 && (
            <div className="bg-card rounded-2xl border border-border/60 p-5">
              <h3 className="font-bold font-display text-foreground mb-4">צרכים לא נענים (Top 10)</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">פרסונה</TableHead>
                    <TableHead className="text-right">רקע מקצועי</TableHead>
                    <TableHead className="text-right">מניע</TableHead>
                    <TableHead className="text-right">סיבת הפער</TableHead>
                    <TableHead className="text-center">ציון נדירות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unmetNeeds.map((n, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{n.persona}</TableCell>
                      <TableCell className="text-sm">{n.profession || '—'}</TableCell>
                      <TableCell className="text-sm">{n.motivation}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{n.gapReason}</TableCell>
                      <TableCell className="text-center font-bold text-destructive">{n.scarcity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ===== TAB 4: INTERACTIONS ===== */}
        <TabsContent value="interactions" className="space-y-6">
          {interactionStats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPICard icon={<Activity className="w-5 h-5 text-primary" />} value={interactionStats.totalInteractions} label="סה״כ אינטראקציות" />
                <KPICard icon={<Star className="w-5 h-5 text-yellow-500" />} value={`${(interactionStats.starRate * 100).toFixed(0)}%`} label="שיעור שמירה" />
                <KPICard icon={<ThumbsDown className="w-5 h-5 text-destructive" />} value={`${(interactionStats.dismissalRate * 100).toFixed(0)}%`} label="שיעור דחייה" />
                <KPICard icon={<Database className="w-5 h-5 text-secondary" />} value={insights.length + interactionStats.totalInteractions} label="סה״כ רשומות" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top starred */}
                <div className="bg-card rounded-2xl border border-border/60 p-5">
                  <h3 className="font-bold font-display text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" /> הכי הרבה שמירות
                  </h3>
                  {interactionStats.topStarred.length > 0 ? (
                    <Table>
                      <TableHeader><TableRow><TableHead className="text-right">פריט</TableHead><TableHead className="text-center w-16">מספר</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {interactionStats.topStarred.map((item, i) => (
                          <TableRow key={i}><TableCell className="text-sm">{item.title}</TableCell><TableCell className="text-center font-bold text-secondary">{item.count}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : <p className="text-sm text-muted-foreground text-center py-4">אין נתונים</p>}
                </div>

                {/* Top dismissed */}
                <div className="bg-card rounded-2xl border border-border/60 p-5">
                  <h3 className="font-bold font-display text-foreground mb-3 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-destructive" /> הכי הרבה דחיות
                  </h3>
                  {interactionStats.topDismissed.length > 0 ? (
                    <Table>
                      <TableHeader><TableRow><TableHead className="text-right">פריט</TableHead><TableHead className="text-center w-16">מספר</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {interactionStats.topDismissed.map((item, i) => (
                          <TableRow key={i}><TableCell className="text-sm">{item.title}</TableCell><TableCell className="text-center font-bold text-destructive">{item.count}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : <p className="text-sm text-muted-foreground text-center py-4">אין נתונים</p>}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== Sub-components =====

function KPICard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 p-4 text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className="text-xl font-bold font-display text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ScoreTable({ title, data, color }: { title: string; data: { category: string; avg: number }[]; color: string }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1.5">
        {data.map(d => (
          <div key={d.category} className="flex items-center gap-2">
            <span className="text-xs text-foreground w-24 truncate">{d.category}</span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div className="h-2 rounded-full" style={{ width: `${Math.min((d.avg / 5) * 100, 100)}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-bold w-8 text-left">{d.avg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopTraitsTable({ title, data, total }: { title: string; data: [string, number][]; total: number }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1">
        {data.slice(0, 5).map(([trait, count]) => (
          <div key={trait} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-1.5">
            <span className="text-xs text-foreground truncate">{trait}</span>
            <span className="text-xs text-muted-foreground">{count} ({((count / total) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
