import { useState, useEffect, useMemo } from 'react';
import { cloudClient } from '@/lib/cloudClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ScatterChart, Scatter, ZAxis, Legend } from 'recharts';
import { AlertTriangle, Zap, Globe, Target, TrendingUp } from 'lucide-react';

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
  created_at: string;
}

const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

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

  // Gap Hunter: users with gap_detected or high scarcity
  const gapData = useMemo(() => {
    const gaps: { persona: string; need: string; scarcity: number; count: number }[] = [];
    const gapMap: Record<string, { need: string; scarcity: number; count: number }> = {};

    insights.forEach(i => {
      if (i.gap_detected || i.scarcity_score >= 7) {
        const key = `${i.user_persona}|${i.market_unmet_need || i.dream}`;
        if (!gapMap[key]) {
          gapMap[key] = { need: i.market_unmet_need || i.dream || 'לא מזוהה', scarcity: i.scarcity_score, count: 0 };
        }
        gapMap[key].count++;
        gapMap[key].scarcity = Math.max(gapMap[key].scarcity, i.scarcity_score);
      }
    });

    Object.entries(gapMap).forEach(([key, val]) => {
      const [persona] = key.split('|');
      gaps.push({ persona, ...val });
    });

    return gaps.sort((a, b) => b.scarcity - a.scarcity);
  }, [insights]);

  // Persona × Motivation correlation
  const personaMotivationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    insights.forEach(i => {
      const persona = i.user_persona;
      const tag = i.motivation_tag;
      if (!persona || !tag) return;
      if (!matrix[persona]) matrix[persona] = {};
      matrix[persona][tag] = (matrix[persona][tag] || 0) + 1;
    });
    return matrix;
  }, [insights]);

  // All unique motivation tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    insights.forEach(i => { if (i.motivation_tag) tags.add(i.motivation_tag); });
    return Array.from(tags);
  }, [insights]);

  // Heatmap data for persona × motivation
  const heatmapData = useMemo(() => {
    const rows: { persona: string; tag: string; count: number }[] = [];
    Object.entries(personaMotivationMatrix).forEach(([persona, tags]) => {
      Object.entries(tags).forEach(([tag, count]) => {
        rows.push({ persona, tag, count });
      });
    });
    return rows;
  }, [personaMotivationMatrix]);

  // Global Opportunity Feed - sorted by innovation
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

  // Motivation distribution
  const motivationDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach(i => {
      if (i.motivation_tag) map[i.motivation_tag] = (map[i.motivation_tag] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: MOTIVATION_LABELS[name] || name, value }));
  }, [insights]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (insights.length === 0) {
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
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <AlertTriangle className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-foreground">{gapData.length}</div>
          <div className="text-xs text-muted-foreground">פערי שוק מזוהים</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Zap className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">{allTags.length}</div>
          <div className="text-xs text-muted-foreground">סוגי מניעים פעילים</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Globe className="w-6 h-6 mx-auto text-accent mb-2" />
          <div className="text-2xl font-bold text-foreground">{opportunityFeed.length}</div>
          <div className="text-xs text-muted-foreground">הזדמנויות חיות</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {insights.filter(i => i.scarcity_score >= 7).length}
          </div>
          <div className="text-xs text-muted-foreground">הזדמנויות נדירות (7+)</div>
        </div>
      </div>

      {/* Gap Hunter */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          The Gap Hunter — צרכים שאין להם מענה
        </h3>
        {gapData.length > 0 ? (
          <div className="space-y-3">
            {gapData.map((g, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: `${COLORS[idx % COLORS.length]}20`, color: COLORS[idx % COLORS.length] }}>
                  {g.scarcity}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">{g.persona}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                      ביקוש × {g.count}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{g.need}</p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  נדירות: {g.scarcity}/10
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">לא זוהו פערי שוק משמעותיים — אפשר לעדכן scarcity scores ו-gap_detected דרך היועץ</p>
        )}
      </div>

      {/* Persona × Motivation Heatmap */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          קורלציה: פרסונה × מניע
        </h3>
        {heatmapData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-right font-semibold text-muted-foreground">פרסונה</th>
                  {allTags.map(tag => (
                    <th key={tag} className="p-2 text-center font-semibold text-muted-foreground text-xs">
                      {MOTIVATION_LABELS[tag] || tag}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(personaMotivationMatrix).map(([persona, tags], idx) => (
                  <tr key={persona} className="border-b border-border/50">
                    <td className="p-2 font-medium text-sm">{persona}</td>
                    {allTags.map(tag => {
                      const val = tags[tag] || 0;
                      const maxVal = Math.max(...Object.values(tags), 1);
                      const intensity = val / maxVal;
                      return (
                        <td key={tag} className="p-2 text-center">
                          {val > 0 && (
                            <div
                              className="mx-auto w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold"
                              style={{
                                backgroundColor: `${COLORS[idx % COLORS.length]}${Math.round(intensity * 80 + 20).toString(16).padStart(2, '0')}`,
                                color: intensity > 0.5 ? '#fff' : COLORS[idx % COLORS.length],
                              }}
                            >
                              {val}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">אין מספיק נתוני motivation_tag — הנתונים יתעדכנו כשמשתמשים ישלימו ייעוץ עם חיפוש Perplexity</p>
        )}
      </div>

      {/* Motivation Distribution */}
      {motivationDistribution.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">התפלגות מניעים</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={motivationDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {motivationDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Global Opportunity Feed */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-accent" />
          Global Opportunity Feed — ממוין לפי חדשנות
        </h3>
        {opportunityFeed.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {opportunityFeed.map((o, idx) => (
              <div key={o.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30 hover:bg-muted/40 transition">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
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
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                    נדירות {o.scarcity_score}/10
                  </span>
                )}
                {o.link && (
                  <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex-shrink-0">
                    קישור ↗
                  </a>
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
