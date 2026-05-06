import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Sparkles, CheckCircle2, Info, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { celebrationConfetti, sparkleConfetti } from '@/lib/confetti';

// ============ TRACKS ============
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

const TRACK_IDS: TrackId[] = ['electricity', 'software', 'construction', 'machinery', 'auto', 'medical_devices', 'health_support'];

// ============ TYPES ============
type SectionId = 'skills' | 'inclinations' | 'workstyle' | 'aspirations' | 'values';
type Step = 'welcome' | 'hub' | SectionId | 'loading' | 'results';

interface Question {
  id: string;
  text: string;
  weights: Partial<Record<TrackId, number>>;
}

interface Section {
  id: SectionId;
  title: string;
  desc: string;
  icon: string;
  duration: string;
  questions: Question[];
  scale: { v: number; label: string }[];
}

// ============ SCALES ============
const SCALE_AGREEMENT = [
  { v: 5, label: 'מאוד מתאים לי' },
  { v: 4, label: 'די מתאים לי' },
  { v: 3, label: 'במידה בינונית' },
  { v: 2, label: 'לא ממש' },
  { v: 1, label: 'בכלל לא' },
];

const SCALE_IMPORTANCE = [
  { v: 5, label: 'חשוב לי מאוד' },
  { v: 4, label: 'חשוב לי' },
  { v: 3, label: 'בינוני' },
  { v: 2, label: 'פחות חשוב' },
  { v: 1, label: 'לא חשוב לי' },
];

// ============ SECTIONS ============
const SECTIONS: Section[] = [
  {
    id: 'skills',
    title: 'כישורים וטבע אישי',
    desc: 'מה אתה טוב בו ומה מושך אותך לעשות בידיים',
    icon: '🛠️',
    duration: '3–4 דק׳',
    scale: SCALE_AGREEMENT,
    questions: [
      { id: 's1', text: 'אני נהנה לפרק ולהרכיב דברים, להבין איך מכשירים עובדים מבפנים', weights: { electricity: 3, machinery: 3, auto: 3, medical_devices: 2 } },
      { id: 's2', text: 'יש לי סבלנות לדיוק רב ולעבודה מדויקת מאוד', weights: { machinery: 3, medical_devices: 3, electricity: 2, software: 1 } },
      { id: 's3', text: 'אני אוהב לזהות תקלות ולגלות מה השתבש – כמו בלש', weights: { auto: 3, electricity: 3, software: 2, medical_devices: 2 } },
      { id: 's4', text: 'אני לומד הכי טוב כשאני עושה בידיים, לא רק מקריאה', weights: { electricity: 2, machinery: 2, auto: 2, construction: 3 } },
      { id: 's5', text: 'אני מעדיף לעבוד עם מספרים, נוסחאות ומבנים מופשטים', weights: { software: 3, medical_devices: 1 } },
      { id: 's6', text: 'אני סבלני וזורם עם אנשים, גם כשהם במצוקה', weights: { health_support: 3 } },
    ],
  },
  {
    id: 'inclinations',
    title: 'נטיות תעסוקתיות',
    desc: 'איזה סוג עבודה הכי מדבר אליך',
    icon: '🧭',
    duration: '3–4 דק׳',
    scale: SCALE_AGREEMENT,
    questions: [
      { id: 'i1', text: 'מתאים לי לשבת שעות מול מסך ולפתור חידות לוגיות', weights: { software: 3, medical_devices: 1 } },
      { id: 'i2', text: 'אני מעדיף עבודה פיזית ופעילה על פני עבודה משרדית', weights: { construction: 3, electricity: 2, auto: 2, machinery: 1 } },
      { id: 'i3', text: 'משוך אותי עולם הטכנולוגיה המתקדמת והחדשנות', weights: { software: 3, medical_devices: 3, machinery: 2 } },
      { id: 'i4', text: 'מתאים לי לעבוד בחוץ, גם כשהמזג אוויר משתנה', weights: { construction: 3, electricity: 2 } },
      { id: 'i5', text: 'חשוב לי לעזור לאנשים באופן ישיר ולראות את ההשפעה שלי', weights: { health_support: 3, medical_devices: 2 } },
      { id: 'i6', text: 'אני רואה את עצמי בונה דברים פיזיים גדולים שנשארים לדורות', weights: { construction: 3, electricity: 1 } },
    ],
  },
  {
    id: 'workstyle',
    title: 'סביבת עבודה וסגנון',
    desc: 'איזה סוג סביבה מתאימה לאופי שלך',
    icon: '🏢',
    duration: '2–3 דק׳',
    scale: SCALE_IMPORTANCE,
    questions: [
      { id: 'w1', text: 'נוח לי בסביבה שקטה ומסודרת כמו בית חולים או מעבדה', weights: { health_support: 3, medical_devices: 3 } },
      { id: 'w2', text: 'אני מעדיף לעבוד בכל יום במקום אחר ולא להיות תקוע במשרד', weights: { electricity: 3, auto: 2, construction: 2 } },
      { id: 'w3', text: 'חשוב לי שיהיה לי שקט וריכוז – בלי הפרעות חברתיות', weights: { software: 3, machinery: 2, medical_devices: 2 } },
      { id: 'w4', text: 'אני אוהב לעבוד בצוות, עם אנשים סביבי לאורך כל היום', weights: { construction: 2, health_support: 3 } },
      { id: 'w5', text: 'חשובה לי גמישות בשעות העבודה ובסביבת העבודה', weights: { software: 3 } },
      { id: 'w6', text: 'מתאים לי לעבוד עם מכונות מתקדמות במפעל מודרני', weights: { machinery: 3, medical_devices: 2 } },
    ],
  },
  {
    id: 'aspirations',
    title: 'שאיפות פרנסה',
    desc: 'איזה מסלול קריירה מתאים לך מבחינה כלכלית',
    icon: '💼',
    duration: '2–3 דק׳',
    scale: SCALE_IMPORTANCE,
    questions: [
      { id: 'a1', text: 'אני רואה את עצמי פותח עסק עצמאי תוך כמה שנים', weights: { electricity: 3, auto: 3, construction: 2 } },
      { id: 'a2', text: 'חשוב לי שכר גבוה ופוטנציאל הכנסה משמעותי', weights: { software: 3, medical_devices: 2, machinery: 1 } },
      { id: 'a3', text: 'אני מעדיף יציבות, משכורת קבועה ועבודה במקום מסודר', weights: { health_support: 3, medical_devices: 2, machinery: 2 } },
      { id: 'a4', text: 'חשוב לי להגיע לפרנסה כמה שיותר מהר, גם בלי תואר ארוך', weights: { electricity: 3, auto: 3, construction: 2 } },
      { id: 'a5', text: 'אני מוכן להשקיע 2-3 שנות לימוד אינטנסיביות בשביל מקצוע מתגמל', weights: { software: 3, medical_devices: 3 } },
      { id: 'a6', text: 'מעניין אותי לעבוד גם עם לקוחות מחו"ל ולהרוויח במטבע זר', weights: { software: 3 } },
    ],
  },
  {
    id: 'values',
    title: 'ערכים והתאמה אישית',
    desc: 'מה באמת חשוב לך מעבר לכסף ולמקצוע',
    icon: '✦',
    duration: '2–3 דק׳',
    scale: SCALE_IMPORTANCE,
    questions: [
      { id: 'v1', text: 'חשוב לי שהעבודה תאפשר לי זמן איכות עם המשפחה', weights: { software: 3, electricity: 2, auto: 2, health_support: 1 } },
      { id: 'v2', text: 'אני מחפש מקצוע שיש בו תחושת שליחות ותרומה לזולת', weights: { health_support: 3, medical_devices: 2 } },
      { id: 'v3', text: 'חשוב לי שהמקצוע יהיה מבוקש גם בעוד 20 שנה', weights: { electricity: 3, software: 3, medical_devices: 3, health_support: 2 } },
      { id: 'v4', text: 'אני מעדיף סביבה שמכבדת את אורח החיים שלי ולא מחייבת פשרות', weights: { electricity: 2, auto: 2, software: 3, health_support: 3, medical_devices: 2 } },
      { id: 'v5', text: 'חשוב לי לראות תוצאה מוחשית בסוף יום העבודה', weights: { electricity: 3, construction: 3, auto: 3, machinery: 2 } },
      { id: 'v6', text: 'אני מחפש מסלול שאפשר להתפתח בו ולא לעמוד במקום', weights: { software: 3, medical_devices: 3, machinery: 2 } },
    ],
  },
];

const SECTION_BY_ID: Record<SectionId, Section> = SECTIONS.reduce((acc, s) => { acc[s.id] = s; return acc; }, {} as Record<SectionId, Section>);

// ============ STATE ============
interface SavedState {
  step: Step;
  answers: Record<SectionId, Record<string, number>>;
}

const STORAGE_KEY = 'sageify-haredi-state';

const initialState: SavedState = {
  step: 'welcome',
  answers: { skills: {}, inclinations: {}, workstyle: {}, aspirations: {}, values: {} },
};

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch {}
  return initialState;
}

interface AIExplanation {
  name: string;
  why: string;
  dayInLife: string;
  firstStep: string;
}

// ============ MAIN ============
const Haredi = () => {
  const [state, setState] = useState<SavedState>(loadState);
  const [topTracks, setTopTracks] = useState<{ id: TrackId; score: number }[]>([]);
  const [explanations, setExplanations] = useState<AIExplanation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [state.step]);

  const completedSections = useMemo(() => {
    const map: Record<SectionId, boolean> = { skills: false, inclinations: false, workstyle: false, aspirations: false, values: false };
    SECTIONS.forEach((s) => {
      map[s.id] = s.questions.every((q) => state.answers[s.id]?.[q.id] !== undefined);
    });
    return map;
  }, [state.answers]);

  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const hasMinimum = completedCount >= 3;

  const update = (partial: Partial<SavedState>) => setState((p) => ({ ...p, ...partial }));

  const handleAnswer = (sectionId: SectionId, qid: string, value: number) => {
    setState((p) => ({
      ...p,
      answers: { ...p.answers, [sectionId]: { ...p.answers[sectionId], [qid]: value } },
    }));
  };

  const calculateTopTracks = () => {
    const scores: Record<TrackId, number> = {
      electricity: 0, software: 0, construction: 0, machinery: 0, auto: 0, medical_devices: 0, health_support: 0,
    };
    SECTIONS.forEach((s) => {
      const sectAnswers = state.answers[s.id] || {};
      s.questions.forEach((q) => {
        const a = sectAnswers[q.id];
        if (a === undefined) return;
        Object.entries(q.weights).forEach(([t, w]) => {
          scores[t as TrackId] += a * (w as number);
        });
      });
    });
    return (Object.entries(scores) as [TrackId, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ id, score }))
      .slice(0, 3);
  };

  const handleViewResults = async () => {
    if (!hasMinimum) return;
    const top = calculateTopTracks();
    setTopTracks(top);
    update({ step: 'loading' });
    setError(null);

    // Build profile from answers
    const profile: { q: string; answer: number }[] = [];
    SECTIONS.forEach((s) => {
      s.questions.forEach((q) => {
        const a = state.answers[s.id]?.[q.id];
        if (a !== undefined) profile.push({ q: q.text, answer: a });
      });
    });

    try {
      const { data, error: err } = await supabase.functions.invoke('haredi-match', {
        body: { topTracks: top.map((t) => TRACKS[t.id].name), profile },
      });
      if (err) throw err;
      if (data?.tracks?.length) {
        setExplanations(data.tracks);
      } else {
        setExplanations(top.map((t) => ({ name: TRACKS[t.id].name, why: TRACKS[t.id].tagline, dayInLife: '', firstStep: '' })));
      }
    } catch (e) {
      console.error(e);
      setError('לא הצלחנו לקבל הסבר אישי כעת. הנה התוצאות הבסיסיות:');
      setExplanations(top.map((t) => ({ name: TRACKS[t.id].name, why: TRACKS[t.id].tagline, dayInLife: '', firstStep: '' })));
    }
    update({ step: 'results' });
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setTopTracks([]);
    setExplanations(null);
    setError(null);
  };

  // ========== RENDER ==========
  if (state.step === 'welcome') return <WelcomeView onStart={() => update({ step: 'hub' })} />;
  if (state.step === 'hub') return (
    <HubView
      completed={completedSections}
      onSelect={(id) => update({ step: id })}
      onViewResults={handleViewResults}
      onRestart={handleRestart}
    />
  );
  if (state.step === 'loading') return <LoadingView />;
  if (state.step === 'results') return <ResultsView topTracks={topTracks} explanations={explanations} error={error} onRestart={handleRestart} onBackToHub={() => update({ step: 'hub' })} />;

  // questionnaire view
  const section = SECTION_BY_ID[state.step as SectionId];
  if (!section) return <WelcomeView onStart={() => update({ step: 'hub' })} />;

  return (
    <SectionView
      section={section}
      answers={state.answers[section.id] || {}}
      onAnswer={(qid, v) => handleAnswer(section.id, qid, v)}
      onComplete={() => update({ step: 'hub' })}
      onBackToHub={() => update({ step: 'hub' })}
    />
  );
};

// ============ WELCOME VIEW ============
const WelcomeView = ({ onStart }: { onStart: () => void }) => (
  <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl w-full">
      <Card className="p-8 md:p-12 shadow-soft border-0 bg-card">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6">
            כיוון מקצועי
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight">
            המסלול המקצועי שלך
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            תהליך אבחון מקצועי קצר שעוזר לך לבחור מקצוע שמתאים לאופי, לכישרונות ולשאיפות —
            מבין שבעה מסלולי הכשרה מבוקשים ומכבדים.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-5 mb-8 border border-border/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/80 leading-relaxed">
              <p className="font-semibold mb-1">איך זה עובד:</p>
              <p className="mb-2">
                לפניך 5 שאלונים קצרים. <span className="font-semibold">בחר לפחות 3</span> שמרגישים לך הכי רלוונטיים — אפשר גם למלא את כולם.
              </p>
              <p>בסיום נציג לך את 3 המסלולים המתאימים לך ביותר, עם הסבר אישי וצעד ראשון מעשי.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {TRACK_IDS.map((id) => (
            <div key={id} className="bg-muted/40 rounded-lg p-3 text-center border border-border/40">
              <div className="text-2xl mb-1">{TRACKS[id].emoji}</div>
              <div className="text-sm font-semibold text-primary">{TRACKS[id].name}</div>
            </div>
          ))}
        </div>

        <div className="bg-secondary/5 rounded-lg p-4 mb-6 border border-secondary/20 text-sm text-foreground/80 leading-relaxed">
          <p>
            <span className="font-semibold">שים לב:</span> קיימים כמובן מסלולים מקצועיים נוספים בעולם.
            הכלי הזה ממקד אותך מבין שבעת המסלולים שזוהו כרלוונטיים, מבוקשים ומתאימים במיוחד.
          </p>
        </div>

        <Button
          size="lg"
          onClick={onStart}
          className="w-full text-lg py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <Sparkles className="w-5 h-5 ml-2" />
          להתחיל את התהליך
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ההתקדמות שלך נשמרת אוטומטית • ללא רישום
        </p>
      </Card>
    </motion.div>
  </div>
);

// ============ HUB VIEW ============
const HubView = ({
  completed, onSelect, onViewResults, onRestart,
}: {
  completed: Record<SectionId, boolean>;
  onSelect: (id: SectionId) => void;
  onViewResults: () => void;
  onRestart: () => void;
}) => {
  const completedCount = Object.values(completed).filter(Boolean).length;
  const hasMinimum = completedCount >= 3;
  const prevCount = useRef(completedCount);

  useEffect(() => {
    if (completedCount > prevCount.current) {
      if (completedCount === 3 || completedCount === SECTIONS.length) celebrationConfetti();
      else sparkleConfetti();
    }
    prevCount.current = completedCount;
  }, [completedCount]);

  return (
    <div dir="rtl" className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
            הבחירה שלך
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">
            בחר את השאלונים שלך
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            5 שאלונים קצרים. השלם <span className="font-semibold text-foreground">לפחות 3</span> כדי לקבל המלצות. אפשר בכל סדר.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border/60 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">התקדמות</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} מתוך {SECTIONS.length} {hasMinimum ? '✦' : '(מומלץ: 3+)'}
            </span>
          </div>
          <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / SECTIONS.length) * 100}%` }}
              transition={{ duration: 0.7 }}
            />
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTIONS.map((s, i) => {
            const isDone = completed[s.id];
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(s.id)}
                className={`relative text-right p-6 rounded-2xl border shadow-soft transition-all ${
                  isDone ? 'bg-secondary/[0.04] border-secondary/30' : 'bg-card border-border/60 hover:border-secondary/30'
                }`}
              >
                {isDone && (
                  <span className="absolute -top-3 -left-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                    הושלם ✓
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                    isDone ? 'bg-secondary/15 text-secondary' : 'bg-muted/40'
                  }`}>
                    {isDone ? '✓' : s.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-display font-bold text-primary text-lg">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    <p className="text-xs text-muted-foreground">⏱ {s.duration} • {s.questions.length} שאלות</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center space-y-4 pb-8">
          {!hasMinimum && (
            <p className="text-sm text-muted-foreground bg-card border border-border/60 rounded-xl px-5 py-3 inline-block">
              📋 השלם לפחות 3 שאלונים כדי לקבל תוצאות ({completedCount}/3)
            </p>
          )}
          <div>
            <Button
              size="lg"
              onClick={onViewResults}
              disabled={!hasMinimum}
              className="px-10 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              לתוצאות שלי
            </Button>
          </div>
          {completedCount > 0 && (
            <button onClick={onRestart} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-4">
              <RotateCcw className="w-3 h-3" />
              להתחיל מחדש
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ============ SECTION (Questionnaire) VIEW ============
const SectionView = ({
  section, answers, onAnswer, onComplete, onBackToHub,
}: {
  section: Section;
  answers: Record<string, number>;
  onAnswer: (qid: string, v: number) => void;
  onComplete: () => void;
  onBackToHub: () => void;
}) => {
  const [qIndex, setQIndex] = useState(() => {
    const firstUnanswered = section.questions.findIndex((q) => answers[q.id] === undefined);
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });

  const q = section.questions[qIndex];
  const progress = ((qIndex + 1) / section.questions.length) * 100;
  const currentAnswer = answers[q.id];

  const handle = (v: number) => {
    onAnswer(q.id, v);
    if (qIndex < section.questions.length - 1) {
      setTimeout(() => setQIndex(qIndex + 1), 200);
    } else {
      setTimeout(() => { sparkleConfetti(); onComplete(); }, 250);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-muted/30">
        <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-16 pb-12">
        <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
          <button onClick={onBackToHub} className="flex items-center gap-1 hover:text-primary transition-colors">
            <ChevronRight className="w-4 h-4" />
            חזרה לרשימה
          </button>
          <span>{qIndex + 1} / {section.questions.length}</span>
        </div>

        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-2">
            {section.icon} {section.title}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="p-6 md:p-10 shadow-soft border-0 bg-card mb-6">
              <h2 className="font-display text-xl md:text-2xl font-bold text-primary leading-relaxed mb-6 text-center">
                {q.text}
              </h2>

              <div className="space-y-3">
                {section.scale.map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => handle(opt.v)}
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

            {qIndex > 0 && (
              <button
                onClick={() => setQIndex(qIndex - 1)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← לשאלה הקודמת
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============ LOADING VIEW ============
const LoadingView = () => (
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

// ============ RESULTS VIEW ============
const ResultsView = ({
  topTracks, explanations, error, onRestart, onBackToHub,
}: {
  topTracks: { id: TrackId; score: number }[];
  explanations: AIExplanation[] | null;
  error: string | null;
  onRestart: () => void;
  onBackToHub: () => void;
}) => (
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
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.15 }}>
                <Card className="p-6 md:p-8 shadow-soft border-0 bg-card relative overflow-hidden">
                  <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {i + 1}
                  </div>

                  <div className="flex items-start gap-4 mb-5">
                    <div className="text-5xl flex-shrink-0">{meta.emoji}</div>
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">{meta.name}</h3>
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

        <div className="bg-muted/30 rounded-lg p-5 mb-8 border border-border/50 text-sm text-foreground/80 leading-relaxed">
          <p className="font-semibold mb-1">הערה חשובה:</p>
          <p>
            קיימים כמובן מסלולים מקצועיים נוספים. ההמלצות כאן ממוקדות מבין שבעת המסלולים הרלוונטיים שזוהו כמתאימים במיוחד.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg" onClick={onBackToHub} className="text-base">
            חזרה לרשימת השאלונים
          </Button>
          <Button variant="ghost" size="lg" onClick={onRestart} className="text-base text-muted-foreground">
            <RotateCcw className="w-4 h-4 ml-2" />
            להתחיל מחדש
          </Button>
        </div>
      </motion.div>
    </div>
  </div>
);

export default Haredi;
