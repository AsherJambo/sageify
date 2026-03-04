import { useState, useRef, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, Flame, Lightbulb, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  adminPassword: string;
}

const CARD_META = [
  { key: 'card1', icon: Flame, label: 'מפת צרכים רגשית', color: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/30', iconColor: 'text-orange-500' },
  { key: 'card2', icon: Lightbulb, label: 'תובנות לשיפור המערכת', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/30', iconColor: 'text-blue-500' },
  { key: 'card3', icon: TrendingUp, label: 'ערך שוק הנתונים', color: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/30', iconColor: 'text-emerald-500' },
];

function parseCards(raw: string) {
  const cards: Record<string, string> = { card1: '', card2: '', card3: '' };

  const c1Start = raw.indexOf('---CARD1---');
  const c2Start = raw.indexOf('---CARD2---');
  const c3Start = raw.indexOf('---CARD3---');
  const end = raw.indexOf('---END---');

  if (c1Start !== -1) {
    const c1End = c2Start !== -1 ? c2Start : raw.length;
    cards.card1 = raw.slice(c1Start + 11, c1End).trim();
  }
  if (c2Start !== -1) {
    const c2End = c3Start !== -1 ? c3Start : raw.length;
    cards.card2 = raw.slice(c2Start + 11, c2End).trim();
  }
  if (c3Start !== -1) {
    const c3End = end !== -1 ? end : raw.length;
    cards.card3 = raw.slice(c3Start + 11, c3End).trim();
  }

  return cards;
}

const AIAnalysisModal = ({ open, onClose, adminPassword }: AIAnalysisModalProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards = useMemo(() => parseCards(content), [content]);
  const hasAnyCard = cards.card1 || cards.card2 || cards.card3;

  useEffect(() => {
    if (open && !started) {
      runAnalysis();
    }
    if (!open) {
      setStarted(false);
      setContent('');
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

  const runAnalysis = async () => {
    setStarted(true);
    setLoading(true);
    setContent('');
    setError('');

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analysis`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({}),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error || 'שגיאה בניתוח');
        setLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) { setError('שגיאה בחיבור'); setLoading(false); return; }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += delta;
              setContent(accumulated);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch {
      setError('שגיאת תקשורת, נסו שוב');
    }
    setLoading(false);
  };

  const exportReport = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sageify-ai-analysis-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
  };

  // Strip the "כותרת: ..." line from card content since we show it in the header
  const cleanCardContent = (raw: string) => {
    return raw.replace(/^כותרת:.*\n?/m, '').trim();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0" dir="rtl">
        <DialogHeader className="p-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              דשבורד אסטרטגי
            </DialogTitle>
            <div className="flex items-center gap-2">
              {content && !loading && (
                <>
                  <Button size="sm" variant="outline" onClick={exportReport}>
                    <Download className="w-4 h-4 ml-1" />
                    ייצוא דוח
                  </Button>
                  <Button size="sm" variant="outline" onClick={runAnalysis}>
                    🔄 ניתוח מחדש
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 min-h-[400px]">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-destructive text-lg">❌ {error}</p>
              <Button onClick={runAnalysis}>נסה שוב</Button>
            </div>
          ) : loading && !hasAnyCard ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-lg">מנתח את כלל נתוני המשתתפים...</p>
              <p className="text-muted-foreground/60 text-sm">זה עשוי לקחת מספר שניות</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {CARD_META.map(({ key, icon: Icon, label, color, border, iconColor }) => {
                const cardContent = cards[key as keyof typeof cards];
                const isThisCardLoading = loading && !cardContent;
                const isThisCardStreaming = loading && !!cardContent;

                return (
                  <div
                    key={key}
                    className={`relative rounded-xl border ${border} bg-gradient-to-br ${color} p-5 transition-all duration-500 ${
                      cardContent ? 'opacity-100 translate-y-0' : 'opacity-60'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-background/80 ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">{label}</h3>
                      {isThisCardLoading && (
                        <div className="mr-auto flex items-center gap-2 text-muted-foreground text-xs">
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ממתין...
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    {cardContent ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert text-right leading-relaxed">
                        <ReactMarkdown>{cleanCardContent(cardContent)}</ReactMarkdown>
                        {isThisCardStreaming && (
                          <span className="inline-block w-2 h-4 bg-primary animate-pulse rounded-sm mr-1" />
                        )}
                      </div>
                    ) : !isThisCardLoading ? (
                      <p className="text-muted-foreground text-sm">—</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAnalysisModal;
