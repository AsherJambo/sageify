import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { preferenceQuestions, dreamOptions } from '@/data/preferencesData';
import QuestionnaireNav from './QuestionnaireNav';
import { burstConfetti } from '@/lib/confetti';

interface Props {
  onComplete: (
    sliders: Record<string, number | string>,
    preferences: Record<string, string[]>,
    dream: string,
  ) => void;
  onBackToHub?: () => void;
}

const TRAIT_PAIRS = [
  { id: 'routine_innovation', left: 'שגרה ויציבות',  right: 'חדשנות וגמישות', icon: '🔄' },
  { id: 'solo_team',          left: 'עבודה עצמאית',  right: 'עבודה בצוות',     icon: '👥' },
  { id: 'depth_breadth',      left: 'התמחות עמוקה',  right: 'מגוון רחב',       icon: '🔬' },
  { id: 'practical_theoretical', left: 'מעשי ויישומי', right: 'תיאורטי ומחקרי', icon: '⚙️' },
  { id: 'leading_supporting', left: 'הובלה וניהול',   right: 'תמיכה וליווי',    icon: '🎯' },
  { id: 'structured_flexible',left: 'מסגרת קבועה',    right: 'חופש מוחלט',     icon: '📐' },
];

const VALUE_CARDS = [
  { id: 'social_impact',     label: 'השפעה חברתית',     emoji: '🌍' },
  { id: 'personal_growth',   label: 'צמיחה אישית',      emoji: '🌱' },
  { id: 'financial_security',label: 'ביטחון כלכלי',     emoji: '💰' },
  { id: 'legacy',            label: 'מורשת',           emoji: '🏛️' },
  { id: 'community',         label: 'קהילה',           emoji: '🤝' },
  { id: 'creativity',        label: 'יצירתיות',        emoji: '🎨' },
  { id: 'health',            label: 'בריאות',          emoji: '❤️' },
  { id: 'knowledge',         label: 'ידע ומומחיות',    emoji: '📚' },
];

const OPEN_QUESTIONS = [
  { id: 'energizes', label: 'מה הכי ממלא אותך באנרגיה?', placeholder: 'לדוגמה: שיחה משמעותית עם בן אדם...' },
  { id: 'avoid',     label: 'מה הייתי רוצה להימנע ממנו בעיסוק החדש?', placeholder: 'לדוגמה: ביורוקרטיה, לחץ של דדליינים...' },
  { id: 'legacy',    label: 'איזה חותם הייתי רוצה להשאיר?', placeholder: 'במשפט אחד...' },
];

const PreferencesFlowingSliders = ({ onComplete, onBackToHub }: Props) => {
  const [sliders, setSliders] = useState<Record<string, number>>(
    Object.fromEntries(TRAIT_PAIRS.map(t => [t.id, 50]))
  );
  const [values, setValues] = useState<Set<string>>(new Set());
  const [prefs, setPrefs] = useState<Record<string, string[]>>({});
  const [dream, setDream] = useState('');
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const toggleValue = (id: string) => {
    setValues(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const handlePref = (qid: string, opt: string, multi: boolean) => {
    setPrefs(prev => {
      if (multi) {
        const cur = prev[qid] || [];
        return { ...prev, [qid]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] };
      }
      return { ...prev, [qid]: [opt] };
    });
  };

  const allPrefsAnswered = preferenceQuestions.every(q => (prefs[q.id] || []).length > 0);

  const handleComplete = () => {
    if (values.size < 2) { setError('בחרו לפחות 2 ערכים בלב.'); return; }
    if (!allPrefsAnswered) { setError('ענו על כל שאלות ההעדפה.'); return; }
    if (!dream) { setError('בחרו את חלום המגירה.'); return; }
    setError(null);
    const sliderResult: Record<string, number | string> = {
      ...sliders, values: Array.from(values).join(','),
    };
    const finalPrefs = { ...prefs };
    Object.entries(openAnswers).forEach(([k, v]) => {
      if (v.trim()) finalPrefs[`open_${k}`] = [v.trim()];
    });
    burstConfetti();
    onComplete(sliderResult, finalPrefs, dream);
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center px-4 py-10 fade-in">
      <div className="w-full max-w-2xl space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-3"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm border border-secondary/15">
            ● העדפות אישיות
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            מה זורם לך בפנים?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">סליידרים אישיים, שאלות פתוחות וחלום מגירה</p>
        </motion.div>

        {/* Section 1: Flowing sliders */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold font-display text-foreground tracking-wide flex items-center gap-2">
            <span className="text-2xl">🌊</span> מפת הנטיות שלך
          </h3>
          <div className="space-y-3">
            {TRAIT_PAIRS.map((trait, idx) => (
              <motion.div
                key={trait.id}
                initial={{ opacity: 0, x: idx % 2 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.6 }}
                className="bg-card/80 backdrop-blur rounded-3xl p-5 border border-border/60 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between mb-3 text-sm md:text-base font-medium">
                  <span className="text-foreground flex items-center gap-1.5">{trait.right}</span>
                  <span className="text-xl opacity-60">{trait.icon}</span>
                  <span className="text-foreground">{trait.left}</span>
                </div>
                <Slider
                  value={[sliders[trait.id]]}
                  onValueChange={(v) => setSliders(p => ({ ...p, [trait.id]: v[0] }))}
                  min={0} max={100} step={1}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 2: Values */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold font-display text-foreground tracking-wide flex items-center gap-2">
            <span className="text-2xl">❤️</span> 2–3 ערכים בלב
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {VALUE_CARDS.map(card => {
              const sel = values.has(card.id);
              return (
                <motion.button
                  key={card.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleValue(card.id)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    sel ? 'bg-secondary/10 border-secondary shadow-[0_6px_18px_hsl(var(--secondary)/0.25)] scale-[1.03]' :
                    'bg-card border-border/60 hover:border-secondary/30'
                  }`}
                >
                  <div className="text-2xl mb-1">{card.emoji}</div>
                  <div className="text-xs font-bold text-foreground leading-tight">{card.label}</div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Section 3: Preference questions */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold font-display text-foreground tracking-wide flex items-center gap-2">
            <span className="text-2xl">🧭</span> מסגרת ומקום
          </h3>
          {preferenceQuestions.map(q => (
            <div key={q.id} className="bg-card rounded-3xl p-5 border border-border/60 shadow-[var(--shadow-card)]">
              <h4 className="font-bold font-display text-foreground text-base mb-1">{q.title}</h4>
              {q.multiSelect && <p className="text-xs text-muted-foreground mb-3">ניתן לסמן מספר אפשרויות</p>}
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const sel = (prefs[q.id] || []).includes(opt);
                  return (
                    <button
                      key={i}
                      onClick={() => handlePref(q.id, opt, q.multiSelect)}
                      className={`w-full text-right px-4 py-3 rounded-2xl border-2 transition-all text-sm md:text-base ${
                        sel ? 'bg-primary/5 text-foreground border-primary/40 shadow-[var(--shadow-card)]'
                            : 'bg-card text-foreground border-border/60 hover:border-secondary/30'
                      }`}
                    >{opt}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Section 4: Open questions */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold font-display text-foreground tracking-wide flex items-center gap-2">
            <span className="text-2xl">✍️</span> שאלות פתוחות
          </h3>
          {OPEN_QUESTIONS.map(q => (
            <div key={q.id} className="bg-card rounded-3xl p-5 border border-border/60 shadow-[var(--shadow-card)]">
              <label className="block font-medium text-foreground text-sm md:text-base mb-2">{q.label}</label>
              <Textarea
                value={openAnswers[q.id] || ''}
                onChange={(e) => setOpenAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                placeholder={q.placeholder}
                maxLength={300}
                className="rounded-2xl border-border/60 bg-background min-h-[80px] resize-none text-base"
              />
              <p className="text-xs text-muted-foreground mt-1 text-left">{(openAnswers[q.id] || '').length}/300</p>
            </div>
          ))}
        </section>

        {/* Section 5: Dream */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold font-display text-foreground tracking-wide flex items-center gap-2">
            <span className="text-2xl">✦</span> חלום המגירה
          </h3>
          <p className="text-sm text-muted-foreground">אם תוכלו לבחור תחום אחד שתמיד רציתם — מה זה יהיה?</p>
          <div className="flex flex-wrap gap-2">
            {dreamOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => setDream(opt)}
                className={`px-4 py-2.5 rounded-full text-sm md:text-base font-medium border-2 transition-all ${
                  dream === opt ? 'bg-secondary text-secondary-foreground border-secondary shadow-md'
                                : 'bg-card text-foreground border-border/60 hover:border-secondary/30'
                }`}
              >{opt}</button>
            ))}
          </div>
        </section>

        {error && (
          <div className="text-center p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive font-medium text-sm">
            {error}
          </div>
        )}

        <QuestionnaireNav
          showPrev={false}
          showComplete
          onComplete={handleComplete}
          completeDisabled={false}
          completeLabel="סיום שאלון העדפות"
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default PreferencesFlowingSliders;
