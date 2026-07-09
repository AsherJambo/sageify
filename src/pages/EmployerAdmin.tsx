import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cloudClient } from '@/lib/cloudClient';
import owlLogo from '@/assets/owl-logo.png';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Link2, BarChart3, MessageSquarePlus, Copy, Eye } from 'lucide-react';
import ResponseViewer from '@/components/ResponseViewer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateCategoryScores, getTopCategories, type Answers } from '@/lib/scoring';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';

interface OrgData {
  id: string;
  org_name: string;
  logo_url: string | null;
  custom_welcome_message: string;
}

interface TokenRow {
  id: string;
  token: string;
  username: string;
  id_number?: string | null;
  used: boolean;
  created_at: string;
  completed_at: string | null;
  organization_id: string | null;
  questionnaire_responses?: { response_data: Record<string, unknown> } | { response_data: Record<string, unknown> }[] | null;
}

const CHART_COLORS = ['hsl(160,28%,35%)', 'hsl(210,30%,45%)', 'hsl(40,45%,50%)', 'hsl(0,72%,51%)', 'hsl(280,40%,50%)', 'hsl(120,30%,40%)'];

const EmployerAdmin = () => {
  const [password, setPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenRow | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const supabase = cloudClient;

  const apiCall = async (action: string, body: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke('employer', {
      headers: { 'x-employer-password': storedPassword },
      body: { action, ...body },
    });
    if (error) throw error;
    return data ?? {};
  };

  const handleLogin = async () => {
    const pw = password.trim();
    if (!pw) { toast.error('יש להזין סיסמה'); return; }

    try {
      const { data, error } = await supabase.functions.invoke('employer', {
        headers: { 'x-employer-password': pw },
        body: { action: 'get-org' },
      });

      if (error || !data?.organization) {
        toast.error('סיסמה שגויה או ארגון לא נמצא');
        return;
      }

      const orgData = data.organization as OrgData;
      setStoredPassword(pw);
      setOrg(orgData);
      setAuthenticated(true);
      loadTokens(pw);
    } catch {
      toast.error('שגיאת תקשורת');
    }
  };

  const loadTokens = async (pw: string) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('employer', {
      headers: { 'x-employer-password': pw },
      body: { action: 'list-tokens' },
    });
    if (!error && data?.tokens) setTokens(data.tokens as unknown as TokenRow[]);
    setLoading(false);
  };

  const getLink = (tokenVal: string) => {
    const origin = window.location.origin.includes('preview') 
      ? 'https://sageify.lovable.app' 
      : window.location.origin;
    return `${origin}/#/q/${tokenVal}`;
  };

  const copyLink = (tokenVal: string) => {
    navigator.clipboard.writeText(getLink(tokenVal));
    toast.success('הקישור הועתק!');
  };

  const createInvite = async () => {
    if (!newEmployeeName.trim() || !org) return;
    setLoading(true);
    try {
      await apiCall('create-token', { username: newEmployeeName.trim() });
      toast.success('קישור נוצר בהצלחה!');
      setNewEmployeeName('');
      loadTokens(storedPassword);
    } catch {
      toast.error('שגיאה ביצירת הזמנה');
    }
    setLoading(false);
  };

  const createBulkInvites = async () => {
    if (!org) return;
    const names = bulkNames.split('\n').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    setLoading(true);
    try {
      await apiCall('create-tokens-bulk', { usernames: names });
      toast.success(`${names.length} קישורים נוצרו בהצלחה!`);
      setBulkNames('');
      loadTokens(storedPassword);
    } catch {
      toast.error('שגיאה ביצירה');
    }
    setLoading(false);
  };

  const sendFeedback = async () => {
    if (!feedbackText.trim() || !org) return;
    try {
      await apiCall('submit-feedback', { feedback_text: feedbackText.trim() });
      toast.success('המשוב נשלח בהצלחה, תודה!');
      setFeedbackText('');
      setShowFeedback(false);
    } catch {
      toast.error('שגיאה בשליחת המשוב');
    }
  };

  // Analytics
  const analytics = useMemo(() => {
    const completed = tokens.filter(t => t.completed_at);
    const total = tokens.length;
    const completedCount = completed.length;
    const inProgress = tokens.filter(t => t.used && !t.completed_at).length;
    const completionRate = total > 0 ? Math.round((completedCount / Math.max(tokens.filter(t => t.used).length, 1)) * 100) : 0;

    // Aggregate top paths from completed responses
    const pathCounts: Record<string, number> = {};
    const viaCounts: Record<string, number> = {};
    const scheinCounts: Record<string, number> = {};
    const hollandCounts: Record<string, number> = {};

    completed.forEach(t => {
      const rd = (Array.isArray(t.questionnaire_responses) 
        ? t.questionnaire_responses[0]?.response_data 
        : t.questionnaire_responses?.response_data) as Record<string, unknown> | undefined;
      if (!rd) return;

      // Dreams as paths
      const prefs = rd.preferencesData as { dream?: string } | undefined;
      if (prefs?.dream) {
        pathCounts[prefs.dream] = (pathCounts[prefs.dream] || 0) + 1;
      }

      // VIA top
      const viaAnswers = rd.finalViaAnswers || rd.viaAnswers;
      if (viaAnswers && typeof viaAnswers === 'object') {
        const scores = calculateCategoryScores(viaAnswers as Answers, viaQuestions, viaCategories);
        const top = getTopCategories(scores, 1);
        top.forEach(t => { viaCounts[t.category] = (viaCounts[t.category] || 0) + 1; });
      }

      // Schein top
      const scheinAnswers = rd.finalScheinAnswers || rd.scheinAnswers;
      if (scheinAnswers && typeof scheinAnswers === 'object') {
        const scores = calculateCategoryScores(scheinAnswers as Answers, scheinQuestions, scheinCategories);
        const top = getTopCategories(scores, 1);
        top.forEach(t => { scheinCounts[t.category] = (scheinCounts[t.category] || 0) + 1; });
      }

      // Holland top
      const hollandAnswers = rd.hollandAnswers;
      if (hollandAnswers && typeof hollandAnswers === 'object') {
        const scores = calculateCategoryScores(hollandAnswers as Answers, hollandQuestions, hollandCategories);
        const top = getTopCategories(scores, 1);
        top.forEach(t => { hollandCounts[t.category] = (hollandCounts[t.category] || 0) + 1; });
      }
    });

    const topPaths = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topVia = Object.entries(viaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topSchein = Object.entries(scheinCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topHolland = Object.entries(hollandCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { total, completedCount, inProgress, completionRate, topPaths, topVia, topSchein, topHolland };
  }, [tokens]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[hsl(220,25%,97%)]" dir="rtl">
        <div className="max-w-sm w-full space-y-6 text-center">
          <img src={owlLogo} alt="Sageify" className="w-20 h-20 mx-auto" />
          <h1 className="text-2xl font-bold text-[hsl(220,30%,18%)]">פורטל מעסיק</h1>
          <p className="text-sm text-muted-foreground">התחברות לממשק הניהול של הארגון שלך</p>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="סיסמת ארגון"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="text-center"
            />
            <Button onClick={handleLogin} className="w-full bg-[hsl(220,30%,18%)] hover:bg-[hsl(220,30%,25%)] text-white">כניסה</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,25%,97%)]" dir="rtl">
      {/* Header */}
      <div className="bg-[hsl(220,30%,18%)] text-white px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {org?.logo_url && (
              <img src={org.logo_url} alt={org.org_name} className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />
            )}
            <div>
              <h1 className="text-xl font-bold tracking-wide">{org?.org_name} – פורטל מעסיק</h1>
              <p className="text-sm text-white/60">ממשק ניהול אבחוני עובדים | Powered by Sageify</p>
            </div>
          </div>
          <img src={owlLogo} alt="Sageify" className="w-8 h-8 opacity-60" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'סה"כ הזמנות', value: analytics.total, color: 'hsl(220,30%,18%)' },
            { label: 'אבחונים שהושלמו', value: analytics.completedCount, color: 'hsl(160,28%,35%)' },
            { label: 'בתהליך', value: analytics.inProgress, color: 'hsl(40,45%,50%)' },
            { label: 'שיעור השלמה', value: `${analytics.completionRate}%`, color: 'hsl(210,30%,45%)' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl border border-[hsl(220,20%,90%)] px-5 py-4 text-center shadow-sm">
              <p className="text-3xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-xs text-[hsl(220,10%,50%)] mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="invite" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full bg-white border border-[hsl(220,20%,90%)]">
            <TabsTrigger value="invite" className="gap-2 data-[state=active]:bg-[hsl(220,30%,18%)] data-[state=active]:text-white">
              <Link2 className="w-4 h-4" />
              הזמנת עובדים
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-[hsl(220,30%,18%)] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              אנליטיקה
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2 data-[state=active]:bg-[hsl(220,30%,18%)] data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              תוצאות עובדים
            </TabsTrigger>
          </TabsList>

          {/* Invite Tab */}
          <TabsContent value="invite" className="space-y-6">
            <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 shadow-sm">
              <h2 className="font-semibold text-lg text-[hsl(220,30%,18%)] mb-4">יצירת קישור אבחון</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="שם העובד/ת"
                  value={newEmployeeName}
                  onChange={e => setNewEmployeeName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createInvite()}
                  className="flex-1"
                />
                <Button onClick={createInvite} disabled={loading} className="bg-[hsl(220,30%,18%)] hover:bg-[hsl(220,30%,25%)] text-white">
                  <Link2 className="w-4 h-4 ml-2" />
                  צור קישור
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 shadow-sm">
              <h2 className="font-semibold text-lg text-[hsl(220,30%,18%)] mb-4">יצירה מרובה</h2>
              <textarea
                className="w-full border border-[hsl(220,20%,90%)] rounded-lg p-3 bg-[hsl(220,25%,97%)] text-sm min-h-[100px] mb-3"
                placeholder="שם בכל שורה..."
                value={bulkNames}
                onChange={e => setBulkNames(e.target.value)}
              />
              <Button onClick={createBulkInvites} disabled={loading} className="bg-[hsl(220,30%,18%)] hover:bg-[hsl(220,30%,25%)] text-white">
                צור קישורים
              </Button>
            </div>

            {/* Recent invites */}
            <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[hsl(220,20%,90%)] flex justify-between items-center">
                <h2 className="font-semibold text-[hsl(220,30%,18%)]">קישורים אחרונים</h2>
                <Button variant="outline" size="sm" onClick={() => org && loadTokens(org.id)} disabled={loading}>
                  {loading ? 'טוען...' : 'רענן'}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[hsl(220,25%,95%)]">
                    <tr>
                      <th className="p-3 text-right font-semibold text-[hsl(220,10%,40%)]">שם</th>
                      <th className="p-3 text-right font-semibold text-[hsl(220,10%,40%)]">סטטוס</th>
                      <th className="p-3 text-right font-semibold text-[hsl(220,10%,40%)]">תאריך</th>
                      <th className="p-3 text-right font-semibold text-[hsl(220,10%,40%)]">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.slice(0, 10).map(t => (
                      <tr key={t.id} className="border-t border-[hsl(220,20%,93%)] hover:bg-[hsl(220,25%,98%)]">
                        <td className="p-3 font-medium">{t.username}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            t.completed_at
                              ? 'bg-[hsl(160,40%,92%)] text-[hsl(160,40%,25%)]'
                              : t.used
                              ? 'bg-[hsl(40,50%,92%)] text-[hsl(40,50%,30%)]'
                              : 'bg-[hsl(220,15%,93%)] text-[hsl(220,10%,50%)]'
                          }`}>
                            {t.completed_at ? '✅ הושלם' : t.used ? '⏳ בתהליך' : '🔗 ממתין'}
                          </span>
                        </td>
                        <td className="p-3 text-[hsl(220,10%,50%)]">{new Date(t.created_at).toLocaleDateString('he-IL')}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => copyLink(t.token)} title="העתק קישור">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tokens.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-[hsl(220,10%,60%)]">אין הזמנות עדיין. צרו את הראשונה!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Paths */}
              {analytics.topPaths.length > 0 && (
                <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 shadow-sm">
                  <h3 className="font-semibold text-[hsl(220,30%,18%)] mb-4">🎯 מסלולים מובילים (חלומות)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.topPaths.map(([name, value]) => ({ name, value }))} layout="vertical">
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(220,30%,18%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top VIA */}
              {analytics.topVia.length > 0 && (
                <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 shadow-sm">
                  <h3 className="font-semibold text-[hsl(220,30%,18%)] mb-4">💎 חוזקות VIA מובילות</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={analytics.topVia.map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {analytics.topVia.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Schein */}
              {analytics.topSchein.length > 0 && (
                <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 shadow-sm">
                  <h3 className="font-semibold text-[hsl(220,30%,18%)] mb-4">⚓ עוגנים תעסוקתיים מובילים</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={analytics.topSchein.map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {analytics.topSchein.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Holland */}
              {analytics.topHolland.length > 0 && (
                <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 shadow-sm">
                  <h3 className="font-semibold text-[hsl(220,30%,18%)] mb-4">🧭 נטיות Holland מובילות</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.topHolland.map(([name, value]) => ({ name, value }))}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(160,28%,35%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {analytics.completedCount === 0 && (
              <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center shadow-sm">
                <BarChart3 className="w-12 h-12 mx-auto text-[hsl(220,15%,75%)] mb-4" />
                <p className="text-[hsl(220,10%,50%)]">אין עדיין אבחונים שהושלמו. האנליטיקה תתעדכן אוטומטית.</p>
              </div>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 p-3 bg-[hsl(40,50%,95%)] rounded-lg border border-[hsl(40,40%,85%)]">
                <span className="text-sm">⚠️</span>
                <p className="text-sm text-[hsl(40,40%,30%)]">
                  הנתונים המוצגים הם לצרכי ניהול משאבי אנוש בלבד. השימוש בנתונים כפוף למדיניות הפרטיות של הארגון ולתנאי השימוש של Sageify.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[hsl(220,20%,90%)]">
                <h2 className="font-semibold text-[hsl(220,30%,18%)]">עובדים שהשלימו אבחון</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[hsl(220,25%,95%)]">
                    <tr>
                      <th className="p-3 text-right font-semibold text-[hsl(220,10%,40%)]">שם</th>
                      <th className="p-3 text-right font-semibold text-[hsl(220,10%,40%)]">ת.ז</th>
                      <th className="p-3 text-right font-semibold text-[hsl(220,10%,40%)]">תאריך השלמה</th>
                      <th className="p-3 text-right font-semibold text-[hsl(220,10%,40%)]">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.filter(t => t.completed_at).map(t => (
                      <tr key={t.id} className="border-t border-[hsl(220,20%,93%)] hover:bg-[hsl(220,25%,98%)]">
                        <td className="p-3 font-medium">{t.username}</td>
                        <td className="p-3 text-[hsl(220,10%,50%)]">{t.id_number || '—'}</td>
                        <td className="p-3 text-[hsl(220,10%,50%)]">
                          {t.completed_at ? new Date(t.completed_at).toLocaleDateString('he-IL') : '—'}
                        </td>
                        <td className="p-3">
                          {t.questionnaire_responses && (!Array.isArray(t.questionnaire_responses) || t.questionnaire_responses.length > 0) && (
                            <Button size="sm" variant="ghost" onClick={() => setSelectedToken(t)} className="gap-1">
                              <Eye className="w-4 h-4" />
                              צפה בתוצאות
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {tokens.filter(t => t.completed_at).length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-[hsl(220,10%,60%)]">אין עדיין עובדים שהשלימו אבחון</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedToken && (
              <ResponseViewer
                username={selectedToken.username}
                idNumber={selectedToken.id_number}
                responseData={(Array.isArray(selectedToken.questionnaire_responses) ? selectedToken.questionnaire_responses[0]?.response_data : selectedToken.questionnaire_responses?.response_data) as Record<string, unknown> || {}}
                onClose={() => setSelectedToken(null)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowFeedback(!showFeedback)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[hsl(220,30%,18%)] text-white shadow-lg hover:bg-[hsl(220,30%,25%)] transition-all flex items-center justify-center"
        title="שליחת משוב"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>

      {/* Feedback Panel */}
      {showFeedback && (
        <div className="fixed bottom-24 left-6 z-50 w-80 bg-white rounded-xl border border-[hsl(220,20%,90%)] shadow-xl p-5" dir="rtl">
          <h3 className="font-semibold text-[hsl(220,30%,18%)] mb-3">💬 Design Partner Feedback</h3>
          <p className="text-xs text-[hsl(220,10%,55%)] mb-3">שתפו אותנו בהצעות לשיפור הממשק והחוויה</p>
          <textarea
            className="w-full border border-[hsl(220,20%,90%)] rounded-lg p-3 text-sm min-h-[100px] mb-3 bg-[hsl(220,25%,97%)]"
            placeholder="מה תרצו לשפר?"
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={sendFeedback} disabled={!feedbackText.trim()} className="flex-1 bg-[hsl(220,30%,18%)] hover:bg-[hsl(220,30%,25%)] text-white" size="sm">
              שלח משוב
            </Button>
            <Button variant="outline" onClick={() => setShowFeedback(false)} size="sm">
              ביטול
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerAdmin;
