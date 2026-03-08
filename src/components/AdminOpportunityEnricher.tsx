import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Database, Sparkles, Loader2, Check, Globe, Bot, Trash2 } from 'lucide-react';

interface SearchResult {
  title: string;
  organization: string;
  category: string;
  description: string;
  link: string;
  location: string;
  whyFits: string;
}

interface OpportunityRow {
  id: string;
  title: string;
  organization_name: string;
  category: string;
  description: string;
  link: string;
  location: string | null;
  target_traits: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

const PRESET_QUERIES = [
  { label: 'התנדבות חינוך למבוגרים', query: 'הזדמנויות התנדבות חינוך למבוגרים גיל שלישי ישראל 2025' },
  { label: 'קורסים לגמלאים', query: 'קורסים והכשרות מקצועיות לגמלאים ופורשים ישראל' },
  { label: 'עבודה פרילנס 60+', query: 'עבודה פרילנס עצמאית לגילאי 60 פלוס ישראל' },
  { label: 'ייעוץ ומנטורינג', query: 'הזדמנויות ייעוץ ומנטורינג לפורשים בכירים ישראל' },
  { label: 'התנדבות טכנולוגיה', query: 'התנדבות בתחום טכנולוגיה ודיגיטל למבוגרים ישראל' },
  { label: 'יזמות חברתית', query: 'יזמות חברתית לגיל השלישי תוכניות מאיצים ישראל 2025' },
];

interface AdminOpportunityEnricherProps {
  adminPassword: string;
}

const AdminOpportunityEnricher = ({ adminPassword }: AdminOpportunityEnricherProps) => {
  const [customQuery, setCustomQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadOpportunities = useCallback(async () => {
    setLoadingOpps(true);
    try {
      const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOpportunities((data || []) as OpportunityRow[]);
    } catch (e) {
      console.error('Load opportunities error:', e);
      toast.error('שגיאה בטעינת הזדמנויות');
    } finally {
      setLoadingOpps(false);
    }
  }, []);

  const executeSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResults([]);
    setSavedIds(new Set());
    try {
      const { data, error } = await supabase.functions.invoke('perplexity-search', {
        body: { query, profileContext: 'חיפוש אדמין להעשרת מאגר הזדמנויות לפורשים וגיל שלישי בישראל' },
      });
      if (error) throw new Error(error.message);
      setResults(data?.results || []);
      if ((data?.results || []).length === 0) {
        toast.info('לא נמצאו תוצאות, נסה שאילתה אחרת');
      } else {
        toast.success(`נמצאו ${data.results.length} הזדמנויות`);
      }
    } catch (e) {
      console.error('Search error:', e);
      toast.error('שגיאה בחיפוש');
    } finally {
      setIsSearching(false);
    }
  };

  const saveResult = async (result: SearchResult, index: number) => {
    setSavingId(index);
    try {
      const { error } = await supabase.from('opportunities').insert([{
        title: result.title,
        organization_name: result.organization || 'לא צוין',
        category: result.category || 'work',
        description: result.description || '',
        link: result.link || '',
        location: result.location || null,
        target_traits: JSON.parse(JSON.stringify({
          source: 'admin-search',
          whyFits: result.whyFits || '',
        })),
      }]);
      if (error) throw error;
      setSavedIds(prev => new Set(prev).add(index));
      toast.success(`נשמר: ${result.title}`);
    } catch (e) {
      console.error('Save error:', e);
      toast.error('שגיאה בשמירה');
    } finally {
      setSavingId(null);
    }
  };

  const saveAllResults = async () => {
    setSavingAll(true);
    let count = 0;
    for (let i = 0; i < results.length; i++) {
      if (savedIds.has(i)) continue;
      await saveResult(results[i], i);
      count++;
    }
    setSavingAll(false);
    toast.success(`${count} הזדמנויות נשמרו למאגר`);
    loadOpportunities();
  };

  const deleteOpportunity = async (id: string) => {
    if (!confirm('למחוק הזדמנות זו?')) return;
    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) throw error;
      setOpportunities(prev => prev.filter(o => o.id !== id));
      toast.success('נמחק');
    } catch (e) {
      console.error('Delete error:', e);
      toast.error('שגיאה במחיקה');
    }
  };

  const filteredOpps = opportunities.filter(o => {
    if (filterCategory !== 'all' && o.category !== filterCategory) return false;
    if (filterSource !== 'all') {
      const source = (o.target_traits as Record<string, unknown>)?.source as string || 'manual';
      if (filterSource !== source) return false;
    }
    return true;
  });

  const getSourceBadge = (traits: Record<string, unknown>) => {
    const source = (traits?.source as string) || 'manual';
    if (source === 'ai-advisor') return { label: 'יועץ AI', icon: <Bot className="w-3 h-3" />, color: 'bg-secondary/15 text-secondary' };
    if (source === 'live-search') return { label: 'חיפוש חי', icon: <Globe className="w-3 h-3" />, color: 'bg-primary/15 text-primary' };
    if (source === 'admin-search') return { label: 'חיפוש אדמין', icon: <Search className="w-3 h-3" />, color: 'bg-accent/15 text-accent-foreground' };
    return { label: 'ידני', icon: <Database className="w-3 h-3" />, color: 'bg-muted text-muted-foreground' };
  };

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-secondary" />
          חיפוש והעשרת מאגר הזדמנויות
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          חפש הזדמנויות באינטרנט באמצעות AI ושמור אותן ישירות למאגר
        </p>

        {/* Preset queries */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_QUERIES.map((pq) => (
            <button
              key={pq.label}
              onClick={() => executeSearch(pq.query)}
              disabled={isSearching}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-muted/50 hover:bg-secondary/10 hover:border-secondary/30 text-foreground transition-all disabled:opacity-50"
            >
              {pq.label}
            </button>
          ))}
        </div>

        {/* Custom query */}
        <div className="flex gap-3">
          <Input
            value={customQuery}
            onChange={e => setCustomQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && executeSearch(customQuery)}
            placeholder="שאילתת חיפוש מותאמת אישית..."
            disabled={isSearching}
          />
          <Button onClick={() => executeSearch(customQuery)} disabled={isSearching || !customQuery.trim()}>
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="mr-1">חפש</span>
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {(isSearching || results.length > 0) && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              {isSearching ? 'מחפש...' : `נמצאו ${results.length} הזדמנויות`}
            </h3>
            {results.length > 0 && !isSearching && (
              <Button onClick={saveAllResults} disabled={savingAll} size="sm" className="gap-1">
                {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                שמור הכל למאגר
              </Button>
            )}
          </div>

          {isSearching ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, i) => {
                const isSaved = savedIds.has(i);
                const isSaving = savingId === i;
                return (
                  <div key={i} className="border border-border/60 rounded-xl p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-foreground">{result.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            result.category === 'volunteer' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                            result.category === 'work' ? 'bg-primary/10 text-primary border-primary/20' :
                            result.category === 'course' ? 'bg-accent/10 text-accent-foreground border-accent/20' :
                            'bg-muted text-foreground border-border'
                          }`}>
                            {result.category === 'volunteer' ? 'התנדבות' : result.category === 'work' ? 'עבודה' : result.category === 'course' ? 'קורס' : 'פרילנס'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.organization} {result.location ? `· ${result.location}` : ''}</p>
                        <p className="text-xs text-foreground/80 mt-1">{result.description}</p>
                        {result.link && (
                          <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                            {result.link}
                          </a>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={isSaved ? 'secondary' : 'outline'}
                        disabled={isSaved || isSaving}
                        onClick={() => saveResult(result, i)}
                        className="flex-shrink-0 gap-1"
                      >
                        {isSaved ? <Check className="w-3 h-3" /> : isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        {isSaved ? 'נשמר' : 'שמור'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Existing Opportunities Manager */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            מאגר הזדמנויות ({opportunities.length})
          </h3>
          <Button variant="outline" size="sm" onClick={loadOpportunities} disabled={loadingOpps}>
            {loadingOpps ? <Loader2 className="w-4 h-4 animate-spin" /> : 'טען מאגר'}
          </Button>
        </div>

        {opportunities.length > 0 && (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="מקור" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל המקורות</SelectItem>
                  <SelectItem value="ai-advisor">יועץ AI</SelectItem>
                  <SelectItem value="live-search">חיפוש חי</SelectItem>
                  <SelectItem value="admin-search">חיפוש אדמין</SelectItem>
                  <SelectItem value="manual">ידני</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקטגוריות</SelectItem>
                  <SelectItem value="work">עבודה</SelectItem>
                  <SelectItem value="volunteer">התנדבות</SelectItem>
                  <SelectItem value="course">קורס</SelectItem>
                  <SelectItem value="freelance">פרילנס</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground self-center">
                {filteredOpps.length} מתוך {opportunities.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-right font-semibold">כותרת</th>
                    <th className="p-2 text-right font-semibold">ארגון</th>
                    <th className="p-2 text-right font-semibold">סוג</th>
                    <th className="p-2 text-right font-semibold">מקור</th>
                    <th className="p-2 text-right font-semibold">תאריך</th>
                    <th className="p-2 text-right font-semibold">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpps.map(opp => {
                    const source = getSourceBadge(opp.target_traits);
                    return (
                      <tr key={opp.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2 font-medium max-w-[200px] truncate">{opp.title}</td>
                        <td className="p-2 text-muted-foreground text-xs">{opp.organization_name}</td>
                        <td className="p-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            opp.category === 'volunteer' ? 'bg-secondary/15 text-secondary' :
                            opp.category === 'work' ? 'bg-primary/15 text-primary' :
                            opp.category === 'freelance' ? 'bg-accent/15 text-accent-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {opp.category === 'volunteer' ? 'התנדבות' : opp.category === 'work' ? 'עבודה' : opp.category === 'freelance' ? 'פרילנס' : 'קורס'}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${source.color}`}>
                            {source.icon} {source.label}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">{new Date(opp.created_at).toLocaleDateString('he-IL')}</td>
                        <td className="p-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteOpportunity(opp.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {opportunities.length === 0 && !loadingOpps && (
          <p className="text-center text-muted-foreground py-8">לחץ "טען מאגר" כדי לראות את כל ההזדמנויות</p>
        )}
      </div>
    </div>
  );
};

export default AdminOpportunityEnricher;
