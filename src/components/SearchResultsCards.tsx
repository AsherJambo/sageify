import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SearchResult } from '@/hooks/useLiveSearch';
import { Button } from '@/components/ui/button';

interface SearchResultsCardsProps {
  results: SearchResult[];
  isSearching: boolean;
  query: string;
}

const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
  work: { label: 'עבודה', icon: '💼', color: 'bg-primary/10 text-primary border-primary/20' },
  volunteer: { label: 'התנדבות', icon: '🤝', color: 'bg-secondary/10 text-secondary border-secondary/20' },
  course: { label: 'קורס', icon: '📚', color: 'bg-accent/10 text-accent-foreground border-accent/20' },
  freelance: { label: 'פרילנס', icon: '⚡', color: 'bg-muted text-foreground border-border' },
  consulting: { label: 'ייעוץ', icon: '🎯', color: 'bg-primary/15 text-primary border-primary/25' },
  board: { label: 'דירקטוריון', icon: '🏛️', color: 'bg-secondary/15 text-secondary border-secondary/25' },
  mentoring: { label: 'מנטורינג', icon: '🌱', color: 'bg-accent/15 text-accent-foreground border-accent/25' },
  entrepreneurship: { label: 'יזמות', icon: '🚀', color: 'bg-primary/20 text-primary border-primary/30' },
};

const SearchResultsCards = ({ results, isSearching, query }: SearchResultsCardsProps) => {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);

  const saveToDb = async (result: SearchResult, index: number) => {
    setSavingId(index);
    try {
      const { error } = await supabase.from('opportunities').insert([{
        title: result.title,
        organization_name: result.organization || 'לא צוין',
        category: result.category || 'work',
        description: result.description || '',
        link: result.link || '',
        location: result.location || null,
        target_traits: JSON.parse(JSON.stringify({ source: 'live-search', whyFits: result.whyFits })),
      }]);
      if (error) throw error;
      setSavedIds(prev => new Set(prev).add(index));
    } catch (e) {
      console.error('Save opportunity error:', e);
    } finally {
      setSavingId(null);
    }
  };

  if (isSearching) {
    return (
      <div className="my-4 bg-card rounded-2xl border border-secondary/20 p-5 shadow-[var(--shadow-card)]" dir="rtl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
            <span className="text-lg animate-spin">🔍</span>
          </div>
          <div>
            <p className="text-sm font-semibold font-display text-foreground">מחפש הזדמנויות בזמן אמת...</p>
            <p className="text-xs text-muted-foreground">{query}</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="my-4 space-y-3" dir="rtl">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center text-sm">🔍</div>
        <p className="text-xs font-semibold font-display text-secondary tracking-wide">
          נמצאו {results.length} הזדמנויות רלוונטיות
        </p>
      </div>
      {results.map((result, i) => {
        const cat = categoryLabels[result.category] || categoryLabels.work;
        const isSaved = savedIds.has(i);
        const isSaving = savingId === i;
        return (
          <div
            key={i}
            className="bg-card rounded-2xl border border-border/60 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/8 flex items-center justify-center text-xl flex-shrink-0">
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold font-display text-foreground truncate">{result.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.color} flex-shrink-0`}>
                    {cat.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1.5">{result.organization} {result.location ? `· ${result.location}` : ''}</p>
                <p className="text-xs text-foreground/80 leading-relaxed mb-2">{result.description}</p>
                {result.whyFits && (
                  <p className="text-xs text-secondary font-medium">✦ {result.whyFits}</p>
                )}
                {result.link && result.link !== '' && (
                  <div className="flex items-center gap-3 mt-2">
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      למידע נוסף ←
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResultsCards;
