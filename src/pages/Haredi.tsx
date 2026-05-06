import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Sparkles, RotateCcw, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

type TrackId = 'electricity' | 'software' | 'construction' | 'machinery' | 'auto' | 'medical_devices' | 'health_support';

const TRACKS: Record<TrackId, { name: string; tagline: string; emoji: string }> = {
  electricity: { name: 'חשמלאות', tagline: 'מקצוע יציב, ביקוש גבוה, אפשרות לעצמאות', emoji: '⚡' },
  software: { name: 'תוכנה', tagline: 'שכר גבוה, עבודה מהבית, ביקוש בינלאומי', emoji: '💻' },
  construction: { name: 'בניין', tagline: 'התמחויות מבוקשות, צמיחה לקבלנות', emoji: '🏗️' },
  machinery: { name: 'מכונות ו-CNC', tagline: 'תעשייה מתקדמת, דיוק ומקצועיות', emoji: '⚙️' },
  auto: { name: 'מוסכים ורכב', tagline: 'עצמאות מהירה, שירות תמידי בביקוש', emoji: '🚗' },
  medical_devices: { name: 'מכשור רפואי', tagline: 'הייטק רפואי, שילוב טכנולוגיה ועזרה לזולת', emoji: '🩺' },
  health_support: { name: 'תומכי נפש במערכת הבריאות', tagline: 'עזרה משמעותית לאנשים, סביבה שקטה', emoji: '💚' },
};

interface Question {
  id: number;
  text: string;
  weights: Partial<Record<TrackId, number>>;
}

const QUESTIONS: Question[] = [
  { id: 1, text: 'אני נהנה לפרק ולהרכיב דברים, להבין איך מכשירים עובדים מבפנים', weights: { electricity: 3, machinery: 3, auto: 3, medical_devices: 2 } },
  { id: 2, text: 'מתאים לי לשבת שעות מול מסך ולפתור חידות לוגיות מורכבות', weights: { software: 3, medical_devices: 1 } },
  { id: 3, text: 'אני מעדיף עבודה פיזית ופעילה על פני עבודה משרדית', weights: { construction: 3, electricity: 2, auto: 2, machinery: 1 } },
  { id: 4, text: 'חשוב לי לעזור לאנשים באופן ישיר ולראות את ההשפעה שלי', weights: { health_support: 3, medical_devices: 2 } },
  { id: 5, text: 'יש לי סבלנות לדיוק רב, לעבודה מדויקת מ-millimeter בודדים', weights: { machinery: 3, medical_devices: 3, software: 1, electricity: 1 } },
  { id: 6, text: 'אני אוהב לזהות תקלות ולגלות מה השתבש - כמו בלש', weights: { auto: 3, electricity: 3, software: 2, medical_devices: 2 } },
  { id: 7, text: 'מתאים לי לעבוד בחוץ, גם כשהמזג אוויר משתנה', weights: { construction: 3, electricity: 2 } },
  { id: 8, text: 'אני מעדיף לעבוד עם מספרים, נוסחאות ומבנים מופשטים', weights: { software: 3, medical_devices: 1 } },
  { id: 9, text: 'אני רואה את עצמי פותח עסק עצמאי תוך כמה שנים', weights: { electricity: 3, auto: 3, construction: 2 } },
  { id: 10, text: 'נוח לי בסביבה שקטה ומסודרת כמו בית חולים או מעבדה', weights: { health_support: 3, medical_devices: 3 } },
  { id: 11, text: 'אני לומד הכי טוב כשאני עושה בידיים, לא רק מקריאה', weights: { electricity: 2, machinery: 2, auto: 2, construction: 2 } },
  { id: 12, text: 'משוך אותי עולם הטכנולוגיה המתקדמת והחדשנות', weights: { software: 3, medical_devices: 3, machinery: 2 } },
];

type Step = 'welcome' | 'questionnaire' | 'loading' | 'results';

interface AIExplanation {
  name: string;
  why: string;
  dayInLife: string;
  firstStep: string;
}

const Haredi = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [topTracks, setTopTracks] = useState<{ id: TrackId; score: number }[]>([]);
  const [explanations, setExplanations] = useState<AIExplanation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [step]);

  const calculateTop = () => {
    const scores: Record<TrackId, number> = {
      electricity: 0, software: 0, construction: 0, machinery: 0, auto: 0, medical_devices: 0, health_support: 0,
    };
    QUESTIONS.forEach((q) => {
      const a = answers[q.id] ?? 3;
      Object.entries(q.weights).forEach(([t, w]) => {
        scores[t as TrackId] += a * (w as number);
      });
    });
    const sorted = (Object.entries(scores) as [TrackId, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ id, score }));
    return sorted.slice(0, 3);
  };

  const handleAnswer = async (value: number) => {
    const q = QUESTIONS[qIndex];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    if (qIndex < QUESTIONS.length - 1) {
      setTimeout(() => setQIndex(qIndex + 1), 200);
    } else {
      // last question — calculate and call AI
      const top = (() => {
        const scores: Record<TrackId, number> = {
          electricity: 0, software: 0, construction: 0, machinery: 0, auto: 0, medical_devices: 0, health_support: 0,
        };
        QUESTIONS.forEach((qq) => {
          const a = newAnswers[qq.id] ?? 3;
          Object.entries(qq.weights).forEach(([t, w]) => {
            scores[t as TrackId] += a * (w as number);
          });
        });
        return (Object.entries(scores) as [TrackId, number][])
          .sort((a, b) => b[1] - a[1])
          .map(([id, score]) => ({ id, score }))
          .slice(0, 3);
      })();
      setTopTracks(top);
      setStep('loading');
      setError(null);

      try {
        const profile = QUESTIONS.map((qq) => ({ q: qq.text, answer: newAnswers[qq.id] }));
        const { data, error: err } = await supabase.functions.invoke('haredi-match', {
          body: {
            topTracks: top.map((t) => TRACKS[t.id].name),
            profile,
          },
        });
        if (err) throw err;
        if (data?.tracks?.length) {
          setExplanations(data.tracks);
        } else {
          setExplanations(top.map((t) => ({
            name: TRACKS[t.id].name, why: TRACKS[t.id].tagline, dayInLife: '', firstStep: '',
          })));
        }
      } catch (e) {
        console.error(e);
        setError('לא הצלחנו לקבל הסבר אישי כעת. הנה התוצאות הבסיסיות:');
        setExplanations(top.map((t) => ({
          name: TRACKS[t.id].name, why: TRACKS[t.id].tagline, dayInLife: '', firstStep: '',
        })));
      }
      setStep('results');
    }
  };

  const handleBack = () => {
    if (qIndex > 0) setQIndex(qIndex - 1);
    else setStep('welcome');
  };

  const handleRestart = () => {
    setStep('welcome');
    setQIndex(0);
    setAnswers({});
    setTopTracks([]);
    setExplanations(null);
    setError(null);
  };

  // ============ WELCOME ============
  if (step === 'welcome') {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-8 md:p-12 shadow-soft border-0 bg-card">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6">
                כיוון מקצועי
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight">
                המסלול המקצועי שלך
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                כלי קצר ומדויק שעוזר לבחור מקצוע המתאים לאופי, לכישרונות ולשאיפות שלך —
                מבין שבעה מסלולי הכשרה מבוקשים ומכבדים.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5 mb-8 border border-border/50">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground/80 leading-relaxed">
                  <p className="font-semibold mb-1">שים לב:</p>
                  <p>
                    קיימים כמובן מסלולים מקצועיים נוספים בעולם.
                    הכלי הזה ממקד אותך מבין שבעת המסלולים הבאים — אלו שזוהו כרלוונטיים, מבוקשים ומתאימים במיוחד.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {(Object.keys(TRACKS) as TrackId[]).map((id) => (
                <div key={id} className="bg-muted/40 rounded-lg p-3 text-center border border-border/40">
                  <div className="text-2xl mb-1">{TRACKS[id].emoji}</div>
                  <div className="text-sm font-semibold text-primary">{TRACKS[id].name}</div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setStep('questionnaire')}
              className="w-full text-lg py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              התחל את האבחון (12 שאלות, כ-3 דקות)
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              ללא רישום • ללא איסוף מידע אישי
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ============ QUESTIONNAIRE ============
  if (step === 'questionnaire') {
    const q = QUESTIONS[qIndex];
    const progress = ((qIndex + 1) / QUESTIONS.length) * 100;
    const currentAnswer = answers[q.id];

    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-muted/30">
          <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="max-w-2xl mx-auto px-6 pt-16 pb-12">
          <div className="flex items-center justify-between mb-8 text-sm text-muted-foreground">
            <button onClick={handleBack} className="flex items-center gap-1 hover:text-primary transition-colors">
              <ChevronRight className="w-4 h-4" />
              חזרה
            </button>
            <span>שאלה {qIndex + 1} מתוך {QUESTIONS.length}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-8 md:p-10 shadow-soft border-0 bg-card mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-relaxed mb-8 text-center">
                  {q.text}
                </h2>

                <div className="space-y-3">
                  {[
                    { v: 5, label: 'מאוד מתאים לי' },
                    { v: 4, label: 'די מתאים לי' },
                    { v: 3, label: 'במידה בינונית' },
                    { v: 2, label: 'לא ממש' },
                    { v: 1, label: 'בכלל לא' },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => handleAnswer(opt.v)}
                      className={`w-full text-right px-6 py-4 rounded-lg border-2 transition-all text-base md:text-lg font-medium ${
                        currentAnswer === opt.v
                          ? 'bg-secondary text-secondary-foreground border-secondary'
                          : 'bg-card border-border hover:border-secondary/50 hover:bg-muted/30 text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ============ LOADING ============
  if (step === 'loading') {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-16 h-16 text-secondary" />
          </motion.div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
            מעבד את התשובות שלך...
          </h2>
          <p className="text-muted-foreground text-lg">
            מנתח את הנתונים ובונה הסבר אישי על שלושת המסלולים המתאימים ביותר עבורך
          </p>
          <div className="mt-8 space-y-3">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // ============ RESULTS ============
  return (
    <div dir="rtl" className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
              התוצאות שלך
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary mb-4">
              שלושת המסלולים המתאימים לך ביותר
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              לפי התשובות שלך, אלו שלושת המסלולים שמשתלבים בצורה הטובה ביותר עם האופי, הכישרונות והשאיפות שלך.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6 text-center text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6 mb-10">
            {topTracks.map((t, i) => {
              const meta = TRACKS[t.id];
              const explain = explanations?.[i];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <Card className="p-6 md:p-8 shadow-soft border-0 bg-card relative overflow-hidden">
                    <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {i + 1}
                    </div>

                    <div className="flex items-start gap-4 mb-5">
                      <div className="text-5xl flex-shrink-0">{meta.emoji}</div>
                      <div>
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">
                          {meta.name}
                        </h3>
                        <p className="text-secondary font-medium text-sm md:text-base">{meta.tagline}</p>
                      </div>
                    </div>

                    {explain?.why && (
                      <div className="mb-5">
                        <h4 className="text-sm font-bold text-primary/70 mb-2 uppercase tracking-wide">למה זה מתאים לך</h4>
                        <p className="text-foreground/90 leading-relaxed">{explain.why}</p>
                      </div>
                    )}

                    {explain?.dayInLife && (
                      <div className="mb-5 bg-muted/30 rounded-lg p-4 border border-border/40">
                        <h4 className="text-sm font-bold text-primary/70 mb-2 uppercase tracking-wide">איך נראה יום עבודה</h4>
                        <p className="text-foreground/80 leading-relaxed text-sm">{explain.dayInLife}</p>
                      </div>
                    )}

                    {explain?.firstStep && (
                      <div className="flex items-start gap-3 bg-secondary/5 rounded-lg p-4 border border-secondary/20">
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-primary mb-1">הצעד הראשון</h4>
                          <p className="text-foreground/80 leading-relaxed text-sm">{explain.firstStep}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-muted/30 rounded-lg p-5 mb-8 border border-border/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                <strong>לתשומת ליבך:</strong> ייתכנו מסלולים מקצועיים נוספים שמתאימים לך מעבר לשבעת אלו —
                הכלי ממקד אותך מבין שבעת המסלולים שזוהו כמבוקשים ומתאימים. מומלץ להמשיך בייעוץ אישי עם גורם מקצועי.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              להתחיל מחדש
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Haredi;
