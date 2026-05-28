import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Download, Sparkles, ChevronLeft, X } from 'lucide-react';
import owlLogo from '@/assets/owl-logo.png';
import { BOTTLES, RIASEC_NAMES, RIASEC_FULL, TRACKS, type RIASEC, type Bottle } from '@/data/cocktailBottles';
import OwlChat from '@/components/OwlChat';
import { cloudClient } from '@/lib/cloudClient';

type Stage = 'welcome' | 'mixer' | 'processing' | 'results';

interface Report {
  characterTitle: string;
  superpower: string;
  recommendedTrack: string;
  tracks: { id: string; name: string; paragraph: string }[];
}

const leadSchema = z.object({
  name: z.string().trim().min(2, 'שם קצר מדי').max(60, 'שם ארוך מדי'),
  email: z.string().trim().email('אימייל לא תקין').max(255),
});

const SagiBubble = ({ children, delay = 0.3 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    className="flex items-start gap-3 max-w-xl mx-auto"
  >
    <img src={owlLogo} alt="סגי" className="w-12 h-12 rounded-full bg-sand p-1 shrink-0" />
    <div className="bg-card border border-border rounded-2xl rounded-tr-sm p-4 shadow-[var(--shadow-card)] text-foreground text-[17px] leading-relaxed">
      {children}
    </div>
  </motion.div>
);

const PROCESSING_LINES = [
  'מזהה דפוסים בבחירות שלך...',
  'מצליב עם מאות פרופילים אחרונים...',
  'בודק מה הופך את הקוקטייל הזה לייחודי...',
  'מנסח את הזהות המקצועית שלך...',
];

export default function Cocktail() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [processingLine, setProcessingLine] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // RIASEC scores
  const scores = useMemo<Record<RIASEC, number>>(() => {
    const s: Record<RIASEC, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    selected.forEach(id => {
      const b = BOTTLES.find(x => x.id === id);
      if (b) s[b.category]++;
    });
    return s;
  }, [selected]);

  const topCode = useMemo(() => {
    return (Object.entries(scores) as [RIASEC, number][])
      .sort((a, b) => b[1] - a[1])
      .filter(([, v]) => v > 0)
      .map(([k]) => k)
      .join('');
  }, [scores]);

  // === Welcome ===
  const submitLead = () => {
    const r = leadSchema.safeParse({ name, email });
    if (!r.success) {
      const f = r.error.flatten().fieldErrors;
      setErrors({ name: f.name?.[0], email: f.email?.[0] });
      return;
    }
    setErrors({});
    setStage('mixer');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // === Mixer ===
  const toggleBottle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 14) {
        toast({ title: 'הגעת לתקרה', description: 'מקסימום 14 בקבוקים — הסר אחד כדי להחליף', variant: 'destructive' });
        return prev;
      }
      return [...prev, id];
    });
  };

  // === Process & generate report ===
  const startMix = async () => {
    if (selected.length < 6) return;
    setStage('processing');
    setProcessingLine(0);
    window.scrollTo({ top: 0, behavior: 'instant' });

    const lineInterval = setInterval(() => {
      setProcessingLine(i => (i + 1) % PROCESSING_LINES.length);
    }, 1100);

    try {
      const bottleNames = selected.map(id => BOTTLES.find(b => b.id === id)?.name).filter(Boolean);
      const { data, error } = await cloudClient.functions.invoke('cocktail-report', {
        body: { name, scores, topCode, bottleNames },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const rep: Report = data;
      setReport(rep);

      // Persist
      await cloudClient.from('cocktail_sessions').insert({
        name, email,
        bottles_chosen: selected,
        riasec_scores: scores,
        top_code: topCode,
        character_title: rep.characterTitle || '',
        recommended_track: rep.recommendedTrack || '',
      });

      // small pause for the animation to feel complete
      await new Promise(r => setTimeout(r, 600));
      setStage('results');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'משהו השתבש', description: e.message || 'נסה שוב בעוד רגע', variant: 'destructive' });
      setStage('mixer');
    } finally {
      clearInterval(lineInterval);
    }
  };

  // === Download card ===
  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `cocktail-card-${name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      toast({ title: 'שגיאה בהורדה', variant: 'destructive' });
    }
  };

  const profileSummary = useMemo(() => {
    if (!report) return '';
    return `שם: ${name}. תואר הדמות: ${report.characterTitle}. קוד הולנד: ${topCode}. ` +
      `ציוני RIASEC: ${JSON.stringify(scores)}. מסלול מומלץ: ${report.recommendedTrack}.`;
  }, [report, name, topCode, scores]);

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {stage === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <div className="text-center mb-10 mt-10">
                <motion.img
                  src={owlLogo} alt="סגי"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="w-24 h-24 mx-auto mb-6 bg-sand rounded-full p-2"
                />
                <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">קוקטייל הקריירה</h1>
                <p className="text-lg text-muted-foreground">חוויה משחקית של הולנד · בליווי סגי</p>
              </div>

              <SagiBubble>
                <p className="mb-2"><strong>שלום, אני סגי.</strong></p>
                <p>בעשר הדקות הקרובות נרכיב יחד את <strong>הקוקטייל המקצועי שלך</strong> — לא שאלון, אלא בחירה. אתה תבחר את הבקבוקים שמדברים אליך, ואני אכתוב לך דוח אישי על מה שמסתתר בפנים.</p>
              </SagiBubble>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="max-w-md mx-auto mt-10"
              >
                <Card className="p-6 space-y-5">
                  <div>
                    <Label htmlFor="name" className="text-base">איך לקרוא לך?</Label>
                    <Input
                      id="name" value={name} onChange={e => setName(e.target.value)}
                      className="mt-2 h-12 text-base" placeholder="שם פרטי"
                    />
                    {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base">אימייל לקבלת הדוח</Label>
                    <Input
                      id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="mt-2 h-12 text-base" placeholder="you@example.com" dir="ltr"
                    />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                  </div>
                  <Button onClick={submitLead} size="lg" className="w-full h-14 text-lg bg-accent hover:bg-accent/90">
                    בוא נתחיל
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {stage === 'mixer' && (
            <motion.div key="mixer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-2">המעבדה</h1>
                <p className="text-muted-foreground">בחר בין 6 ל-14 בקבוקים שמדברים אליך</p>
              </div>

              {/* Shaker */}
              <div className="sticky top-2 z-20 mb-6">
                <Card className="p-4 bg-card/95 backdrop-blur">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-medium">השייקר שלך</span>
                    <span className="text-lg font-bold text-accent">{selected.length} / 14</span>
                  </div>
                  <Progress value={(selected.length / 14) * 100} className="h-3 mb-3" />
                  <div className="flex flex-wrap gap-2 min-h-[44px]">
                    {selected.length === 0 && <span className="text-muted-foreground text-sm self-center">השייקר ריק — לחץ על בקבוק כדי להוסיף</span>}
                    {selected.map(id => {
                      const b = BOTTLES.find(x => x.id === id)!;
                      return (
                        <button
                          key={id}
                          onClick={() => toggleBottle(id)}
                          className={`${b.color} rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5 hover:opacity-80 transition`}
                        >
                          <span>{b.emoji}</span>
                          <span>{b.name}</span>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                  {selected.length >= 6 && (
                    <Button onClick={startMix} size="lg" className="w-full mt-4 h-14 text-lg bg-accent hover:bg-accent/90">
                      <Sparkles className="w-5 h-5 ml-2" />
                      ערבב את הקוקטייל שלי
                    </Button>
                  )}
                </Card>
              </div>

              {/* Sagi nudge */}
              {selected.length === 3 && (
                <div className="mb-6"><SagiBubble delay={0}>אני מתחיל לראות כיוון. תמשיך.</SagiBubble></div>
              )}
              {selected.length === 10 && (
                <div className="mb-6"><SagiBubble delay={0}>זה הופך לפרופיל מעניין. עוד כמה אם בא לך — או עצור כאן.</SagiBubble></div>
              )}

              {/* Bottle shelf */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {BOTTLES.map(b => {
                  const isSelected = selected.includes(b.id);
                  return (
                    <motion.button
                      key={b.id}
                      onClick={() => toggleBottle(b.id)}
                      whileTap={{ scale: 0.96 }}
                      className={`${b.color} ${isSelected ? 'opacity-40 ring-2 ring-accent' : 'hover:scale-[1.02]'} rounded-2xl p-4 text-right transition-all shadow-sm`}
                    >
                      <div className="text-3xl mb-2">{b.emoji}</div>
                      <div className="font-bold text-foreground mb-1">{b.name}</div>
                      <div className="text-xs text-foreground/70 leading-snug">{b.description}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-[60vh] flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 blur-2xl absolute"
              />
              <img src={owlLogo} alt="סגי" className="w-28 h-28 relative z-10 mb-6" />
              <motion.p
                key={processingLine}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl text-secondary font-medium relative z-10"
              >
                {PROCESSING_LINES[processingLine]}
              </motion.p>
            </motion.div>
          )}

          {stage === 'results' && report && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <SagiBubble>
                <p>סיימתי לעבד. הנה מה שיצא — והכי חשוב: <strong>אני נשאר כאן</strong> בסוף הדוח כדי לדבר על זה איתך.</p>
              </SagiBubble>

              {/* Player Card */}
              <div ref={cardRef} className="max-w-md mx-auto my-8">
                <Card className="bg-gradient-to-br from-secondary via-secondary to-[hsl(var(--navy-light))] text-secondary-foreground p-6 rounded-3xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-widest opacity-70">Career Cocktail</span>
                    <span className="text-xs font-mono opacity-70">{topCode}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-1">{name}</h2>
                  <p className="text-accent text-xl font-semibold mb-6">{report.characterTitle}</p>

                  <div className="space-y-2 mb-6">
                    {(['R','I','A','S','E','C'] as RIASEC[]).map(k => {
                      const max = 4;
                      const v = scores[k];
                      return (
                        <div key={k}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{RIASEC_NAMES[k]}</span>
                            <span className="font-mono">{v}/{max}</span>
                          </div>
                          <div className="h-3.5 bg-white/15 rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(v / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/15 pt-4">
                    <div className="text-xs uppercase tracking-widest opacity-70 mb-1">יכולת על</div>
                    <p className="text-base leading-relaxed">{report.superpower}</p>
                  </div>
                </Card>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mb-10">
                <Button onClick={downloadCard} size="lg" variant="outline" className="h-12">
                  <Download className="w-5 h-5 ml-2" /> הורד כרטיס שחקן
                </Button>
              </div>

              {/* Tracks */}
              <div className="space-y-4 mb-10">
                <h2 className="text-2xl font-bold text-secondary text-center mb-6">6 מסלולי הלימוד — מותאם אישית</h2>
                {report.tracks?.map(t => {
                  const isRecommended = t.id === report.recommendedTrack || t.name === report.recommendedTrack;
                  return (
                    <Card key={t.id} className={`p-6 ${isRecommended ? 'border-accent border-2' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-secondary">{t.name}</h3>
                        {isRecommended && <span className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full">המסלול שלך</span>}
                      </div>
                      <p className="text-foreground leading-relaxed">{t.paragraph}</p>
                    </Card>
                  );
                })}
              </div>

              {/* Sagi chat */}
              <div className="mb-10">
                <SagiBubble>
                  <p>יש לך שאלה על משהו שראית? <strong>אני כאן.</strong> אפשר לשאול אותי על המסלולים, על העתיד, או על כל דבר שצף לך.</p>
                </SagiBubble>
                <div className="mt-6">
                  <OwlChat profileSummary={profileSummary} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
