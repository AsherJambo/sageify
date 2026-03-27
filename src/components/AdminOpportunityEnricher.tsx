import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Database, Loader2, Globe, Bot, Trash2, Search, RefreshCw, Sparkles } from 'lucide-react';

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

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  work: { label: 'עבודה', icon: '💼', color: 'bg-primary/15 text-primary' },
  volunteer: { label: 'התנדבות', icon: '🤝', color: 'bg-secondary/15 text-secondary' },
  course: { label: 'קורס', icon: '📚', color: 'bg-accent/15 text-accent-foreground' },
  freelance: { label: 'פרילנס', icon: '⚡', color: 'bg-muted text-foreground' },
  consulting: { label: 'ייעוץ', icon: '🎯', color: 'bg-primary/15 text-primary' },
  board: { label: 'דירקטוריון', icon: '🏛️', color: 'bg-secondary/15 text-secondary' },
  mentoring: { label: 'מנטורינג', icon: '🌱', color: 'bg-accent/15 text-accent-foreground' },
  entrepreneurship: { label: 'יזמות', icon: '🚀', color: 'bg-primary/20 text-primary' },
};

interface AdminOpportunityEnricherProps {
  adminPassword: string;
}

const AdminOpportunityEnricher = ({ adminPassword }: AdminOpportunityEnricherProps) => {
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOpportunities((data || []) as OpportunityRow[]);
    } catch (e) {
      console.error('Load opportunities error:', e);
      toast.error('שגיאה בטעינת הזדמנויות');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

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
    if (source === 'auto-enrichment') return { label: 'העשרה אוטומטית', icon: <Sparkles className="w-3 h-3" />, color: 'bg-primary/20 text-primary' };
    return { label: 'ידני', icon: <Database className="w-3 h-3" />, color: 'bg-muted text-muted-foreground' };
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORY_LABELS[cat] || { label: cat, icon: '📋', color: 'bg-muted text-muted-foreground' };
  };

  // Count by source
  const sourceCounts = opportunities.reduce<Record<string, number>>((acc, o) => {
    const src = ((o.target_traits as Record<string, unknown>)?.source as string) || 'manual';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  // Count by category
  const categoryCounts = opportunities.reduce<Record<string, number>>((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-primary">{opportunities.length}</p>
          <p className="text-xs text-muted-foreground">סה"כ הזדמנויות</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{Object.keys(categoryCounts).length}</p>
          <p className="text-xs text-muted-foreground">קטגוריות פעילות</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{sourceCounts['auto-enrichment'] || 0}</p>
          <p className="text-xs text-muted-foreground">העשרה אוטומטית</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{sourceCounts['ai-advisor'] || 0}</p>
          <p className="text-xs text-muted-foreground">מיועץ AI</p>
        </div>
      </div>

      {/* Auto-enrichment info */}
      <div className="bg-secondary/5 rounded-xl border border-secondary/20 p-4 flex items-start gap-3" dir="rtl">
        <Sparkles className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">העשרה אוטומטית פעילה</p>
          <p className="text-xs text-muted-foreground mt-1">
            המערכת מחפשת הזדמנויות חדשות אוטומטית פעם בשבוע ומוסיפה אותן למאגר. כפילויות מסוננות אוטומטית.
          </p>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            מאגר הזדמנויות ({filteredOpps.length})
          </h3>
          <Button variant="outline" size="sm" onClick={loadOpportunities} disabled={loading} className="gap-1">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            רענן
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap" dir="rtl">
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="מקור" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המקורות</SelectItem>
              <SelectItem value="auto-enrichment">העשרה אוטומטית</SelectItem>
              <SelectItem value="ai-advisor">יועץ AI</SelectItem>
              <SelectItem value="live-search">חיפוש חי</SelectItem>
              <SelectItem value="admin-search">חיפוש אדמין</SelectItem>
              <SelectItem value="manual">ידני</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  {val.icon} {val.label} {categoryCounts[key] ? `(${categoryCounts[key]})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground self-center">
            {filteredOpps.length} מתוך {opportunities.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOpps.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">אין הזדמנויות להצגה</p>
        ) : (
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
                  const cat = getCategoryLabel(opp.category);
                  return (
                    <tr key={opp.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-2 font-medium max-w-[200px]">
                        <div className="truncate">{opp.title}</div>
                        {opp.link && (
                          <a href={opp.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">
                            קישור ←
                          </a>
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground text-xs">
                        {opp.organization_name}
                        {opp.location && <span className="block text-[10px]">{opp.location}</span>}
                      </td>
                      <td className="p-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${cat.color}`}>
                          {cat.icon} {cat.label}
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
        )}
      </div>
    </div>
  );
};

export default AdminOpportunityEnricher;
