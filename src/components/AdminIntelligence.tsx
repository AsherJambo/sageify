import { useState, useEffect } from 'react';
import { cloudClient } from '@/lib/cloudClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Users, Target, Sparkles } from 'lucide-react';

interface AdminIntelligenceProps {
  adminPassword: string;
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
}

const COLORS = ['hsl(158, 64%, 40%)', 'hsl(260, 60%, 60%)', 'hsl(var(--muted-foreground))'];

const AdminIntelligence = ({ adminPassword }: AdminIntelligenceProps) => {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

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
      setError('לא הצלחנו לטעון את הנתונים');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <Sparkles className="w-12 h-12 mx-auto text-secondary mb-3" />
          <p className="text-muted-foreground">טוען ניתוח נתונים...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-3" />
        <p className="text-muted-foreground">{error || 'שגיאה בטעינה'}</p>
        <Button onClick={loadAnalytics} variant="outline" className="mt-4">נסה שוב</Button>
      </div>
    );
  }

  // Prepare feedback chart data
  const feedbackData = Object.entries(data.feedbackByOpportunity)
    .map(([id, fb]) => {
      const opp = data.opportunities.find(o => o.id === id);
      return {
        name: opp?.title?.slice(0, 20) || id.slice(0, 8),
        accurate: fb.accurate,
        interesting: fb.interesting,
        notRelevant: fb.not_relevant,
        total: fb.accurate + fb.interesting + fb.not_relevant,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Category distribution
  const categoryDist = data.opportunities.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryDist).map(([name, value]) => ({
    name: name === 'volunteer' ? 'התנדבות' : name === 'work' ? 'עבודה' : name === 'freelance' ? 'פרילנס' : name === 'course' ? 'קורס' : name,
    value,
  }));

  // Gap analysis - find trait combos with no opportunities
  const allVIA = ['אנושיות', 'חכמה וידע', 'אומץ לב', 'חוש צדק', 'מתינות וריסון', 'מיקוד בטוב/נשגבות'];
  const allSchein = ['מומחיות', 'ניהול', 'אוטונומיה', 'בטחון ויציבות', 'יצירתיות יזמית', 'שליחות', 'אתגר', 'סגנון חיים'];
  const gaps: string[] = [];
  allVIA.forEach(via => {
    allSchein.forEach(schein => {
      const key = `${via}|${schein}`;
      if (!data.traitCoverage[key] || data.traitCoverage[key].length === 0) {
        gaps.push(`${via} + ${schein}`);
      }
    });
  });

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-secondary" />
            <span className="text-sm text-muted-foreground">משתמשים שהשלימו</span>
          </div>
          <p className="text-3xl font-bold font-display text-foreground">{data.totalResponses}</p>
        </div>
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
      </div>

      {/* Learning Loop - Feedback Analysis */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          לולאת הלמידה – הצלחת ההמלצות
        </h3>
        {feedbackData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={feedbackData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number, name: string) => [value, name === 'accurate' ? 'מדויק' : name === 'interesting' ? 'מעניין' : 'לא רלוונטי']}
                contentStyle={{ direction: 'rtl', textAlign: 'right' }}
              />
              <Bar dataKey="accurate" stackId="a" fill="hsl(158, 64%, 40%)" name="מדויק" />
              <Bar dataKey="interesting" stackId="a" fill="hsl(260, 60%, 60%)" name="מעניין" />
              <Bar dataKey="notRelevant" stackId="a" fill="hsl(var(--muted-foreground))" name="לא רלוונטי" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-8">עדיין אין מספיק משובים לניתוח</p>
        )}
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-4">התפלגות סוגי הזדמנויות</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gap Analysis */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            ניתוח פערים – שילובים חסרים
          </h3>
          {gaps.length === 0 ? (
            <p className="text-secondary font-medium">מעולה! יש כיסוי לכל השילובים 🎉</p>
          ) : (
            <div className="max-h-[180px] overflow-y-auto space-y-2">
              {gaps.slice(0, 10).map((gap, i) => (
                <div key={i} className="text-sm bg-destructive/5 text-destructive px-3 py-2 rounded-xl">
                  חסרה הזדמנות עבור: <span className="font-medium">{gap}</span>
                </div>
              ))}
              {gaps.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">ועוד {gaps.length - 10} שילובים...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All Opportunities Table */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold font-display mb-4">כל ההזדמנויות במאגר</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-right font-semibold">כותרת</th>
                <th className="p-2 text-right font-semibold">ארגון</th>
                <th className="p-2 text-right font-semibold">סוג</th>
                <th className="p-2 text-right font-semibold">VIA מתאים</th>
                <th className="p-2 text-right font-semibold">שיין מתאים</th>
              </tr>
            </thead>
            <tbody>
              {data.opportunities.map((opp) => (
                <tr key={opp.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-2 font-medium">{opp.title}</td>
                  <td className="p-2 text-muted-foreground">{opp.organization_name}</td>
                  <td className="p-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      opp.category === 'volunteer' ? 'bg-secondary/15 text-secondary' :
                      opp.category === 'work' ? 'bg-primary/15 text-primary' :
                      opp.category === 'freelance' ? 'bg-accent/15 text-accent-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {opp.category === 'volunteer' ? 'התנדבות' : opp.category === 'work' ? 'עבודה' : opp.category === 'freelance' ? 'פרילנס' : 'קורס'}
                    </span>
                  </td>
                  <td className="p-2 text-xs">{opp.target_traits?.via_top || '—'}</td>
                  <td className="p-2 text-xs">{opp.target_traits?.schein_top || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminIntelligence;
