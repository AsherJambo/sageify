import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  adminPassword: string;
}

const AIAnalysisModal = ({ open, onClose, adminPassword }: AIAnalysisModalProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    } catch (e) {
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0" dir="rtl">
        <DialogHeader className="p-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              ניתוח דאטה אסטרטגי (AI)
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
          ) : loading && !content ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">מנתח את כלל נתוני המשתתפים...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert text-right leading-relaxed">
              <ReactMarkdown>{content}</ReactMarkdown>
              {loading && (
                <span className="inline-block w-2 h-5 bg-primary animate-pulse rounded-sm mr-1" />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAnalysisModal;
