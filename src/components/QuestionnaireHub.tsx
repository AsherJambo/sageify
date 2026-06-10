import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import sageifyLogo from '@/assets/owl-logo.png';
import OwlMessage from '@/components/OwlMessage';
import { celebrationConfetti, sparkleConfetti } from '@/lib/confetti';

type QuestionnaireSectionId = 'skills' | 'schein' | 'considerations' | 'holland' | 'via' | 'preferences' | 'motivation' | 'thinking';

interface QuestionnaireHubProps {
  completedSections: Record<QuestionnaireSectionId, boolean>;
  onSelect: (id: QuestionnaireSectionId) => void;
  onViewResults: () => void;
  minimumRequired?: number;
}

interface GameCard {
  id: QuestionnaireSectionId;
  emoji: string;
  title: string;
  style: string;
  tagline: string;
  minutes: string;
  tone: string;
}

const games: GameCard[] = [
  { id: 'holland',        emoji: '🧭', title: 'מצפן נטיות',       style: 'Holland · בלי כותרות',          tagline: 'שאלון מעורבב — בלי קטגוריות, רק תחושה',          minutes: '5 דק׳', tone: 'from-sky/15 to-sky/5' },
  { id: 'via',            emoji: '✨', title: 'מסע חוזקות',        style: 'VIA · 5 חוזקות־על',              tagline: 'מצאו את החוזקות שמדליקות אתכם',                   minutes: '7 דק׳', tone: 'from-sunny/15 to-sunny/5' },
  { id: 'schein',         emoji: '⚓', title: 'עוגנים תעסוקתיים', style: 'Schein · Linear Journey',         tagline: 'שאלה אחת בכל פעם — מה באמת מעגן אתכם',            minutes: '6 דק׳', tone: 'from-secondary/15 to-secondary/5' },
  { id: 'motivation',     emoji: '🌱', title: 'מניעים וכוונות',    style: 'Mixer Garden — צנצנות',           tagline: 'מלאו את הצנצנות שמגדירות את הפרק הבא',            minutes: '4 דק׳', tone: 'from-success/15 to-success/5' },
  { id: 'thinking',       emoji: '🧩', title: 'חשיבה גמישה',       style: 'כרטיסים מתפצחים',                 tagline: 'פצחו דפוסים — כרטיס אחר כרטיס',                   minutes: '6 דק׳', tone: 'from-coral/15 to-coral/5' },
  { id: 'skills',         emoji: '🏆', title: 'ארגז כלים',         style: '4 עמודות גרירה',                  tagline: 'מיינו כישורים: זוכים · שורפים · שואפים · לא רלוונטי', minutes: '5 דק׳', tone: 'from-success/15 to-success/5' },
  { id: 'considerations', emoji: '⚖',  title: 'שיקולים בעיסוק',    style: 'ענן תגיות אינטראקטיבי',           tagline: 'בחרו ושקללו — 100 נקודות, ענן אחד',               minutes: '4 דק׳', tone: 'from-primary/15 to-primary/5' },
  { id: 'preferences',    emoji: '🌊', title: 'הזרם האישי',        style: 'סליידרים זורמים + חלום',          tagline: 'בין קצוות, ערכים וחלום־מגירה אחד שלכם',           minutes: '6 דק׳', tone: 'from-sky/15 to-sky/5' },
];

const getHubEncouragement = (completed: number, lastName?: string): string | null => {
  if (completed === 0) return 'בחרו משחק שמדבר אליכם — אין סדר נכון. אני מלווה אתכם בדרך 🦉';
  if (completed === 1) return `יופי! סיימתם את שאלון ה${lastName} 🌿 כל משחק נוסף מחדד את התמונה.`;
  if (completed === 2) return `שני משחקים מאחוריכם — מתחילה להצטייר תמונה מעניינת 🔍 עוד אחד ונוכל לדבר על כיוונים.`;
  if (completed === 3) return `שלושה משחקים ✦ יש לי מספיק כדי להתחיל לייעץ. רוצים להמשיך או לעבור לתוצאות?`;
  if (completed === 4) return `ארבעה משחקים — יש לי כבר הרבה מה לספר 🪶 כל אחד נוסף מדייק עוד יותר.`;
  if (completed === 5) return `חמישה משחקים — התמונה ברורה מאוד! עוד קצת ותראו את המלוא ✨`;
  if (completed === 6) return `כמעט סיימתם! נשארו עוד 2 משחקים לתמונה המלאה 🎯`;
  if (completed === 7) return `אתם על קו הסיום — עוד משחק אחד! 🔥`;
  return `כל הכבוד! השלמתם את כל 8 המשחקים 🎉 התמונה המלאה מוכנה — בואו ניפגש לשיחה`;
};

const SECTION_SHORT_NAME: Record<QuestionnaireSectionId, string> = {
  skills: 'כישורים', schein: 'עוגנים', considerations: 'שיקולים',
  holland: 'נטיות', via: 'חוזקות VIA', preferences: 'העדפות',
  motivation: 'מניעים', thinking: 'חשיבה',
};

const QuestionnaireHub = ({ completedSections, onSelect, onViewResults, minimumRequired = 3 }: QuestionnaireHubProps) => {
  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const hasMinimum = completedCount >= minimumRequired;
  const prevCount = useRef(completedCount);

  const lastCompletedName = useMemo(() => {
    const completed = games.filter(g => completedSections[g.id]);
    return completed.length ? SECTION_SHORT_NAME[completed[completed.length - 1].id] : undefined;
  }, [completedSections]);

  const encouragement = getHubEncouragement(completedCount, lastCompletedName);

  useEffect(() => {
    if (completedCount > prevCount.current) {
      if (completedCount === 3 || completedCount === games.length) celebrationConfetti();
      else if (completedCount > 0) sparkleConfetti();
    }
    prevCount.current = completedCount;
  }, [completedCount]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 px-4 py-10 md:py-14">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: 0.6, delay: 0.3, type: 'spring' }}
            className="absolute top-0 right-2 md:right-8 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg inline-flex items-center gap-1.5 z-10"
            style={{ transform: 'rotate(-6deg)' }}
          >
            <Sparkles size={12} /> 8 משחקים
          </motion.div>

          <img src={sageifyLogo} alt="Sageify" className="w-20 h-20 mx-auto rounded-full shadow-[var(--shadow-card)] border-2 border-white/15 mb-4" />

          <span className="inline-block text-xs font-semibold tracking-widest text-secondary uppercase mb-3 px-3 py-1 rounded-full bg-secondary/10">
            🎮 מרכז המשחקים של סגי
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            בחרו משחק והתחילו
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            שמונה משחקים קצרים — כל אחד חושף עוד פיסה מהפרופיל שלכם.
            <br className="hidden sm:block" />
            אפשר לשחק בכל סדר. מומלץ להשלים לפחות 3 כדי לקבל ייעוץ מדויק.
          </p>
        </motion.header>

        {/* Progress + level badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-card border border-border/60 rounded-2xl p-5 shadow-[var(--shadow-card)] relative max-w-2xl mx-auto"
        >
          <motion.div
            key={completedCount}
            initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 250, damping: 14 }}
            className="absolute -top-3 -left-3 bg-success text-success-foreground text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md font-display"
            style={{ transform: 'rotate(-4deg)' }}
          >
            {completedCount === 0 ? '🌱 מתחילים' :
             completedCount < 3 ? `⭐ רמה ${completedCount}` :
             completedCount < 6 ? `🔥 רמה ${completedCount}` :
             completedCount < 8 ? `✨ רמה ${completedCount}` :
             '🏆 אלוף!'}
          </motion.div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-display font-semibold text-foreground tracking-wide">התקדמות</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} מתוך {games.length} {hasMinimum ? '✦' : `(מומלץ: 3+)`}
            </span>
          </div>
          <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-l from-coral via-sunny to-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / games.length) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>

        {/* Sagi encouragement */}
        {encouragement && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <OwlMessage
              message={encouragement}
              variant={completedCount >= 6 ? 'celebration' : completedCount >= 3 ? 'encouragement' : 'tip'}
            />
          </motion.div>
        )}

        {/* Game grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((g, i) => {
            const completed = completedSections[g.id];
            return (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                whileTap={{ y: 2 }}
                onClick={() => onSelect(g.id)}
                style={{ boxShadow: `0 6px 0 0 hsl(var(--foreground) / ${completed ? 0.22 : 0.14})` }}
                className={`group relative text-right h-full p-6 rounded-2xl bg-gradient-to-br ${g.tone} border-2 transition-all duration-200 ${
                  completed
                    ? 'border-success/50'
                    : 'border-foreground/15 hover:border-accent/60'
                }`}
              >
                {completed && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 14 }}
                    className="absolute -top-3 -left-3 bg-success text-success-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-md font-display z-10"
                    style={{ transform: 'rotate(6deg)' }}
                  >
                    הושלם ✓
                  </motion.span>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    {g.emoji}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/70 text-muted-foreground">
                      ⏱ {g.minutes}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                  {g.style}
                </p>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">{g.title}</h2>
                <p className="text-base text-muted-foreground leading-relaxed">{g.tagline}</p>
                <div className={`mt-5 text-sm font-bold inline-flex items-center gap-1 transition-opacity ${
                  completed ? 'text-success opacity-90' : 'text-secondary opacity-70 group-hover:opacity-100'
                }`}>
                  {completed ? 'שחקו שוב' : 'שחקו עכשיו'} <span aria-hidden>←</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center space-y-4 pb-8"
        >
          {!hasMinimum && minimumRequired > 0 && (
            <p className="text-base text-muted-foreground bg-card border border-border/60 rounded-2xl px-6 py-4 inline-block shadow-[var(--shadow-card)]">
              📋 השלימו לפחות {minimumRequired} משחקים כדי לקבל ייעוץ ({completedCount}/{minimumRequired})
            </p>
          )}
          <div>
            <motion.button
              onClick={hasMinimum ? () => { celebrationConfetti(); onViewResults(); } : undefined}
              disabled={!hasMinimum}
              animate={hasMinimum ? { y: [0, -3, 0] } : {}}
              transition={hasMinimum ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
              style={hasMinimum ? { boxShadow: '0 8px 0 0 hsl(var(--foreground) / 0.25)' } : undefined}
              className={`px-12 py-5 rounded-2xl text-lg font-bold font-display tracking-wide border-2 transition-all duration-200 group ${
                hasMinimum
                  ? 'bg-destructive text-destructive-foreground border-foreground/15 hover:-translate-y-[2px] active:translate-y-[3px] active:shadow-none cursor-pointer'
                  : 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60'
              }`}
            >
              <span className="flex items-center gap-3 justify-center">
                לשיחה עם סגי ולתיאום פגישה
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-[6px]">←</span>
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestionnaireHub;
