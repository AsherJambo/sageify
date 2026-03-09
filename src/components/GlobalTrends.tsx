import { useState, useEffect, useMemo } from 'react';
import { cloudClient } from '@/lib/cloudClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';

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
  preferences: Record<string, string[]>;
  skills_winner: string[];
  dream: string;
  created_at: string;
}

interface TokenRow {
  id: string;
  username: string;
  completed_at: string | null;
  questionnaire_responses?: { response_data: Record<string, unknown> } | { response_data: Record<string, unknown> }[] | null;
}

const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

export default function GlobalTrends({ tokens }: { tokens: TokenRow[] }) {
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await cloudClient.from('global_retiree_insights').select('*').order('created_at', { ascending: false });
      if (data) setInsights(data as unknown as InsightRow[]);
      setLoading(false);
    })();
  }, []);

  const personaCounts = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach(i => { map[i.user_persona] = (map[i.user_persona] || 0) + 1; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }));
  }, [insights]);

  const motivationHeatmap = useMemo(() => {
    const motivations: Record<string, Record<string, number>> = {};
    insights.forEach(i => {
      const viaCategories = (i.via_top || []).map(v => v.category);
      const scheinCategories = (i.schein_top || []).map(s => s.category);
      const allMotivations = [...viaCategories, ...scheinCategories];
      const activity = i.activity_suggested?.substring(0, 50) || i.dream || 'לא ידוע';
      allMotivations.forEach(m => {
        if (!motivations[m]) motivations[m] = {};
        motivations[m][activity] = (motivations[m][activity] || 0) + 1;
      });
    });
    return motivations;
  }, [insights]);

  const topMotivations = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach(i => {
      (i.via_top || []).forEach(v => { map[v.category] = (map[v.category] || 0) + 1; });
      (i.schein_top || []).forEach(s => { map[s.category] = (map[s.category] || 0) + 1; });
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a).map(([name, count]) => ({ name, count }));
  }, [insights]);

  const dreamCounts = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach(i => { if (i.dream) map[i.dream] = (map[i.dream] || 0) + 1; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [insights]);

  const constraintCounts = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach(i => {
      (i.constraints || '').split(',').map(c => c.trim()).filter(Boolean).forEach(c => {
        map[c] = (map[c] || 0) + 1;
      });
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 8).map(([name, count]) => ({ name, count }));
  }, [insights]);

  // Professional background correlation from tokens
  const backgroundCorrelation = useMemo(() => {
    const correlations: { persona: string; skill: string; count: number }[] = [];
    const map: Record<string, Record<string, number>> = {};
    insights.forEach(i => {
      const persona = i.user_persona;
      (i.skills_winner || []).forEach((skill: string) => {
        if (!map[persona]) map[persona] = {};
        map[persona][skill] = (map[persona][skill] || 0) + 1;
      });
    });
    Object.entries(map).forEach(([persona, skills]) => {
      Object.entries(skills).sort(([, a], [, b]) => b - a).slice(0, 3).forEach(([skill, count]) => {
        correlations.push({ persona, skill, count });
      });
    });
    return correlations;
  }, [insights]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (insights.length === 0) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">אין עדיין נתוני תובנות</p>
        <p className="text-sm mt-2">הנתונים ייאספו אוטומטית כאשר משתמשים ישלימו את תהליך הייעוץ</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Users className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">{insights.length}</div>
          <div className="text-xs text-muted-foreground">תובנות נאספו</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Target className="w-6 h-6 mx-auto text-accent mb-2" />
          <div className="text-2xl font-bold text-foreground">{personaCounts.length}</div>
          <div className="text-xs text-muted-foreground">פרסונות ייחודיות</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-2" />
          <div className="text-2xl font-bold text-foreground">{dreamCounts.length}</div>
          <div className="text-xs text-muted-foreground">חלומות שונים</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <AlertTriangle className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-foreground">{constraintCounts.length}</div>
          <div className="text-xs text-muted-foreground">סוגי מגבלות</div>
        </div>
      </div>

      {/* Motivation Heatmap */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          מניעים פופולריים vs פעילויות מומלצות
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-right font-semibold text-muted-foreground">מניע</th>
                <th className="p-2 text-right font-semibold text-muted-foreground">כמות</th>
                <th className="p-2 text-right font-semibold text-muted-foreground">פעילויות נפוצות</th>
              </tr>
            </thead>
            <tbody>
              {topMotivations.slice(0, 10).map((m, idx) => {
                const activities = motivationHeatmap[m.name] || {};
                const topActivities = Object.entries(activities).sort(([, a], [, b]) => b - a).slice(0, 3);
                return (
                  <tr key={m.name} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-2 font-medium">{m.name}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full" style={{ width: `${Math.min((m.count / topMotivations[0].count) * 100, 100)}%`, backgroundColor: COLORS[idx % COLORS.length], minWidth: 8 }} />
                        <span className="text-xs text-muted-foreground">{m.count}</span>
                      </div>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {topActivities.map(([act, cnt]) => `${act.substring(0, 30)} (${cnt})`).join(' • ') || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persona Distribution & Dreams */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">התפלגות פרסונות</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={personaCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {personaCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">חלומות פופולריים</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dreamCounts} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {dreamCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Professional Background Correlation */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          קורלציה: רקע מקצועי (כישורים מנצחים) × פרסונה
        </h3>
        {backgroundCorrelation.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              backgroundCorrelation.reduce((acc, { persona, skill, count }) => {
                if (!acc[persona]) acc[persona] = [];
                acc[persona].push({ skill, count });
                return acc;
              }, {} as Record<string, { skill: string; count: number }[]>)
            ).map(([persona, skills], idx) => (
              <div key={persona} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-semibold text-sm text-foreground">{persona}</span>
                </div>
                <ul className="space-y-1">
                  {skills.map(s => (
                    <li key={s.skill} className="text-xs text-muted-foreground flex justify-between">
                      <span>{s.skill}</span>
                      <span className="font-medium text-foreground">{s.count}×</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">אין מספיק נתונים עדיין</p>
        )}
      </div>

      {/* Constraints */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          מגבלות נפוצות
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={constraintCounts}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
