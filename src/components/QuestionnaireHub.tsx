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
}

const questionnaires: { id: QuestionnaireSectionId; title: string; desc: string; icon: string; duration: string; sticker: string; rotate: string }[] = [
  { id: 'skills', title: 'כישורים ותנאי סף', desc: 'מיינו 20 כישורים לארגז הכלים שלכם', icon: '◆', duration: '5–7 דק׳', sticker: '🏆 ארגז כלים', rotate: '-rotate-2' },
  { id: 'schein', title: 'עוגנים תעסוקתיים', desc: 'גלו מה באמת מניע אתכם בעשייה', icon: '⚓', duration: '8–10 דק׳', sticker: '⚓ עוגנים', rotate: 'rotate-2' },
  { id: 'considerations', title: 'שיקולים בבחירת עיסוק', desc: 'בחרו ותעדפו את השיקולים החשובים לכם', icon: '⚖', duration: '5–7 דק׳', sticker: '⚖ ערכים', rotate: '-rotate-1' },
  { id: 'holland', title: 'נטיות תעסוקתיות', desc: 'גלו את הנטיות המקצועיות שלכם', icon: '🧭', duration: '10–12 דק׳', sticker: '🧭 כן/לא', rotate: 'rotate-1' },
  { id: 'via', title: 'חוזקות VIA', desc: 'גלו את הכוחות הפנימיים שלכם', icon: '✦', duration: '8–10 דק׳', sticker: '✦ חוזקות', rotate: '-rotate-2' },
  { id: 'preferences', title: 'העדפות ופרופיל אישי', desc: 'העדפות, סגנון אישי וחלום המגירה', icon: '●', duration: '5–7 דק׳', sticker: '● העדפות', rotate: 'rotate-1' },
  { id: 'motivation', title: 'מניעים וכוונות', desc: 'מה מניע אתכם ומהי מידת המוכנות שלכם', icon: '🔥', duration: '5–7 דק׳', sticker: '🔥 מניעים', rotate: '-rotate-1' },
  { id: 'thinking', title: 'חשיבה וגמישות קוגניטיבית', desc: 'גלו חוזקות חשיבה ייחודיות דרך זיהוי דפוסים ויזואליים', icon: '🧠', duration: '10–15 דק׳', sticker: '🧠 חידות', rotate: 'rotate-2' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }),
};

const getHubEncouragement = (completed: number, completedNames: string[]): string | null => {
  if (completed === 0) return null;
  
  const lastCompleted = completedNames[completedNames.length - 1];
  
  if (completed === 1) {
    return `יופי! סיימתם את שאלון ה${lastCompleted} 🌿 כל שאלון נוסף מחדד את התמונה ועוזר לי להכיר אתכם טוב יותר.`;
  }
  if (completed === 2) {
    return `שני שאלונים מאחוריכם – כבר מתחילה להצטייר תמונה מעניינת! 🔍 עוד אחד וניתן להתחיל לדבר על כיוונים.`;
  }
  if (completed === 3) {
    return `שלושה שאלונים ✦ עכשיו כבר יש לי מספיק כדי לתת המלצות ראשוניות. רוצים להמשיך או לראות תוצאות?`;
  }
  if (completed === 4) {
    return `ארבעה שאלונים – יש לי כבר הרבה מה לספר לכם! 🪶 כל שאלון נוסף מדייק עוד יותר.`;
  }
  if (completed === 5) {
    return `חמישה שאלונים – התמונה כבר ברורה מאוד! עוד קצת ותוכלו לראות את המלוא ✨`;
  }
  if (completed === 6) {
    return `כמעט השלמתם הכל! נשאר עוד שאלון אחד לתמונה המלאה 🎯`;
  }
  return `כל הכבוד! השלמתם את כל השאלונים 🎉 התמונה המלאה מוכנה – בואו נצא לדרך!`;
};

const QuestionnaireHub = ({ completedSections, onSelect, onViewResults }: QuestionnaireHubProps) => {
  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const hasMinimum = completedCount >= 3;
  const canViewResults = completedCount >= 1;
  const prevCount = useRef(completedCount);

  const completedNames = useMemo(() => {
    const nameMap: Record<QuestionnaireSectionId, string> = {
      skills: 'כישורים', schein: 'עוגנים', considerations: 'שיקולים',
      holland: 'נטיות', via: 'חוזקות VIA', preferences: 'העדפות',
      motivation: 'מניעים', thinking: 'חשיבה',
    };
    return questionnaires
      .filter(q => completedSections[q.id])
      .map(q => nameMap[q.id]);
  }, [completedSections]);

  const encouragement = getHubEncouragement(completedCount, completedNames);

  // 🎉 Celebrate milestones: small sparkle on each completion, big confetti at 3 (results unlock) and at all 8
  useEffect(() => {
    if (completedCount > prevCount.current) {
      if (completedCount === 3 || completedCount === questionnaires.length) {
        celebrationConfetti();
      } else if (completedCount > 0) {
        sparkleConfetti();
      }
    }
    prevCount.current = completedCount;
  }, [completedCount]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 md:py-16" dir="rtl">
      <div className="max-w-3xl w-full space-y-10">

        {/* Header — playful sticker style like landing */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4 relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.6, delay: 0.4, type: 'spring' }}
            className="absolute top-2 right-2 md:top-0 md:right-8 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 inline-flex items-center gap-1.5"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <Sparkles size={12} /> 8 שאלונים
          </motion.div>

          <img
            src={sageifyLogo}
            alt="Sageify"
            className="w-20 h-20 mx-auto rounded-full shadow-[var(--shadow-card)] border-2 border-white/15"
          />
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground tracking-wide">
            בחרו את השאלונים שלכם
          </h1>
          <div className="bg-secondary/[0.06] border border-secondary/20 rounded-2xl px-6 py-5 max-w-xl mx-auto text-right space-y-2">
            <p className="text-foreground text-lg leading-relaxed font-medium">
              👇 לפניכם 8 שאלונים. <span className="text-secondary">לחצו על כרטיסייה כדי להתחיל</span>.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              אפשר למלא בכל סדר שתרצו. מומלץ להשלים לפחות 3 שאלונים כדי לקבל תובנות מדויקות.
              <br />
              ⏱ ליד כל שאלון מופיע הזמן המשוער למילויו.
            </p>
          </div>
        </motion.div>


        {/* Progress with colorful gradient + level badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card border border-border/60 rounded-2xl p-5 shadow-[var(--shadow-card)] relative"
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
            <span className="text-sm font-display font-semibold text-foreground tracking-wide">
              התקדמות
            </span>
            <span className="text-sm text-muted-foreground">
              {completedCount} מתוך {questionnaires.length} {hasMinimum ? '✦' : `(מומלץ: 3+)`}
            </span>
          </div>
          <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-l from-coral via-sunny to-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / questionnaires.length) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Milestone dots */}
          <div className="flex justify-between mt-3 px-0.5">
            {Array.from({ length: questionnaires.length }).map((_, i) => (
              <motion.div
                key={i}
                animate={i < completedCount ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < completedCount ? 'bg-success' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Sagi encouragement */}
        {encouragement && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <OwlMessage
              message={encouragement}
              variant={completedCount >= 6 ? 'celebration' : completedCount >= 3 ? 'encouragement' : 'tip'}
            />
          </motion.div>
        )}

        {/* Questionnaire cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questionnaires.map((q, i) => {
            const completed = completedSections[q.id];
            return (
              <motion.button
                key={q.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                onClick={() => onSelect(q.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative text-right p-6 rounded-2xl border shadow-[var(--shadow-card)] transition-all duration-300 group ${
                  completed
                    ? 'bg-secondary/[0.04] border-secondary/25 hover:border-secondary/40'
                    : 'bg-card border-border/60 hover:border-secondary/30 hover:shadow-[var(--shadow-elevated)]'
                }`}
              >
                {/* Floating playful sticker — landing-page style */}
                {completed ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 14, delay: 0.2 + i * 0.07 }}
                    className="absolute -top-3 -left-3 bg-success text-success-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-md font-display z-10"
                    style={{ transform: 'rotate(6deg)' }}
                  >
                    הושלם ✓
                  </motion.span>
                ) : (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.05, type: 'spring', stiffness: 220, damping: 16 }}
                    className={`absolute -top-2.5 -left-2.5 bg-[hsl(45_70%_88%)] text-foreground text-[10px] font-medium px-2.5 py-1 rounded shadow-sm border border-[hsl(45_50%_75%)] z-10 ${q.rotate}`}
                  >
                    {q.sticker}
                  </motion.span>
                )}

                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={!completed ? { rotate: [0, -8, 8, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-colors duration-300 ${
                      completed
                        ? 'bg-success/15 text-success'
                        : 'bg-muted/40 text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary'
                    }`}
                  >
                    {completed ? (
                      <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 + i * 0.07 }}
                      >
                        ✓
                      </motion.span>
                    ) : q.icon}
                  </motion.div>
                  <div className="flex-1 space-y-1.5">
                    <h3 className="font-bold font-display text-foreground tracking-wide text-lg">
                      {q.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{q.desc}</p>
                    <p className="text-sm text-muted-foreground font-display flex items-center gap-1.5">⏱ {q.duration}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}

        </div>

        {/* CTA - See Results */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center space-y-4 pb-12"
        >
          {!hasMinimum && (
            <p className="text-base text-muted-foreground bg-card border border-border/60 rounded-2xl px-6 py-4 inline-block shadow-[var(--shadow-card)]">
              📋 יש להשלים לפחות 3 שאלונים כדי לקבל תוצאות ({completedCount}/3)
            </p>
          )}
          <div>
            <motion.button
              onClick={hasMinimum ? onViewResults : undefined}
              disabled={!hasMinimum}
              animate={hasMinimum ? {
                scale: [1, 1.06, 1],
                boxShadow: [
                  '0 0 0 0 hsl(160 28% 35% / 0)',
                  '0 0 0 12px hsl(160 28% 35% / 0.15)',
                  '0 0 0 0 hsl(160 28% 35% / 0)',
                ],
              } : {}}
              transition={hasMinimum ? { duration: 1.2, ease: 'easeInOut', times: [0, 0.5, 1] } : {}}
              className={`px-12 py-5 rounded-2xl text-lg font-semibold font-display tracking-wide transition-all duration-500 shadow-[var(--shadow-elevated)] group ${
                hasMinimum
                  ? 'bg-primary text-primary-foreground hover:bg-primary/85 hover:scale-[1.02] cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              }`}
            >
              <span className="flex items-center gap-3 justify-center">
                לתוצאות ולשיחה עם סגי
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
