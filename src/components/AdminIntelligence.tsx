import { useState, useEffect, useMemo } from 'react';
import { cloudClient } from '@/lib/cloudClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Users, Target, Sparkles, Brain, Heart, Compass } from 'lucide-react';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import { skills } from '@/data/skillsData';
import { calculateCategoryScores, getTopCategories, type Answers } from '@/lib/scoring';

interface TokenRow {
  id: string;
  username: string;
  completed_at: string | null;
  used: boolean;
  questionnaire_responses?: { response_data: Record<string, unknown> } | { response_data: Record<string, unknown> }[] | null;
}

interface AdminIntelligenceProps {
  adminPassword: string;
  tokens: TokenRow[];
}

interface Analytics {
  totalResponses: number;
  totalOpportunities: number;
  totalFeedback: number;
  feedbackByOpportunity: Record<string, { accurate: number; interesting: number; not_relevant: number }>;
  opportunities: Array<{
    id: string;
    title: string;
    organization_name: string;
    category: string;
    target_traits: { via_top?: string; schein_top?: string };
  }>;
  traitCoverage: Record<string, string[]>;
  activityChoices?: {
    total: number;
    byType: [string, number][];
    topActivities: [string, number][];
    topReasons: [string, number][];
    byPsychProfile: Array<{ profile: string; activities: string[]; count: number }>;
  };
}

const COLORS = ['hsl(158, 64%, 40%)', 'hsl(260, 60%, 60%)', 'hsl(210, 45%, 35%)', 'hsl(35, 80%, 55%)', 'hsl(340, 65%, 50%)', 'hsl(180, 50%, 40%)'];

const AdminIntelligence = ({ adminPassword, tokens }: AdminIntelligenceProps) => {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: err } = await cloudClient.functions.invoke('smart-match', {
        headers: { 'x-admin-password': adminPassword },
        body: { action: 'admin-analytics' },
      });
      if (err) throw new Error(err.message);
      setData(result);
    } catch (e) {
      console.error('Analytics error:', e);
      setError('לא הצלחנו לטעון נתוני הזדמנויות');
    } finally {
      setLoading(false);
    }
  };

  // ========== POPULATION-LEVEL PSYCHOLOGY FROM TOKENS ==========
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
    const skillBurnoutCount: Record<string, number> = {};
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

      // VIA
      if (viaAnswers) {
        const scores = calculateCategoryScores(viaAnswers, viaQuestions, viaCategories);
        Object.entries(scores).forEach(([cat, score]) => {
          if (score > 0) { viaAgg[cat].total += score; viaAgg[cat].count++; }
        });
        const top = getTopCategories(scores, 1)[0];
        if (top) topVIACount[top.category] = (topVIACount[top.category] || 0) + 1;
      }

      // Schein
      if (scheinAnswers) {
        const scores = calculateCategoryScores(scheinAnswers, scheinQuestions, scheinCategories);
        Object.entries(scores).forEach(([cat, score]) => {
          if (score > 0) { scheinAgg[cat].total += score; scheinAgg[cat].count++; }
        });
        const top = getTopCategories(scores, 1)[0];
        if (top) topScheinCount[top.category] = (topScheinCount[top.category] || 0) + 1;
      }

      // Holland
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
          hollandAgg[cat].total += score;
          hollandAgg[cat].count++;
        });
        const topH = Object.entries(hScores).sort(([, a], [, b]) => b - a)[0];
        if (topH) topHollandCount[topH[0]] = (topHollandCount[topH[0]] || 0) + 1;
      }

      // Dream
      const prefs = raw.preferencesData as { dream?: string } | undefined;
      if (prefs?.dream) dreamCount[prefs.dream] = (dreamCount[prefs.dream] || 0) + 1;

      // Skills
      const sa = raw.skillsAssignments as Record<string, string> | undefined;
      if (sa) {
        Object.entries(sa).forEach(([id, col]) => {
          const skill = skills.find(s => s.id === Number(id))?.text || id;
          if (col === 'winner') skillWinnerCount[skill] = (skillWinnerCount[skill] || 0) + 1;
          if (col === 'burnout') skillBurnoutCount[skill] = (skillBurnoutCount[skill] || 0) + 1;
        });
      }
    });

    // Compute averages
    const viaAvg = Object.entries(viaAgg).map(([cat, { total, count }]) => ({
      category: cat, avg: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
    })).sort((a, b) => b.avg - a.avg);

    const scheinAvg = Object.entries(scheinAgg).map(([cat, { total, count }]) => ({
      category: cat, avg: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
    })).sort((a, b) => b.avg - a.avg);

    const hollandAvg = Object.entries(hollandAgg).map(([cat, { total, count }]) => ({
      category: cat, avg: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
    })).sort((a, b) => b.avg - a.avg);

    const sortedDreams = Object.entries(dreamCount).sort(([, a], [, b]) => b - a);
    const sortedWinnerSkills = Object.entries(skillWinnerCount).sort(([, a], [, b]) => b - a).slice(0, 8);
    const sortedBurnoutSkills = Object.entries(skillBurnoutCount).sort(([, a], [, b]) => b - a).slice(0, 5);

    return {
      totalProfiles,
      viaAvg, scheinAvg, hollandAvg,
      topVIACount: Object.entries(topVIACount).sort(([, a], [, b]) => b - a),
      topScheinCount: Object.entries(topScheinCount).sort(([, a], [, b]) => b - a),
      topHollandCount: Object.entries(topHollandCount).sort(([, a], [, b]) => b - a),
      dreams: sortedDreams,
      winnerSkills: sortedWinnerSkills,
      burnoutSkills: sortedBurnoutSkills,
    };
  }, [tokens]);

  // ========== RENDER ==========

  // Radar data for VIA
  const viaRadarData = populationInsights?.viaAvg.map(v => ({
    subject: v.category.replace('מיקוד בטוב/נשגבות', 'מיקוד בטוב'), value: v.avg, fullMark: 5,
  })) || [];

  const hollandRadarData = populationInsights?.hollandAvg.map(v => ({
    subject: v.category.replace(/\s*\([A-Z]\)/, ''), value: v.avg, fullMark: 11,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Data Asset Value Banner */}
      <div className="bg-gradient-to-l from-primary/5 via-secondary/5 to-primary/5 rounded-2xl border border-secondary/20 p-6">
        <div className="flex items-start gap-4">
          <Brain className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold font-display text-foreground tracking-wide mb-1">
              🧬 ה-DNA הפסיכולוגי של הפורש הישראלי
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              נכס דאטה ייחודי — מאגר המידע הראשון והעדכני ביותר בישראל על חוזקות אופי, עוגנים תעסוקתיים, נטיות מקצועיות וחלומות של פורשים ובני הגיל השלישי.
              ערך עצום לחוקרים, מעסיקים, ארגוני התנדבות ומעצבי מדיניות.
            </p>
            {populationInsights && (
              <p className="text-xs text-secondary mt-2 font-medium">
                📊 מבוסס על {populationInsights.totalProfiles} פרופילים פסיכולוגיים מלאים · {viaCategories.length + scheinCategories.length + hollandCategories.length} ממדים פסיכומטריים
              </p>
            )}
          </div>
        </div>
      </div>

      {!populationInsights ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>עדיין אין פרופילים מלאים לניתוח. הנתונים יופיעו כאן אחרי שמשתמשים ישלימו את השאלונים.</p>
        </div>
      ) : (
        <>
          {/* VIA Character Strengths — Population Average */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-bold font-display mb-1 flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" />
                חוזקות אופי — ממוצע אוכלוסייה
              </h3>
              <p className="text-xs text-muted-foreground mb-4">ציון ממוצע 1-5 על פני {populationInsights.totalProfiles} פרופילים</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={viaRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar name="ממוצע" dataKey="value" stroke="hsl(158, 64%, 40%)" fill="hsl(158, 64%, 40%)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-bold font-display mb-1 flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                נטיות הולנד — ממוצע אוכלוסייה
              </h3>
              <p className="text-xs text-muted-foreground mb-4">מתוך 11 פעילויות לכל קטגוריה</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={hollandRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 11]} tick={{ fontSize: 10 }} />
                  <Radar name="ממוצע" dataKey="value" stroke="hsl(210, 45%, 35%)" fill="hsl(210, 45%, 35%)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Schein Anchors Bar Chart */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold font-display mb-1">⚓ עוגנים תעסוקתיים — ממוצע אוכלוסייה</h3>
            <p className="text-xs text-muted-foreground mb-4">ציון ממוצע 1-7 · מהעוגן השולט ביותר לחלש ביותר</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={populationInsights.scheinAvg} layout="vertical">
                <XAxis type="number" domain={[0, 7]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" width={130} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [v.toFixed(1), 'ממוצע']} contentStyle={{ direction: 'rtl' }} />
                <Bar dataKey="avg" fill="hsl(210, 45%, 35%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Who is #1 — Distribution of dominant traits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h4 className="font-bold font-display text-sm mb-3">🏆 חוזקה #1 הנפוצה ביותר</h4>
              <div className="space-y-2">
                {populationInsights.topVIACount.map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-secondary/30" style={{ width: `${(count / populationInsights.totalProfiles) * 100}px` }}>
                        <div className="h-full rounded-full bg-secondary" style={{ width: '100%' }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{Math.round((count / populationInsights.totalProfiles) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h4 className="font-bold font-display text-sm mb-3">⚓ עוגן #1 הנפוץ ביותר</h4>
              <div className="space-y-2">
                {populationInsights.topScheinCount.map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary/30" style={{ width: `${(count / populationInsights.totalProfiles) * 100}px` }}>
                        <div className="h-full rounded-full bg-primary" style={{ width: '100%' }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{Math.round((count / populationInsights.totalProfiles) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h4 className="font-bold font-display text-sm mb-3">🧭 נטייה #1 הנפוצה ביותר</h4>
              <div className="space-y-2">
                {populationInsights.topHollandCount.map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-secondary/30" style={{ width: `${(count / populationInsights.totalProfiles) * 100}px` }}>
                        <div className="h-full rounded-full bg-secondary" style={{ width: '100%' }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{Math.round((count / populationInsights.totalProfiles) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dreams & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {populationInsights.dreams.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold font-display mb-4">💭 חלומות המגירה של הפורשים</h3>
                <div className="space-y-3">
                  {populationInsights.dreams.map(([dream, count]) => (
                    <div key={dream} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-medium text-foreground">{dream}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-bold">
                        {count} ({Math.round((count / populationInsights.totalProfiles) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-bold font-display mb-4">🏆 כישורים מובילים vs 🔥 שחיקה</h3>
              <div className="space-y-2 mb-4">
                <p className="text-xs font-bold text-secondary">כישורים חזקים (Winner):</p>
                {populationInsights.winnerSkills.map(([skill, count]) => (
                  <div key={skill} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate max-w-[240px]">{skill}</span>
                    <span className="text-xs text-muted-foreground font-mono">{count}×</span>
                  </div>
                ))}
              </div>
              {populationInsights.burnoutSkills.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <p className="text-xs font-bold text-destructive">כישורי שחיקה (להימנע):</p>
                  {populationInsights.burnoutSkills.map(([skill, count]) => (
                    <div key={skill} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate max-w-[240px]">{skill}</span>
                      <span className="text-xs text-muted-foreground font-mono">{count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Opportunities Intelligence (from smart-match) */}
      <div className="border-t border-border pt-8">
        <h2 className="text-xl font-bold font-display text-foreground tracking-wide mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          מודיעין הזדמנויות ומשובים
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Sparkles className="w-12 h-12 mx-auto text-secondary mb-3" />
              <p className="text-muted-foreground">טוען נתוני הזדמנויות...</p>
            </div>
          </div>
        ) : error || !data ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{error || 'לא נטענו נתוני הזדמנויות'}</p>
            <Button onClick={loadAnalytics} variant="outline" size="sm" className="mt-3">נסה שוב</Button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">הזדמנויות במאגר</span>
                </div>
                <p className="text-3xl font-bold font-display text-foreground">{data.totalOpportunities}</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">משובים שנאספו</span>
                </div>
                <p className="text-3xl font-bold font-display text-foreground">{data.totalFeedback}</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">שילובי VIA×שיין מכוסים</span>
                </div>
                <p className="text-3xl font-bold font-display text-foreground">
                  {Object.values(data.traitCoverage).filter(v => v.length > 0).length} / {viaCategories.length * scheinCategories.length}
                </p>
              </div>
            </div>

            {/* Feedback + Category + Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Learning Loop */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  לולאת למידה — הצלחת ההמלצות
                </h3>
                {Object.keys(data.feedbackByOpportunity).length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={Object.entries(data.feedbackByOpportunity)
                        .map(([id, fb]) => ({
                          name: data.opportunities.find(o => o.id === id)?.title?.slice(0, 18) || id.slice(0, 8),
                          accurate: fb.accurate, interesting: fb.interesting, notRelevant: fb.not_relevant,
                        }))
                        .sort((a, b) => (b.accurate + b.interesting) - (a.accurate + a.interesting))
                        .slice(0, 6)}
                      layout="vertical"
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number, name: string) => [v, name === 'accurate' ? 'מדויק' : name === 'interesting' ? 'מעניין' : 'לא רלוונטי']} contentStyle={{ direction: 'rtl' }} />
                      <Bar dataKey="accurate" stackId="a" fill="hsl(158, 64%, 40%)" />
                      <Bar dataKey="interesting" stackId="a" fill="hsl(260, 60%, 60%)" />
                      <Bar dataKey="notRelevant" stackId="a" fill="hsl(var(--muted-foreground))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm">עדיין אין משובים</p>
                )}
              </div>

              {/* Gap Analysis */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  ניתוח פערים — שילובים חסרים
                </h3>
                {(() => {
                  const gaps: string[] = [];
                  viaCategories.forEach(via => {
                    scheinCategories.forEach(schein => {
                      const key = `${via}|${schein}`;
                      if (!data.traitCoverage[key] || data.traitCoverage[key].length === 0) {
                        gaps.push(`${via} + ${schein}`);
                      }
                    });
                  });
                  return gaps.length === 0 ? (
                    <p className="text-secondary font-medium">מעולה! יש כיסוי לכל השילובים 🎉</p>
                  ) : (
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {gaps.slice(0, 10).map((gap, i) => (
                        <div key={i} className="text-sm bg-destructive/5 text-destructive px-3 py-2 rounded-xl">
                          חסרה הזדמנות: <span className="font-medium">{gap}</span>
                        </div>
                      ))}
                      {gaps.length > 10 && <p className="text-xs text-muted-foreground text-center">ועוד {gaps.length - 10} שילובים...</p>}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-bold font-display mb-4">התפלגות סוגי הזדמנויות</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.opportunities.reduce((acc, o) => { acc[o.category] = (acc[o.category] || 0) + 1; return acc; }, {} as Record<string, number>))
                      .map(([name, value]) => ({ name: name === 'volunteer' ? 'התנדבות' : name === 'work' ? 'עבודה' : name === 'freelance' ? 'פרילנס' : name === 'course' ? 'קורס' : name, value }))}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {Object.keys(data.opportunities.reduce((acc, o) => { acc[o.category] = 1; return acc; }, {} as Record<string, number>)).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* === ACTIVITY CHOICES DATA ASSET === */}
            {data.activityChoices && data.activityChoices.total > 0 && (
              <div className="border-t border-border pt-8 mt-8">
                <h2 className="text-xl font-bold font-display text-foreground tracking-wide mb-2 flex items-center gap-2">
                  🎯 מאגר בחירות פעילות — מה פורשים בוחרים ולמה
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {data.activityChoices.total} בחירות מתועדות · נכס דאטה ייחודי על תהליכי קבלת החלטות של פורשים
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Activity Types */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-bold font-display mb-4">📊 סוגי פעילויות שנבחרו</h3>
                    <div className="space-y-3">
                      {data.activityChoices.byType.map(([type, count]) => {
                        const label = type === 'volunteer' ? '🤝 התנדבות' : type === 'work' ? '💼 עבודה' : type === 'course' ? '📚 קורס/לימודים' : type === 'freelance' ? '🚀 פרילנס' : `📌 ${type}`;
                        const pct = Math.round((count / data.activityChoices!.total) * 100);
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{label}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground font-mono w-16 text-left">{count} ({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Reasons */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-bold font-display mb-4">💡 הסיבות המובילות לבחירת פעילות</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {data.activityChoices.topReasons.map(([reason, count], i) => (
                        <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-xl px-4 py-2.5">
                          <span className="text-xs font-bold text-secondary mt-0.5">{i + 1}.</span>
                          <span className="text-sm text-foreground flex-1">{reason}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">{count}×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Activities */}
                <div className="bg-card rounded-2xl border border-border p-6 mt-6">
                  <h3 className="text-lg font-bold font-display mb-4">🏆 הפעילויות הנבחרות ביותר</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.activityChoices.topActivities.map(([name, count], i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/20 rounded-xl px-4 py-3 border border-border/50">
                        <span className="text-lg font-bold text-secondary font-mono">{count}</span>
                        <span className="text-sm font-medium text-foreground truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity by Psychological Profile */}
                {data.activityChoices.byPsychProfile.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6 mt-6">
                    <h3 className="text-lg font-bold font-display mb-2">🧬 בחירות לפי פרופיל פסיכולוגי</h3>
                    <p className="text-xs text-muted-foreground mb-4">שילוב VIA × שיין → מה אנשים עם הפרופיל הזה בחרו</p>
                    <div className="space-y-3">
                      {data.activityChoices.byPsychProfile.map((item, i) => {
                        const [via, schein] = item.profile.split('|');
                        return (
                          <div key={i} className="bg-muted/20 rounded-xl p-4 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium">{via}</span>
                              <span className="text-xs text-muted-foreground">×</span>
                              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{schein}</span>
                              <span className="text-xs text-muted-foreground mr-auto">{item.count} בחירות</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.activities.slice(0, 5).map((act, j) => (
                                <span key={j} className="text-xs bg-card border border-border rounded-lg px-2.5 py-1 text-foreground">{act}</span>
                              ))}
                              {item.activities.length > 5 && (
                                <span className="text-xs text-muted-foreground">+{item.activities.length - 5}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminIntelligence;
