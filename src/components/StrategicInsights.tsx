import { useState, useEffect, useMemo } from 'react';
import { cloudClient } from '@/lib/cloudClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { AlertTriangle, Zap, Globe, Target, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deriveProfessionCategory } from '@/lib/insightsSaver';

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
}

const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

const MOTIVATION_LABELS: Record<string, string> = {
  Status: 'סטטוס',
  Social_Connection: 'חיבור חברתי',
  Legacy: 'מורשת',
  Cognitive_Sharpness: 'חדות קוגניטיבית',
  Financial_Yield: 'תשואה כלכלית',
  Vitality: 'חיוניות',
};

export default function StrategicInsights() {
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [insightsRes, oppsRes] = await Promise.all([
        cloudClient.from('global_retiree_insights').select('*').order('created_at', { ascending: false }),
        cloudClient.from('opportunities').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(50),
      ]);
      if (insightsRes.data) setInsights(insightsRes.data as unknown as InsightRow[]);
      if (oppsRes.data) setOpportunities(oppsRes.data);
      setLoading(false);
    })();
  }, []);

  // Enrich profession_category on the fly if missing
  const enrichedInsights = useMemo(() => {
    return insights.map(i => ({
      ...i,
      profession_category: i.profession_category || deriveProfessionCategory((i.skills_winner || []) as string[]),
    }));
  }, [insights]);

  // ==========================================
  // GAP INDEX: GI = (Demand × Scarcity) / Supply
  // ==========================================
  const gapIndex = useMemo(() => {
    // Demand: how many users want each activity type
    const demandMap: Record<string, number> = {};
    // Scarcity: avg scarcity score per activity type
    const scarcityMap: Record<string, { total: number; count: number }> = {};
    enrichedInsights.forEach(i => {
      const actType = classifyActivityType(i.activity_suggested);
      demandMap[actType] = (demandMap[actType] || 0) + 1;
      if (!scarcityMap[actType]) scarcityMap[actType] = { total: 0, count: 0 };
      scarcityMap[actType].total += (i.scarcity_score || 1);
      scarcityMap[actType].count++;
    });

    // Supply: count of opportunities per category
    const supplyMap: Record<string, number> = {};
    opportunities.forEach(o => {
      const cat = o.category || 'other';
      supplyMap[cat] = (supplyMap[cat] || 0) + 1;
    });

    const results: { activity: string; demand: number; avgScarcity: number; supply: number; gapIndex: number }[] = [];
    const allTypes = new Set([...Object.keys(demandMap), ...Object.keys(supplyMap)]);
    allTypes.forEach(type => {
      const demand = demandMap[type] || 0;
      const avgScarcity = scarcityMap[type] ? scarcityMap[type].total / scarcityMap[type].count : 5;
      const supply = supplyMap[type] || 1; // avoid div by 0
      const gi = Math.round(((demand * avgScarcity) / supply) * 10) / 10;
      results.push({ activity: type, demand, avgScarcity: Math.round(avgScarcity * 10) / 10, supply, gapIndex: gi });
    });

    return results.sort((a, b) => b.gapIndex - a.gapIndex);
  }, [enrichedInsights, opportunities]);

  // ==========================================
  // Profession × Motivation Heatmap
  // ==========================================
  const professionMotivationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    enrichedInsights.forEach(i => {
      const prof = i.profession_category || 'כללי';
      const tag = i.motivation_tag || 'Social_Connection';
      if (!matrix[prof]) matrix[prof] = {};
      matrix[prof][tag] = (matrix[prof][tag] || 0) + 1;
    });
    return matrix;
  }, [enrichedInsights]);

  const allMotivationTags = useMemo(() => {
    const tags = new Set<string>();
    enrichedInsights.forEach(i => { if (i.motivation_tag) tags.add(i.motivation_tag); });
    // Ensure all standard tags appear
    Object.keys(MOTIVATION_LABELS).forEach(t => tags.add(t));
    return Array.from(tags);
  }, [enrichedInsights]);

  // ==========================================
  // Unmet Needs Table (top 10 gaps)
  // ==========================================
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

  // ==========================================
  // Activity Diversity Pie
  // ==========================================
  const activityDiversity = useMemo(() => {
    const map: Record<string, number> = {};
    enrichedInsights.forEach(i => {
      const type = classifyActivityType(i.activity_suggested);
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: ACTIVITY_LABELS[name] || name, value }));
  }, [enrichedInsights]);

  // ==========================================
  // CSV Export
  // ==========================================
  const exportCSV = () => {
    const headers = ['רקע מקצועי', 'פרסונה', 'פעילות מומלצת', 'מניע (Motivation)', 'ציון נדירות', 'Gap Index', 'חלום', 'מגבלות'];
    const rows = enrichedInsights.map(i => {
      const actType = classifyActivityType(i.activity_suggested);
      const gi = gapIndex.find(g => g.activity === actType)?.gapIndex || 0;
      return [
        i.profession_category,
        i.user_persona,
        i.activity_suggested,
        MOTIVATION_LABELS[i.motivation_tag] || i.motivation_tag,
        String(i.scarcity_score),
        String(gi),
        i.dream,
        i.constraints,
      ].map(v => escCSV(v));
    });

    const csv = '\uFEFF' + [headers.map(h => escCSV(h)), ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sageify-global-trends-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ==========================================
  // Global Opportunity Feed
  // ==========================================
  const opportunityFeed = useMemo(() => {
    const innovationOrder = { high: 0, medium: 1, low: 2 };
    return [...opportunities]
      .map(o => ({
        ...o,
        innovation_level: (o.target_traits as any)?.innovation_level || 'medium',
        motivation_tag: (o.target_traits as any)?.motivation_tag || '',
        scarcity_score: (o.target_traits as any)?.scarcity_score || 0,
      }))
      .sort((a, b) => (innovationOrder[a.innovation_level as keyof typeof innovationOrder] || 1) - (innovationOrder[b.innovation_level as keyof typeof innovationOrder] || 1))
      .slice(0, 20);
  }, [opportunities]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (enrichedInsights.length === 0) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">אין עדיין נתונים אסטרטגיים</p>
        <p className="text-sm mt-2">הנתונים ייאספו אוטומטית כאשר משתמשים ישלימו את תהליך הייעוץ</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <AlertTriangle className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-foreground">{gapIndex.filter(g => g.gapIndex > 5).length}</div>
          <div className="text-xs text-muted-foreground">פערי שוק קריטיים (GI&gt;5)</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Zap className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">{Object.keys(professionMotivationMatrix).length}</div>
          <div className="text-xs text-muted-foreground">קטגוריות מקצועיות</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Globe className="w-6 h-6 mx-auto text-accent mb-2" />
          <div className="text-2xl font-bold text-foreground">{activityDiversity.length}</div>
          <div className="text-xs text-muted-foreground">סוגי פעילויות</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-2" />
          <div className="text-2xl font-bold text-foreground">{unmetNeeds.length}</div>
          <div className="text-xs text-muted-foreground">צרכים ללא מענה</div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export Global Trend Report (CSV)
        </Button>
      </div>

      {/* Gap Index Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Gap Index — (Demand × Scarcity) / Supply
        </h3>
        <p className="text-xs text-muted-foreground mb-4">פעילויות עם GI גבוה = ביקוש רב + נדירות גבוהה + היצע דל</p>
        {gapIndex.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={Math.max(200, gapIndex.length * 40)}>
              <BarChart data={gapIndex} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="activity" width={130} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = { gapIndex: 'Gap Index', demand: 'ביקוש', avgScarcity: 'נדירות ממוצעת', supply: 'היצע' };
                    return [value, labels[name] || name];
                  }}
                />
                <Bar dataKey="gapIndex" radius={[0, 4, 4, 0]}>
                  {gapIndex.map((_, i) => (
                    <Cell key={i} fill={gapIndex[i].gapIndex > 5 ? '#ef4444' : gapIndex[i].gapIndex > 2 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-right font-semibold text-muted-foreground">סוג פעילות</th>
                    <th className="p-2 text-center font-semibold text-muted-foreground">ביקוש</th>
                    <th className="p-2 text-center font-semibold text-muted-foreground">נדירות ∅</th>
                    <th className="p-2 text-center font-semibold text-muted-foreground">היצע</th>
                    <th className="p-2 text-center font-semibold text-muted-foreground">GI</th>
                  </tr>
                </thead>
                <tbody>
                  {gapIndex.map((g, idx) => (
                    <tr key={g.activity} className="border-b border-border/50">
                      <td className="p-2 font-medium">{ACTIVITY_LABELS[g.activity] || g.activity}</td>
                      <td className="p-2 text-center">{g.demand}</td>
                      <td className="p-2 text-center">{g.avgScarcity}</td>
                      <td className="p-2 text-center">{g.supply}</td>
                      <td className="p-2 text-center font-bold" style={{ color: g.gapIndex > 5 ? '#ef4444' : g.gapIndex > 2 ? '#f59e0b' : '#10b981' }}>
                        {g.gapIndex}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">אין מספיק נתונים</p>
        )}
      </div>

      {/* Profession × Motivation Heatmap */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          מפת חום: רקע מקצועי × מניע
        </h3>
        <p className="text-xs text-muted-foreground mb-4">כל תא מציג את מספר הפורשים מרקע מקצועי מסוים שמחפשים מניע מסוים</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-right font-semibold text-muted-foreground">רקע מקצועי</th>
                {allMotivationTags.map(tag => (
                  <th key={tag} className="p-2 text-center font-semibold text-muted-foreground text-xs whitespace-nowrap">
                    {MOTIVATION_LABELS[tag] || tag}
                  </th>
                ))}
                <th className="p-2 text-center font-semibold text-muted-foreground">סה"כ</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(professionMotivationMatrix).map(([prof, tags], idx) => {
                const total = Object.values(tags).reduce((s, v) => s + v, 0);
                const maxVal = Math.max(...Object.values(tags), 1);
                return (
                  <tr key={prof} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-2 font-medium text-sm whitespace-nowrap">{prof}</td>
                    {allMotivationTags.map(tag => {
                      const val = tags[tag] || 0;
                      const intensity = val / maxVal;
                      return (
                        <td key={tag} className="p-2 text-center">
                          {val > 0 ? (
                            <div
                              className="mx-auto w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold"
                              style={{
                                backgroundColor: `${COLORS[idx % COLORS.length]}${Math.round(intensity * 180 + 40).toString(16).padStart(2, '0')}`,
                                color: intensity > 0.4 ? '#fff' : 'inherit',
                              }}
                            >
                              {val}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">·</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-bold text-foreground">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unmet Needs Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-destructive" />
          Top 10 — צרכים ללא מענה
        </h3>
        <p className="text-xs text-muted-foreground mb-4">פרופילים שבהם ה-AI זיהה פער בין הצורך להיצע הקיים</p>
        {unmetNeeds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-right font-semibold text-muted-foreground">פרסונה</th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">רקע</th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">מניע</th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">סיבת הפער</th>
                  <th className="p-2 text-center font-semibold text-muted-foreground">נדירות</th>
                </tr>
              </thead>
              <tbody>
                {unmetNeeds.map((n, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-2 font-medium">{n.persona}</td>
                    <td className="p-2 text-muted-foreground">{n.profession}</td>
                    <td className="p-2">{n.motivation}</td>
                    <td className="p-2 text-xs text-muted-foreground max-w-[200px] truncate">{n.gapReason}</td>
                    <td className="p-2 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        n.scarcity >= 8 ? 'bg-destructive/20 text-destructive' :
                        n.scarcity >= 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {n.scarcity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">לא זוהו פערים — ציוני scarcity מתחת ל-6 בכל הפרופילים</p>
        )}
      </div>

      {/* Activity Diversity Pie */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">פיזור סוגי פעילויות</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={activityDiversity}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {activityDiversity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Profession Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">התפלגות רקע מקצועי</h3>
          <div className="space-y-2">
            {Object.entries(professionMotivationMatrix)
              .map(([prof, tags]) => ({ prof, total: Object.values(tags).reduce((s, v) => s + v, 0) }))
              .sort((a, b) => b.total - a.total)
              .map(({ prof, total }, idx) => (
                <div key={prof} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-sm font-medium flex-1">{prof}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-muted" style={{ width: 80 }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(total / enrichedInsights.length) * 100}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-left">{total}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Global Opportunity Feed */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-accent" />
          Global Opportunity Feed — ממוין לפי חדשנות
        </h3>
        {opportunityFeed.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {opportunityFeed.map((o) => (
              <div key={o.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30 hover:bg-muted/40 transition">
                <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                  o.innovation_level === 'high' ? 'bg-green-500' :
                  o.innovation_level === 'medium' ? 'bg-yellow-500' : 'bg-muted-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{o.title}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{o.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{o.organization_name} • {o.location || 'ישראל'}</p>
                </div>
                {o.scarcity_score > 0 && (
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">נדירות {o.scarcity_score}/10</span>
                )}
                {o.link && (
                  <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex-shrink-0">קישור ↗</a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">אין הזדמנויות במאגר — השתמשו בטאב "העשרת מאגר" כדי להוסיף</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Helpers
// ==========================================

function classifyActivityType(activity: string): string {
  if (!activity) return 'other';
  const lower = activity.toLowerCase();
  const map: [string, string[]][] = [
    ['consulting', ['ייעוץ', 'יועץ', 'consulting', 'fractional']],
    ['mentoring', ['מנטור', 'חונך', 'ליווי', 'mentoring']],
    ['volunteering', ['התנדבות', 'volunteer', 'מתנדב']],
    ['entrepreneurship', ['יזמות', 'סטארטאפ', 'עסק', 'entrepreneur', 'micro']],
    ['board', ['דירקטוריון', 'ועדה', 'board']],
    ['education', ['קורס', 'לימוד', 'הדרכה', 'הרצא', 'course']],
    ['writing', ['כתיב', 'ספר', 'תיעוד', 'writing']],
    ['digital', ['דיגיטל', 'digital', 'nomad', 'מרחוק', 'אונליין']],
  ];
  for (const [type, keywords] of map) {
    if (keywords.some(kw => lower.includes(kw))) return type;
  }
  return 'other';
}

const ACTIVITY_LABELS: Record<string, string> = {
  consulting: 'ייעוץ פרקשנל',
  mentoring: 'מנטורינג',
  volunteering: 'התנדבות',
  entrepreneurship: 'יזמות',
  board: 'דירקטוריון',
  education: 'חינוך/קורסים',
  writing: 'כתיבה/מורשת',
  digital: 'דיגיטלי/מרחוק',
  other: 'אחר',
};

function escCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
