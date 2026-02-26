import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cloudClient } from '@/lib/cloudClient';
import owlLogo from '@/assets/owl-logo.png';
import { toast } from 'sonner';

interface TokenRow {
  id: string;
  token: string;
  username: string;
  used: boolean;
  created_at: string;
  completed_at: string | null;
  questionnaire_responses?: { response_data: Record<string, unknown> }[];
}

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenRow | null>(null);
  const supabase = cloudClient;

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

      const response = data as { tokens?: TokenRow[] } | null;
      setStoredPassword(passwordToUse);
      setAuthenticated(true);
      setTokens(response?.tokens || []);
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
    return `${window.location.origin}/#/q/${tokenValue}`;
  };

  const copyLink = (tokenValue: string) => {
    navigator.clipboard.writeText(getLink(tokenValue));
    toast.success('הקישור הועתק!');
  };

  const exportCSV = () => {
    const headers = ['שם משתמש', 'סטטוס', 'תאריך יצירה', 'תאריך השלמה', 'קישור'];
    const rows = tokens.map(t => [
      t.username,
      t.completed_at ? 'הושלם' : t.used ? 'בתהליך' : 'טרם נפתח',
      new Date(t.created_at).toLocaleString('he-IL'),
      t.completed_at ? new Date(t.completed_at).toLocaleString('he-IL') : '',
      getLink(t.token),
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sageify-tokens-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportResponses = () => {
    const completed = tokens.filter(t => t.questionnaire_responses?.length);
    const data = completed.map(t => ({
      username: t.username,
      completed_at: t.completed_at,
      responses: t.questionnaire_responses?.[0]?.response_data,
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
    <div className="min-h-screen p-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <img src={owlLogo} alt="Sageify" className="w-10 h-10" />
        <h1 className="text-2xl font-bold text-foreground">ניהול שאלונים</h1>
      </div>

      {/* Create single token */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-lg mb-3">יצירת קישור חדש</h2>
        <div className="flex gap-3">
          <Input
            placeholder="שם המשתמש"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createToken()}
          />
          <Button onClick={createToken} disabled={loading}>צור קישור</Button>
        </div>
      </div>

      {/* Bulk create */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-lg mb-3">יצירה מרובה</h2>
        <textarea
          className="w-full border border-border rounded-lg p-3 bg-background text-foreground text-sm min-h-[100px] mb-3"
          placeholder="שם בכל שורה..."
          value={bulkNames}
          onChange={e => setBulkNames(e.target.value)}
        />
        <Button onClick={createBulk} disabled={loading}>צור קישורים</Button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Button variant="outline" onClick={loadTokens} disabled={loading}>
          {loading ? 'טוען...' : 'רענן רשימה'}
        </Button>
        <Button variant="outline" onClick={exportCSV}>ייצוא CSV</Button>
        <Button variant="outline" onClick={exportResponses}>ייצוא תשובות (JSON)</Button>
      </div>

      {/* Token list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right font-semibold">שם</th>
              <th className="p-3 text-right font-semibold">סטטוס</th>
              <th className="p-3 text-right font-semibold">תאריך</th>
              <th className="p-3 text-right font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-3 font-medium">{t.username}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    t.completed_at
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : t.used
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {t.completed_at ? '✅ הושלם' : t.used ? '⏳ בתהליך' : '🔗 טרם נפתח'}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString('he-IL')}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => copyLink(t.token)}>📋 העתק</Button>
                    {t.questionnaire_responses?.length ? (
                      <Button size="sm" variant="ghost" onClick={() => setSelectedToken(t)}>👁️ צפה</Button>
                    ) : null}
                    <Button size="sm" variant="ghost" onClick={() => deleteToken(t.id)} className="text-destructive">🗑️</Button>
                  </div>
                </td>
              </tr>
            ))}
            {tokens.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">אין קישורים עדיין. צרו את הראשון!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Response viewer modal */}
      {selectedToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setSelectedToken(null)}>
          <div className="bg-card rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">תשובות: {selectedToken.username}</h2>
              <Button variant="ghost" onClick={() => setSelectedToken(null)}>✕</Button>
            </div>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap" dir="ltr">
              {JSON.stringify(selectedToken.questionnaire_responses?.[0]?.response_data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
