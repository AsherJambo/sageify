import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cloudClient } from '@/lib/cloudClient';
import owlLogo from '@/assets/owl-logo.png';
import { toast } from 'sonner';
import ResponseViewer from '@/components/ResponseViewer';
import { generatePrintHTML } from '@/lib/pdfTemplate';
import AIAnalysisModal from '@/components/AIAnalysisModal';
import AdminOpportunityEnricher from '@/components/AdminOpportunityEnricher';
import AdminUnifiedInsights from '@/components/AdminUnifiedInsights';
import { Sparkles, BarChart3, Search, Database, Building2 } from 'lucide-react';
import AdminOrganizations from '@/components/AdminOrganizations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import { skills } from '@/data/skillsData';
import { preferenceQuestions } from '@/data/preferencesData';
import { calculateCategoryScores, getTopCategories, type Answers } from '@/lib/scoring';

interface TokenRow {
  id: string;
  token: string;
  username: string;
  id_number?: string | null;
  used: boolean;
  created_at: string;
  completed_at: string | null;
  questionnaire_responses?: { response_data: Record<string, unknown> } | { response_data: Record<string, unknown> }[] | null;
}

const getCompletedSectionsCount = (raw: Record<string, unknown> | undefined): number => {
  if (!raw) return 0;
  let count = 0;
  if (raw.skillsAssignments) count++;
  if (raw.scheinBonusApplied) count++;
  if (raw.considerationsData) count++;
  if (raw.hollandAnswers) count++;
  if (raw.viaBonusApplied) count++;
  if (raw.preferencesData && raw.personalitySliders) count++;
  if (raw.motivationData) count++;
  return count;
};

const getResponseData = (t: TokenRow): Record<string, unknown> | undefined => {
  if (!t.questionnaire_responses) return undefined;
  if (Array.isArray(t.questionnaire_responses)) {
    return t.questionnaire_responses[0]?.response_data as Record<string, unknown> | undefined;
  }
  return t.questionnaire_responses.response_data as Record<string, unknown> | undefined;
};

const hasReachedAdvisor = (raw: Record<string, unknown> | undefined): boolean => {
  if (!raw) return false;
  const step = raw.step as string;
  return step === 'advisor' || step === 'results';
};

const getDetailedStatus = (t: TokenRow): { label: string; className: string } => {
  const raw = getResponseData(t);
  const sections = getCompletedSectionsCount(raw);
  const reachedAdvisor = hasReachedAdvisor(raw);

  if (t.completed_at || (reachedAdvisor && sections >= 3)) {
    return { label: `✅ הושלם (${sections}/8 שאלונים)`, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
  }
  if (t.used || sections > 0) {
    return { label: `⏳ בתהליך (${sections}/8 שאלונים)`, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
  }
  return { label: '🔗 טרם נפתח', className: 'bg-muted text-muted-foreground' };
};

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenRow | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const supabase = cloudClient;

  const isTokenCompleted = useCallback((t: TokenRow): boolean => {
    if (t.completed_at) return true;
    const raw = getResponseData(t);
    return hasReachedAdvisor(raw) && getCompletedSectionsCount(raw) >= 3;
  }, []);

  const isTokenInProgress = useCallback((t: TokenRow): boolean => {
    if (isTokenCompleted(t)) return false;
    const raw = getResponseData(t);
    return t.used || getCompletedSectionsCount(raw) > 0;
  }, [isTokenCompleted]);

  const filteredTokens = useMemo(() => {
    return tokens.filter(t => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'completed' && !isTokenCompleted(t)) return false;
        if (filterStatus === 'in_progress' && !isTokenInProgress(t)) return false;
        if (filterStatus === 'not_started' && (t.used || getCompletedSectionsCount(getResponseData(t)) > 0)) return false;
      }
      // Date filter
      const created = new Date(t.created_at);
      if (filterDateFrom && created < new Date(filterDateFrom)) return false;
      if (filterDateTo) {
        const toEnd = new Date(filterDateTo);
        toEnd.setHours(23, 59, 59, 999);
        if (created > toEnd) return false;
      }
      return true;
    });
  }, [tokens, filterStatus, filterDateFrom, filterDateTo, isTokenCompleted, isTokenInProgress]);

  const apiCall = useCallback(async (action: string, body: Record<string, unknown> = {}): Promise<any> => {
    const { data, error } = await supabase.functions.invoke('admin', {
      headers: {
        'x-admin-password': storedPassword,
      },
      body: { action, ...body },
    });

    if (error) return { error: 'שגיאת תקשורת, נסו שוב' };
    return data ?? {};
  }, [storedPassword]);

  const handleLogin = async () => {
    const passwordToUse = password.trim();
    if (!passwordToUse) {
      toast.error('יש להזין סיסמה');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        headers: {
          'x-admin-password': passwordToUse,
        },
        body: { action: 'list-tokens' },
      });

      if (error) {
        toast.error('סיסמה שגויה');
        return;
      }

      setStoredPassword(passwordToUse);
      setAuthenticated(true);
      // Load full data with responses immediately
      const fullData = await supabase.functions.invoke('admin', {
        headers: { 'x-admin-password': passwordToUse },
        body: { action: 'all-responses' },
      });
      if (fullData.data?.data) {
        setTokens(fullData.data.data);
      } else {
        const response = data as { tokens?: TokenRow[] } | null;
        setTokens(response?.tokens || []);
      }
    } catch {
      toast.error('שגיאת תקשורת, נסו שוב');
    }
  };

  const loadTokens = async () => {
    setLoading(true);
    const data = await apiCall('all-responses');
    if (data.data) setTokens(data.data);
    setLoading(false);
  };

  const createToken = async () => {
    if (!newUsername.trim()) return;
    setLoading(true);
    const data = await apiCall('create-token', { username: newUsername.trim() });
    if (data.token) {
      toast.success(`קישור נוצר עבור ${newUsername} (בפורמט חדש)`);
      setNewUsername('');
      await loadTokens();
    } else {
      toast.error(data.error || 'שגיאה');
    }
    setLoading(false);
  };

  const createBulk = async () => {
    const names = bulkNames.split('\n').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    setLoading(true);
    const data = await apiCall('create-tokens-bulk', { usernames: names });
    if (data.tokens) {
      toast.success(`${data.tokens.length} קישורים נוצרו`);
      setBulkNames('');
      await loadTokens();
    } else {
      toast.error(data.error || 'שגיאה');
    }
    setLoading(false);
  };

  const deleteToken = async (tokenId: string) => {
    if (!confirm('למחוק את הקישור הזה?')) return;
    await apiCall('delete-token', { tokenId });
    toast.success('נמחק');
    await loadTokens();
  };

  const getLink = (tokenValue: string) => {
    const origin = window.location.hostname.includes('lovableproject.com') || window.location.hostname.includes('lovable.app') && window.location.hostname.includes('preview')
      ? 'https://sageify.lovable.app'
      : window.location.origin;
    return `${origin}/#/q/${tokenValue}`;
  };

  const copyLink = (tokenValue: string) => {
    navigator.clipboard.writeText(getLink(tokenValue));
    toast.success('הקישור הועתק!');
  };

  const escCSV = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const exportCSV = (useFiltered = true) => {
    const exportData = useFiltered ? filteredTokens : tokens;
    // Build dynamic headers
    const viaCats = [...viaCategories];
    const scheinCats = [...scheinCategories];
    const hollandCats = [...hollandCategories];

    const headers = [
      'שם משתמש', 'ת.ז', 'סטטוס', 'שלב נוכחי', 'תאריך יצירה', 'תאריך השלמה',
      ...viaCats.map(c => `VIA: ${c}`), 'Top VIA',
      ...scheinCats.map(c => `שיין: ${c}`), 'Top שיין',
      ...hollandCats.map(c => `הולנד: ${c}`), 'Top הולנד',
      'כישורי מנצח', 'כישורי שחיקה',
      'שיקולים (מדורגים)',
      ...preferenceQuestions.map(q => q.title),
      'מגירת חלומות',
      'חשיבה: תשובות נכונות', 'חשיבה: אחוזון', 'חשיבה: רמה', 'חשיבה: זמן (שניות)',
      'שיחת ייעוץ',
      'קישור',
    ];

    const rows = exportData.map(t => {
      const raw = (Array.isArray(t.questionnaire_responses)
        ? t.questionnaire_responses[0]?.response_data
        : t.questionnaire_responses?.response_data) as Record<string, any> || {};

      // VIA
      const viaAnswers = raw.finalViaAnswers || raw.viaAnswers || {};
      const viaScores = calculateCategoryScores(viaAnswers, viaQuestions, viaCategories);
      const topVia = getTopCategories(viaScores, 3).map(x => x.category).join(' / ');

      // Schein
      const scheinAnswers = raw.finalScheinAnswers || raw.scheinAnswers || {};
      const scheinScores = calculateCategoryScores(scheinAnswers, scheinQuestions, scheinCategories);
      const topSchein = getTopCategories(scheinScores, 3).map(x => x.category).join(' / ');

      // Holland
      const hollandAnswers = raw.hollandAnswers || {};
      const hScores: Record<string, number> = {};
      hollandCats.forEach(c => { hScores[c] = 0; });
      Object.entries(hollandAnswers).forEach(([id, val]) => {
        if (val) {
          const q = hollandQuestions.find(q => q.id === Number(id));
          if (q) hScores[q.category] = (hScores[q.category] || 0) + 1;
        }
      });
      const topHolland = Object.entries(hScores).sort(([,a],[,b]) => (b as number) - (a as number)).slice(0, 3).map(([c]) => c).join(' / ');

      // Skills
      const sa = raw.skillsAssignments || {};
      const winnerSkills = Object.entries(sa).filter(([, col]) => col === 'winner').map(([id]) => skills.find(s => s.id === Number(id))?.text).filter(Boolean).join(' | ');
      const burnoutSkills = Object.entries(sa).filter(([, col]) => col === 'burnout').map(([id]) => skills.find(s => s.id === Number(id))?.text).filter(Boolean).join(' | ');

      // Considerations
      const cons = raw.considerationsData as { selected: string[]; points: Record<string, number> } | undefined;
      const consText = cons?.selected
        ? cons.selected.sort((a, b) => (cons.points[b] || 0) - (cons.points[a] || 0)).map(item => `${item} (${cons.points[item] || 0})`).join(' | ')
        : '';

      // Preferences
      const prefs = raw.preferencesData as { preferences: Record<string, string[]>; dream: string } | undefined;
      const prefCols = preferenceQuestions.map(q => (prefs?.preferences?.[q.id] || []).join(' | '));
      const dream = prefs?.dream || '';

      // Thinking
      const thinkingResult = raw.thinkingResult as { correct?: number; total?: number; percentile?: number; level?: string; timeUsed?: number } | undefined;
      const thinkingCorrect = thinkingResult ? `${thinkingResult.correct || 0}/${thinkingResult.total || 15}` : '';
      const thinkingPercentile = thinkingResult?.percentile != null ? String(thinkingResult.percentile) : '';
      const thinkingLevel = thinkingResult?.level || '';
      const thinkingTime = thinkingResult?.timeUsed != null ? String(thinkingResult.timeUsed) : '';

      // Chat
      const chatMessages = raw.chatMessages as { role: string; content: string }[] | undefined;
      const chatText = chatMessages
        ? chatMessages.map(m => `${m.role === 'user' ? 'משתמש' : 'יועץ'}: ${m.content}`).join(' || ')
        : '';

      return [
        t.username,
        t.id_number || '',
        isTokenCompleted(t) ? 'הושלם' : isTokenInProgress(t) ? 'בתהליך' : 'טרם נפתח',
        raw.step || '',
        new Date(t.created_at).toLocaleString('he-IL'),
        t.completed_at ? new Date(t.completed_at).toLocaleString('he-IL') : '',
        ...viaCats.map(c => (viaScores[c] || 0).toFixed(1)),
        topVia,
        ...scheinCats.map(c => (scheinScores[c] || 0).toFixed(1)),
        topSchein,
        ...hollandCats.map(c => String(hScores[c] || 0)),
        topHolland,
        winnerSkills,
        burnoutSkills,
        consText,
        ...prefCols,
        dream,
        thinkingCorrect,
        thinkingPercentile,
        thinkingLevel,
        thinkingTime,
        chatText,
        getLink(t.token),
      ].map(v => escCSV(String(v)));
    });

    const csv = '\uFEFF' + [headers.map(h => escCSV(h)), ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sageify-full-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportResponses = () => {
    const completed = tokens.filter(t => t.questionnaire_responses != null && (!Array.isArray(t.questionnaire_responses) || t.questionnaire_responses.length > 0));
    const data = completed.map(t => ({
      username: t.username,
      completed_at: t.completed_at,
      responses: Array.isArray(t.questionnaire_responses) ? t.questionnaire_responses[0]?.response_data : t.questionnaire_responses?.response_data,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sageify-responses-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" dir="rtl">
        <div className="max-w-sm w-full space-y-6 text-center">
          <img src={owlLogo} alt="Sageify Admin" className="w-20 h-20 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">ניהול Sageify</h1>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="סיסמת אדמין"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="text-center"
            />
            <Button onClick={handleLogin} className="w-full">כניסה</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Data Asset Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <img src={owlLogo} alt="Sageify" className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground tracking-wide">Sageify Data Console</h1>
            <p className="text-sm text-muted-foreground">נכס הדאטה המוביל בישראל על הפסיכולוגיה של הפורש הישראלי</p>
          </div>
        </div>
        {/* Live KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold font-display text-foreground">{tokens.length}</p>
            <p className="text-xs text-muted-foreground">פרופילים פסיכולוגיים</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold font-display text-secondary">{tokens.filter(t => isTokenCompleted(t)).length}</p>
            <p className="text-xs text-muted-foreground">אבחונים מלאים</p>
            <p className="text-[10px] text-muted-foreground/60">3+ שאלונים + שיחה עם סגי</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold font-display text-primary">{tokens.filter(t => isTokenInProgress(t)).length}</p>
            <p className="text-xs text-muted-foreground">בתהליך אבחון</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold font-display text-foreground">
              {tokens.length > 0 ? Math.round((tokens.filter(t => isTokenCompleted(t)).length / Math.max(tokens.filter(t => t.used || isTokenInProgress(t) || isTokenCompleted(t)).length, 1)) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">שיעור השלמה</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="flex flex-col md:grid md:grid-cols-4 w-full h-auto gap-2 p-1">
          <TabsTrigger value="tokens" className="gap-2 w-full">
            📋 ניהול קישורים
          </TabsTrigger>
          <TabsTrigger value="organizations" className="gap-2 w-full">
            <Building2 className="w-4 h-4" />
            🏢 ארגונים
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2 w-full">
            <Database className="w-4 h-4" />
            📊 תובנות ודאטה
          </TabsTrigger>
          <TabsTrigger value="enrichment" className="gap-2 w-full">
            <Search className="w-4 h-4" />
            העשרת מאגר
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-6">
          {/* Create single token */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-3">יצירת קישור חדש</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="שם המשתמש"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createToken()}
              />
              <Button onClick={createToken} disabled={loading} className="w-full sm:w-auto">צור קישור</Button>
            </div>
          </div>

          {/* Bulk create */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-3">יצירה מרובה</h2>
            <textarea
              className="w-full border border-border rounded-lg p-3 bg-background text-foreground text-sm min-h-[100px] mb-3"
              placeholder="שם בכל שורה..."
              value={bulkNames}
              onChange={e => setBulkNames(e.target.value)}
            />
            <Button onClick={createBulk} disabled={loading} className="w-full sm:w-auto">צור קישורים</Button>
          </div>

          {/* Filters & Actions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-3">סינון וייצוא</h2>
            <div className="flex gap-3 mb-4 flex-wrap items-end">
              <div className="space-y-1 w-full sm:w-auto">
                <label className="text-xs text-muted-foreground">סטטוס</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="in_progress">בתהליך</SelectItem>
                    <SelectItem value="not_started">טרם נפתח</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 w-full sm:w-auto">
                <label className="text-xs text-muted-foreground">מתאריך</label>
                <Input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="w-full sm:w-[160px]" />
              </div>
              <div className="space-y-1 w-full sm:w-auto">
                <label className="text-xs text-muted-foreground">עד תאריך</label>
                <Input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="w-full sm:w-[160px]" />
              </div>
              {(filterStatus !== 'all' || filterDateFrom || filterDateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setFilterStatus('all'); setFilterDateFrom(''); setFilterDateTo(''); }}>
                  נקה סינון
                </Button>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" onClick={loadTokens} disabled={loading}>
                {loading ? 'טוען...' : 'רענן רשימה'}
              </Button>
              <Button variant="outline" onClick={() => exportCSV(true)}>
                ייצוא CSV {filteredTokens.length !== tokens.length ? `(${filteredTokens.length})` : ''}
              </Button>
              <Button variant="outline" onClick={exportResponses}>ייצוא תשובות (JSON)</Button>
              <Button onClick={() => setShowAnalysis(true)} className="gap-2">
                <Sparkles className="w-4 h-4" />
                ניתוח דאטה אסטרטגי (AI)
              </Button>
            </div>
          </div>

          {/* Token list */}
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-right font-semibold whitespace-nowrap">שם</th>
                  <th className="p-3 text-right font-semibold whitespace-nowrap">ת.ז</th>
                  <th className="p-3 text-right font-semibold whitespace-nowrap">סטטוס</th>
                  <th className="p-3 text-right font-semibold whitespace-nowrap">תאריך</th>
                  <th className="p-3 text-right font-semibold whitespace-nowrap">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map(t => (
                  <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-medium whitespace-nowrap">{t.username}</td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{t.id_number || '—'}</td>
                    <td className="p-3">
                      {(() => {
                        const status = getDetailedStatus(t);
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(t.created_at).toLocaleDateString('he-IL')}</td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {t.questionnaire_responses && (!Array.isArray(t.questionnaire_responses) || t.questionnaire_responses.length > 0) ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedToken(t)}>👁️ צפה</Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              setSelectedToken(t);
                              setTimeout(() => {
                                const content = document.getElementById('response-viewer-content');
                                if (!content) return;
                                const win = window.open('', '_blank');
                                if (!win) return;
                                win.document.write(generatePrintHTML(t.username, content.innerHTML, t.id_number));
                                win.document.close();
                                setTimeout(() => { win.print(); }, 400);
                              }, 200);
                            }}>📄 PDF</Button>
                          </>
                        ) : null}
                        <Button size="sm" variant="ghost" onClick={() => copyLink(t.token)}>📋 העתק</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteToken(t.id)} className="text-destructive">🗑️</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tokens.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">אין קישורים עדיין. צרו את הראשון!</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Response viewer modal */}
          {selectedToken && (
            <ResponseViewer
              username={selectedToken.username}
              idNumber={selectedToken.id_number}
              responseData={(Array.isArray(selectedToken.questionnaire_responses) ? selectedToken.questionnaire_responses[0]?.response_data : selectedToken.questionnaire_responses?.response_data) as Record<string, unknown> || {}}
              onClose={() => setSelectedToken(null)}
            />
          )}

          <AIAnalysisModal
            open={showAnalysis}
            onClose={() => setShowAnalysis(false)}
            adminPassword={storedPassword}
          />
        </TabsContent>

        <TabsContent value="organizations">
          <AdminOrganizations />
        </TabsContent>

        <TabsContent value="insights">
          <AdminUnifiedInsights tokens={filteredTokens} adminPassword={storedPassword} />
        </TabsContent>

        <TabsContent value="enrichment">
          <AdminOpportunityEnricher adminPassword={storedPassword} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
