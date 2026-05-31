import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Download, Sparkles, X, GraduationCap, ArrowLeft } from 'lucide-react';
import owlLogo from '@/assets/owl-logo.png';
import megoLogo from '@/assets/mego-logo.jpg';
import { BOTTLES, RIASEC_NAMES, RIASEC_FULL, TRACKS, type RIASEC } from '@/data/cocktailBottles';
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

// RIASEC → bottle liquid colors + chip + shelf label
const CAT_STYLE: Record<RIASEC, { liquidTop: string; liquidBot: string; glow: string; chip: string; label: string }> = {
  R: { liquidTop: '#fbbf24', liquidBot: '#d97706', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]', chip: 'bg-amber-100 text-amber-900', label: 'ביצועית' },
  I: { liquidTop: '#38bdf8', liquidBot: '#0369a1', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.6)]', chip: 'bg-sky-100 text-sky-900',     label: 'חקרנית' },
  A: { liquidTop: '#f472b6', liquidBot: '#be185d', glow: 'shadow-[0_0_20px_rgba(244,114,182,0.6)]',chip: 'bg-pink-100 text-pink-900',   label: 'אמנותית' },
  S: { liquidTop: '#4ade80', liquidBot: '#15803d', glow: 'shadow-[0_0_20px_rgba(74,222,128,0.6)]', chip: 'bg-emerald-100 text-emerald-900', label: 'חברתית' },
  E: { liquidTop: '#fb923c', liquidBot: '#c2410c', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.6)]', chip: 'bg-orange-100 text-orange-900',label: 'יזמית' },
  C: { liquidTop: '#c084fc', liquidBot: '#7e22ce', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.6)]',chip: 'bg-violet-100 text-violet-900',label: 'מנהלתית' },
};

// SVG bottle component — glass vial with liquid
const BottleVial = ({
  liquidTop, liquidBot, emoji, selected, bubbling,
}: { liquidTop: string; liquidBot: string; emoji: string; selected: boolean; bubbling: boolean }) => {
  const gradId = `g-${liquidTop.replace('#','')}`;
  return (
    <svg viewBox="0 0 80 130" className="w-full h-full drop-shadow-md overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquidTop} stopOpacity="0.95" />
          <stop offset="100%" stopColor={liquidBot} stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`glass-${gradId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
        </linearGradient>
        <clipPath id={`clip-${gradId}`}>
          <path d="M22 50 Q22 45 26 43 L26 35 Q26 32 30 32 L50 32 Q54 32 54 35 L54 43 Q58 45 58 50 L62 115 Q62 122 55 122 L25 122 Q18 122 18 115 Z" />
        </clipPath>
      </defs>
      {/* cork */}
      <rect x="30" y="18" width="20" height="14" rx="2" fill="#8b6f47" />
      <rect x="30" y="18" width="20" height="3" rx="1" fill="#6b5337" />
      {/* neck */}
      <rect x="32" y="28" width="16" height="8" fill="#e8e8e8" opacity="0.4" />
      {/* bottle body outline */}
      <path
        d="M22 50 Q22 45 26 43 L26 35 Q26 32 30 32 L50 32 Q54 32 54 35 L54 43 Q58 45 58 50 L62 115 Q62 122 55 122 L25 122 Q18 122 18 115 Z"
        fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.2"
      />
      {/* liquid */}
      <g clipPath={`url(#clip-${gradId})`}>
        <rect x="0" y="55" width="80" height="80" fill={`url(#${gradId})`} />
        {/* meniscus wave */}
        <path d="M10 58 Q40 54 70 58 L70 65 L10 65 Z" fill={liquidTop} opacity="0.7" />
        {/* bubbles */}
        {bubbling && (
          <>
            <circle cx="32" cy="100" r="2" fill="#fff" opacity="0.7">
              <animate attributeName="cy" values="115;55" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="46" cy="90" r="1.5" fill="#fff" opacity="0.6">
              <animate attributeName="cy" values="115;55" dur="2.8s" begin="0.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.6;0" dur="2.8s" begin="0.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="80" r="1.2" fill="#fff" opacity="0.5">
              <animate attributeName="cy" values="115;55" dur="2.5s" begin="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.5;0" dur="2.5s" begin="1.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </g>
      {/* glass shine */}
      <path
        d="M22 50 Q22 45 26 43 L26 35 Q26 32 30 32 L50 32 Q54 32 54 35 L54 43 Q58 45 58 50 L62 115 Q62 122 55 122 L25 122 Q18 122 18 115 Z"
        fill={`url(#glass-${gradId})`}
      />
      {/* highlight strip */}
      <rect x="24" y="55" width="3" height="55" rx="1.5" fill="#ffffff" opacity="0.4" />
      {/* emoji label on bottle */}
      <foreignObject x="20" y="78" width="40" height="30">
        <div style={{ fontSize: 22, textAlign: 'center', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{emoji}</div>
      </foreignObject>
      {/* selected ring */}
      {selected && (
        <circle cx="40" cy="78" r="34" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.9">
          <animate attributeName="r" values="34;38;34" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
};

const SagiBubble = ({ children, delay = 0.3 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay }}
    className="flex items-start gap-3 max-w-xl mx-auto"
  >
    <div className="relative shrink-0">
      <div className="absolute inset-0 bg-accent/30 blur-xl rounded-full" />
      <img src={owlLogo} alt="סגי" className="relative w-12 h-12 rounded-full bg-card p-1 shadow-md" />
    </div>
    <div className="bg-card/80 backdrop-blur border border-border/60 rounded-2xl rounded-tr-sm p-4 shadow-[var(--shadow-card)] text-foreground text-[17px] leading-relaxed">
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

// Floating bubbles + ambient gradients — game-y atmosphere
const AmbientBG = () => {
  const bubbles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    size: 12 + Math.random() * 28,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 14 + Math.random() * 10,
    hue: ['#f472b6', '#38bdf8', '#4ade80', '#fb923c', '#c084fc', '#fbbf24'][i % 6],
  }));
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full bg-secondary/15 blur-3xl" />
      {bubbles.map(b => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          style={{
            width: b.size, height: b.size, left: `${b.left}%`, bottom: -60,
            background: `radial-gradient(circle at 30% 30%, #fff, ${b.hue}66 60%, transparent 70%)`,
            border: `1px solid ${b.hue}44`,
          }}
          animate={{ y: [0, -window.innerHeight - 100], x: [0, 30, -20, 10], opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

// Co-branded sticky header — MEGO × Sageify
const CoBrandBar = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="flex items-center justify-center gap-3 mb-6 mt-1"
  >
    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-xl border border-border/60 rounded-full px-4 py-2 shadow-md">
      <img src={megoLogo} alt="MEGO" className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-200" />
      <span className="text-xs font-bold text-secondary tracking-wider">MEGO</span>
      <span className="text-xs text-muted-foreground">×</span>
      <span className="text-xs font-bold text-secondary tracking-wider">SAGEIFY</span>
      <img src={owlLogo} alt="Sageify" className="w-8 h-8 rounded-full bg-card p-0.5" />
    </div>
  </motion.div>
);

export default function Cocktail() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [activeBottleId, setActiveBottleId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [processingLine, setProcessingLine] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const [milestone, setMilestone] = useState<string | null>(null);
  const toggleBottle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 14) {
        toast({ title: 'הגעת לתקרה', description: 'מקסימום 14 בקבוקים — הסר אחד כדי להחליף', variant: 'destructive' });
        return prev;
      }
      const next = [...prev, id];
      // Milestone bursts
      const map: Record<number, string> = {
        3: '✨ +30 XP · התחלת לבנות פרופיל',
        6: '🔓 6 בקבוקים — נפתח: ערבב את הקוקטייל!',
        10: '🔥 קומבו פרימיום · עוד 4 לאלוף',
        14: '👑 שייקר מלא · אלוף!',
      };
      if (map[next.length]) {
        setMilestone(map[next.length]);
        setTimeout(() => setMilestone(null), 2200);
      }
      return next;
    });
  };

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

      await cloudClient.from('cocktail_sessions').insert({
        name, email,
        bottles_chosen: selected,
        riasec_scores: scores,
        top_code: topCode,
        character_title: rep.characterTitle || '',
        recommended_track: rep.recommendedTrack || '',
      });

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

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `cocktail-card-${name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      toast({ title: 'שגיאה בהורדה', variant: 'destructive' });
    }
  };

  const profileSummary = useMemo(() => {
    if (!report) return '';
    return `שם: ${name}. תואר הדמות: ${report.characterTitle}. קוד הולנד: ${topCode}. ` +
      `ציוני RIASEC: ${JSON.stringify(scores)}. מסלול מומלץ: ${report.recommendedTrack}.`;
  }, [report, name, topCode, scores]);

  const progressPct = Math.min((selected.length / 14) * 100, 100);
  const canMix = selected.length >= 6;

  return (
    <div className="min-h-screen bg-background py-8 px-4 relative">
      <AmbientBG />

      {/* Milestone burst overlay */}
      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-gradient-to-l from-accent via-primary to-accent text-white font-bold px-6 py-3 rounded-full shadow-2xl text-base ring-4 ring-white/40">
              {milestone}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {(stage === 'welcome' || stage === 'mixer') && <CoBrandBar />}
        <AnimatePresence mode="wait">

          {/* =========== WELCOME =========== */}
          {stage === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <div className="text-center mb-10 mt-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="relative w-28 h-28 mx-auto mb-6"
                >
                  <div className="absolute inset-0 bg-accent/40 blur-2xl rounded-full" />
                  <img src={owlLogo} alt="סגי" className="relative w-full h-full bg-card rounded-full p-2 shadow-lg" />
                </motion.div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">Career Cocktail · Sageify</p>
                <h1 className="text-5xl md:text-6xl font-bold text-secondary mb-3 leading-tight">
                  קוקטייל הקריירה
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  חוויה משחקית של נטיות מקצועיות · בליווי סגי
                </p>
              </div>

              <SagiBubble>
                <p className="mb-2"><strong>שלום, אני סגי.</strong></p>
                <p>בעשר הדקות הקרובות נרכיב יחד את <strong>הקוקטייל המקצועי שלך</strong> — לא שאלון, אלא בחירה. אתה תבחר את הבקבוקים שמדברים אליך, ואני אכתוב לך דוח אישי על איזה <strong>מתוך 6 המסלולים</strong> שלנו הכי מתאים לך.</p>
              </SagiBubble>

              {/* Tracks preview */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="max-w-2xl mx-auto mt-10"
              >
                <div className="flex items-center gap-2 mb-3 justify-center text-secondary">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-sm font-medium tracking-wide">6 מסלולי הלימוד שאליהם תוכוון</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {TRACKS.map(t => (
                    <span key={t.id} className="px-4 py-2 rounded-full bg-card/70 backdrop-blur border border-border text-sm text-secondary shadow-sm">
                      {t.name}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.1 }}
                className="max-w-md mx-auto mt-10"
              >
                <Card className="p-6 space-y-5 bg-card/90 backdrop-blur border-border/60 shadow-xl">
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
                  <Button onClick={submitLead} size="lg" className="w-full h-14 text-lg bg-accent hover:bg-accent/90 group">
                    בוא נתחיל
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition" />
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* =========== MIXER =========== */}
          {stage === 'mixer' && (
            <motion.div key="mixer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-6 mt-2">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">The Lab</p>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-2">המעבדה</h1>
                <p className="text-muted-foreground">בחר בין 6 ל-14 בקבוקים שמדברים אליך</p>
                <p className="text-sm text-accent mt-2 flex items-center justify-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  לחץ על הבקבוק כדי להבין את משמעותו
                </p>
              </div>

              {/* Floating Shaker */}
              <div className="sticky top-2 z-20 mb-8">
                <Card className="p-5 bg-card/95 backdrop-blur-xl border-border/60 shadow-2xl rounded-3xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">🧪</div>
                      <span className="text-base font-semibold text-secondary">השייקר שלך</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-accent tabular-nums">{selected.length}</span>
                      <span className="text-sm text-muted-foreground">/ 14</span>
                    </div>
                  </div>

                  {/* Custom progress with thresholds */}
                  <div className="relative h-2.5 bg-muted rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="absolute inset-y-0 right-0 bg-gradient-to-l from-accent via-primary to-accent rounded-full"
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                    {/* Min threshold marker */}
                    <div className="absolute top-0 bottom-0 right-[42.85%] w-px bg-secondary/40" />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-3">
                    <span>14 מקס׳</span>
                    <span className={canMix ? 'text-accent font-semibold' : ''}>6 מינ׳</span>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[44px]">
                    {selected.length === 0 && (
                      <span className="text-muted-foreground text-sm self-center">השייקר ריק — בחר בקבוק כדי להוסיף</span>
                    )}
                    {selected.map(id => {
                      const b = BOTTLES.find(x => x.id === id)!;
                      const st = CAT_STYLE[b.category];
                      return (
                        <motion.button
                          key={id}
                          layout
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          onClick={() => toggleBottle(id)}
                          className={`${st.chip} rounded-full pr-3 pl-2 py-1.5 text-sm flex items-center gap-1.5 hover:opacity-80 transition shadow-sm`}
                        >
                          <span>{b.emoji}</span>
                          <span className="font-medium">{b.name}</span>
                          <X className="w-3.5 h-3.5 opacity-60" />
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {canMix && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      >
                        <Button onClick={startMix} size="lg" className="w-full h-14 text-lg bg-gradient-to-l from-accent to-primary hover:opacity-90 shadow-lg">
                          <Sparkles className="w-5 h-5 ml-2" />
                          ערבב את הקוקטייל שלי
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>

              {/* Dynamic bottle info panel */}
              <AnimatePresence mode="wait">
                {activeBottleId && (() => {
                  const b = BOTTLES.find(x => x.id === activeBottleId);
                  if (!b) return null;
                  const st = CAT_STYLE[b.category];
                  return (
                    <motion.div
                      key={activeBottleId}
                      initial={{ opacity: 0, y: -12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="mb-6"
                    >
                      <Card
                        className="p-5 bg-card/90 backdrop-blur-xl border-border/60 shadow-xl rounded-2xl overflow-hidden"
                        style={{ borderRight: `4px solid ${st.liquidBot}` }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                            style={{ background: `linear-gradient(135deg, ${st.liquidTop}, ${st.liquidBot})` }}
                          >
                            {b.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-lg font-bold text-secondary">{b.name}</h3>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${st.chip}`}>
                                {RIASEC_FULL[b.category]}
                              </span>
                            </div>
                            <p className="text-[15px] text-foreground/90 leading-relaxed">{b.description}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Sagi nudges */}
              {selected.length === 3 && (
                <div className="mb-6"><SagiBubble delay={0}>אני מתחיל לראות כיוון. תמשיך.</SagiBubble></div>
              )}
              {selected.length === 10 && (
                <div className="mb-6"><SagiBubble delay={0}>זה הופך לפרופיל מעניין. עוד כמה אם בא לך — או עצור כאן.</SagiBubble></div>
              )}

              {/* Wooden bottle shelves — grouped by RIASEC */}
              <div className="space-y-8">
                {(['R','I','A','S','E','C'] as RIASEC[]).map((cat, shelfIdx) => {
                  const bottlesInCat = BOTTLES.filter(b => b.category === cat);
                  const st = CAT_STYLE[cat];
                  const fromX = shelfIdx % 2 === 0 ? 80 : -80;
                  return (
                    <motion.div
                      key={cat}
                      className="relative"
                      initial={{ opacity: 0, x: fromX, y: 20 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Shelf label tag */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${st.chip} text-xs font-bold tracking-wide shadow-sm`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.liquidBot }} />
                          מדף {st.label}
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {bottlesInCat.filter(b => selected.includes(b.id)).length}/{bottlesInCat.length}
                        </span>
                      </div>

                      {/* Shelf surface */}
                      <div className="relative">
                        {/* Bottles row — staggered drop-in */}
                        <motion.div
                          className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 items-end relative z-10 pb-1"
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.2 }}
                          variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
                          }}
                        >
                          {bottlesInCat.map(b => {
                            const isSelected = selected.includes(b.id);
                            return (
                              <motion.button
                                key={b.id}
                                onClick={() => { setActiveBottleId(b.id); toggleBottle(b.id); }}
                                whileTap={{ scale: 0.93 }}
                                whileHover={{ y: -6 }}
                                variants={{
                                  hidden: { opacity: 0, y: -30, scale: 0.85 },
                                  visible: {
                                    opacity: 1, y: isSelected ? -4 : 0, scale: 1,
                                    transition: { type: 'spring', stiffness: 280, damping: 18 },
                                  },
                                }}
                                className={`relative flex flex-col items-center pt-2 pb-1 px-1 rounded-t-xl transition-colors min-h-0
                                  ${isSelected ? `bg-white/40 backdrop-blur-sm ${st.glow}` : 'hover:bg-white/20'}`}
                                style={{ minHeight: 0 }}
                                title={b.description}
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="absolute -top-1 -left-1 z-20 bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-white"
                                  >
                                    ✓
                                  </motion.div>
                                )}
                                <div className="w-14 sm:w-16 md:w-20 h-[100px] sm:h-[120px] md:h-[140px]">
                                  <BottleVial
                                    liquidTop={st.liquidTop}
                                    liquidBot={st.liquidBot}
                                    emoji={b.emoji}
                                    selected={isSelected}
                                    bubbling={isSelected}
                                  />
                                </div>
                                <div className={`mt-1 text-[10px] sm:text-[11px] md:text-xs font-semibold leading-tight text-center px-1 max-w-full
                                  ${isSelected ? 'text-secondary' : 'text-foreground/80'}`}>
                                  {b.name}
                                </div>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                        {/* Wooden shelf board — scales in from center */}
                        <motion.div
                          className="h-3 sm:h-3.5 rounded-md shadow-[0_6px_12px_-4px_rgba(0,0,0,0.3)] origin-center"
                          initial={{ scaleX: 0, opacity: 0 }}
                          whileInView={{ scaleX: 1, opacity: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            background: 'linear-gradient(180deg, #a87750 0%, #8b5e3c 50%, #6b4423 100%)',
                            backgroundImage: `
                              linear-gradient(180deg, #a87750 0%, #8b5e3c 50%, #6b4423 100%),
                              repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 22px)
                            `,
                            backgroundBlendMode: 'multiply',
                          }}
                        />
                        <div className="h-2 rounded-b-full bg-gradient-to-b from-black/15 to-transparent mx-2" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Hint footer */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                💡 גע בבקבוקון כדי להוסיף לשייקר · המראה מעל מעדכן את התקדמותך
              </p>
            </motion.div>
          )}

          {/* =========== PROCESSING =========== */}
          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-[70vh] flex flex-col items-center justify-center text-center relative"
            >
              {/* Rotating rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="absolute w-72 h-72 rounded-full border border-accent/30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute w-56 h-56 rounded-full border border-primary/30"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-accent/50 to-primary/50 blur-3xl"
              />
              <img src={owlLogo} alt="סגי" className="w-28 h-28 relative z-10 mb-8" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={processingLine}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-xl text-secondary font-medium relative z-10"
                >
                  {PROCESSING_LINES[processingLine]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* =========== RESULTS =========== */}
          {stage === 'results' && report && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <SagiBubble>
                <p>סיימתי לעבד. הנה מה שיצא — והכי חשוב: <strong>אני נשאר כאן</strong> בסוף הדוח כדי לדבר על זה איתך.</p>
              </SagiBubble>

              {/* Player Card */}
              <div ref={cardRef} className="max-w-md mx-auto my-10">
                <Card className="relative overflow-hidden bg-gradient-to-br from-secondary via-[hsl(var(--navy-light))] to-secondary text-secondary-foreground p-7 rounded-[28px] shadow-2xl border-0">
                  {/* Decorative shapes */}
                  <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-accent/20 blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-primary/20 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-[10px] uppercase tracking-[0.3em] opacity-70">Career Cocktail</span>
                      <span className="text-xs font-mono opacity-80 bg-white/10 px-2 py-1 rounded-full">{topCode}</span>
                    </div>

                    <h2 className="text-2xl font-bold mb-1 opacity-90">{name}</h2>
                    <p className="text-accent text-3xl font-bold mb-7 leading-tight">{report.characterTitle}</p>

                    <div className="space-y-2.5 mb-6">
                      {(['R','I','A','S','E','C'] as RIASEC[]).map(k => {
                        const max = 4;
                        const v = scores[k];
                        return (
                          <div key={k}>
                            <div className="flex justify-between text-[11px] mb-1 opacity-90">
                              <span className="font-medium">{RIASEC_NAMES[k]}</span>
                              <span className="font-mono">{v}/{max}</span>
                            </div>
                            <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(v / max) * 100}%` }}
                                transition={{ duration: 0.9, delay: 0.2 }}
                                className="h-full bg-gradient-to-l from-accent to-primary rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-white/15 pt-4">
                      <div className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-2">יכולת על</div>
                      <p className="text-[15px] leading-relaxed">{report.superpower}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mb-12">
                <Button onClick={downloadCard} size="lg" variant="outline" className="h-12 rounded-full">
                  <Download className="w-5 h-5 ml-2" /> הורד כרטיס שחקן
                </Button>
              </div>

              {/* Tracks */}
              <div className="mb-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-3">
                    <GraduationCap className="w-4 h-4" />
                    6 מסלולי הלימוד שלנו
                  </div>
                  <h2 className="text-3xl font-bold text-secondary">מותאם אישית — בשבילך</h2>
                </div>

                <div className="space-y-4">
                  {report.tracks?.map((t, idx) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-shadow border-border/60">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-secondary-foreground font-bold text-lg shadow-md">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-secondary mb-2">{t.name}</h3>
                            <p className="text-foreground leading-relaxed">{t.paragraph}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
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
