import { useState, useEffect, useMemo } from 'react';
import { getInteractionStats } from '@/lib/interactionTracker';
import { cloudClient } from '@/lib/cloudClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Users, Target, Database, Star, ThumbsDown, Activity } from 'lucide-react';

const COLORS = ['hsl(158, 64%, 40%)', 'hsl(260, 60%, 60%)', 'hsl(210, 45%, 35%)', 'hsl(35, 80%, 55%)', 'hsl(340, 65%, 50%)', 'hsl(180, 50%, 40%)'];

const TYPE_LABELS: Record<string, string> = {
  dismiss: 'דחייה',
  star: 'שמירה',
  click: 'לחיצה',
  view: 'צפייה',
  explore: 'חקירה',
  reject: 'דחייה',
  save: 'שמירה',
  complete_phase: 'השלמת שלב',
};

const TARGET_LABELS: Record<string, string> = {
  opportunity: 'הזדמנות',
  career_path: 'נתיב קריירה',
  activity: 'פעילות',
  course: 'קורס',
  roadmap_task: 'משימת מפת דרכים',
  phase: 'שלב',
};

export default function AdminDataAsset() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getInteractionStats>> | null>(null);
  const [insightCount, setInsightCount] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [interactionData, { count: ic }, { count: tc }] = await Promise.all([
        getInteractionStats(),
        cloudClient.from('global_retiree_insights').select('id', { count: 'exact', head: true }),
        cloudClient.from('questionnaire_tokens').select('id', { count: 'exact', head: true }),
      ]);
      setStats(interactionData);
      setInsightCount(ic || 0);
      setTokenCount(tc || 0);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const typeData = Object.entries(stats.byType).map(([type, count]) => ({
    name: TYPE_LABELS[type] || type,
    value: count,
  }));

  const targetData = Object.entries(stats.byTarget).map(([type, count]) => ({
    name: TARGET_LABELS[type] || type,
    value: count,
  }));

  const trendData = stats.recentTrends;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Investor headline */}
      <div className="bg-card rounded-3xl border border-secondary/20 p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground tracking-wide">Sageify Data Asset</h2>
            <p className="text-muted-foreground text-sm mt-1">
              נכס דאטה ייחודי המתעד את הפסיכולוגיה של הפורש הישראלי — כל בחירה, דחייה והעדפה מתועדים ומנותחים.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border/60 p-5 text-center">
          <Users className="w-5 h-5 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold font-display text-foreground">{tokenCount}</p>
          <p className="text-xs text-muted-foreground">פרופילים פסיכומטריים</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5 text-center">
          <Activity className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold font-display text-foreground">{stats.totalInteractions}</p>
          <p className="text-xs text-muted-foreground">אינטראקציות מתועדות</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5 text-center">
          <Star className="w-5 h-5 text-gold mx-auto mb-2" />
          <p className="text-2xl font-bold font-display text-foreground">{(stats.starRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">שיעור שמירה</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5 text-center">
          <ThumbsDown className="w-5 h-5 text-destructive mx-auto mb-2" />
          <p className="text-2xl font-bold font-display text-foreground">{(stats.dismissalRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">שיעור דחייה</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interaction types */}
        <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-bold font-display text-foreground mb-4">סוגי אינטראקציה</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">אין נתונים עדיין</p>
          )}
        </div>

        {/* Target types */}
        <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-bold font-display text-foreground mb-4">יעדי אינטראקציה</h3>
          {targetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={targetData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(158, 64%, 40%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">אין נתונים עדיין</p>
          )}
        </div>
      </div>

      {/* Trends */}
      {trendData.length > 0 && (
        <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-bold font-display text-foreground mb-4">מגמת אינטראקציות (30 ימים)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="hsl(158, 64%, 40%)" fill="hsl(158, 64%, 40%)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top starred & dismissed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-bold font-display text-foreground mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-gold" />
            הכי הרבה שמירות
          </h3>
          {stats.topStarred.length > 0 ? (
            <div className="space-y-2">
              {stats.topStarred.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-muted/20 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-foreground truncate">{item.title}</span>
                  <span className="text-xs font-bold text-secondary">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">אין נתונים עדיין</p>
          )}
        </div>

        <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-bold font-display text-foreground mb-4 flex items-center gap-2">
            <ThumbsDown className="w-4 h-4 text-destructive" />
            הכי הרבה דחיות
          </h3>
          {stats.topDismissed.length > 0 ? (
            <div className="space-y-2">
              {stats.topDismissed.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-muted/20 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-foreground truncate">{item.title}</span>
                  <span className="text-xs font-bold text-destructive">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">אין נתונים עדיין</p>
          )}
        </div>
      </div>

      {/* Data asset value */}
      <div className="bg-card rounded-3xl border border-secondary/20 p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-bold font-display text-foreground mb-3">ערך נכס הדאטה</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-secondary">{insightCount}</p>
            <p className="text-xs text-muted-foreground">פרופילים מנותחים</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{stats.totalInteractions}</p>
            <p className="text-xs text-muted-foreground">נקודות מגע</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{insightCount + stats.totalInteractions}</p>
            <p className="text-xs text-muted-foreground">סה"כ רשומות דאטה</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          כל אינטראקציה — בחירה, דחייה, שמירה — מחזקת את אלגוריתם ההתאמה שלנו ובונה את נכס הדאטה הייחודי
        </p>
      </div>
    </div>
  );
}
