import { useMemo } from 'react';
import { motion } from 'framer-motion';
import sageifyLogo from '@/assets/owl-logo.png';
import ThinkingSkillsPlaceholder from '@/components/ThinkingSkillsPlaceholder';
import OwlMessage from '@/components/OwlMessage';

type QuestionnaireSectionId = 'skills' | 'schein' | 'considerations' | 'holland' | 'via' | 'preferences' | 'motivation';

interface QuestionnaireHubProps {
  completedSections: Record<QuestionnaireSectionId, boolean>;
  onSelect: (id: QuestionnaireSectionId) => void;
  onViewResults: () => void;
}

const questionnaires: { id: QuestionnaireSectionId; title: string; desc: string; icon: string; duration: string }[] = [
  { id: 'skills', title: 'כישורים ותנאי סף', desc: 'מיינו 20 כישורים לארגז הכלים שלכם', icon: '◆', duration: '5–7 דק׳' },
  { id: 'schein', title: 'עוגנים תעסוקתיים', desc: 'גלו מה באמת מניע אתכם בעשייה', icon: '⚓', duration: '8–10 דק׳' },
  { id: 'considerations', title: 'שיקולים בבחירת עיסוק', desc: 'בחרו ותעדפו את השיקולים החשובים לכם', icon: '⚖', duration: '5–7 דק׳' },
  { id: 'holland', title: 'נטיות תעסוקתיות', desc: 'גלו את הנטיות המקצועיות שלכם', icon: '🧭', duration: '10–12 דק׳' },
  { id: 'via', title: 'חוזקות VIA', desc: 'גלו את הכוחות הפנימיים שלכם', icon: '✦', duration: '8–10 דק׳' },
  { id: 'preferences', title: 'העדפות ופרופיל אישי', desc: 'העדפות, סגנון אישי וחלום המגירה', icon: '●', duration: '5–7 דק׳' },
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
    return `כמעט השלמתם הכל! נשאר עוד שאלון אחד לתמונה המלאה ✨`;
  }
  return `כל הכבוד! השלמתם את כל השאלונים 🎉 התמונה המלאה מוכנה – בואו נצא לדרך!`;
};

const QuestionnaireHub = ({ completedSections, onSelect, onViewResults }: QuestionnaireHubProps) => {
  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const hasMinimum = completedCount >= 3;
  const canViewResults = completedCount >= 1;

  const completedNames = useMemo(() => {
    const nameMap: Record<QuestionnaireSectionId, string> = {
      skills: 'כישורים', schein: 'עוגנים', considerations: 'שיקולים',
      holland: 'נטיות', via: 'חוזקות VIA', preferences: 'העדפות',
    };
    return questionnaires
      .filter(q => completedSections[q.id])
      .map(q => nameMap[q.id]);
  }, [completedSections]);

  const encouragement = getHubEncouragement(completedCount, completedNames);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 md:py-16" dir="rtl">
      <div className="max-w-3xl w-full space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4"
        >
          <img
            src={sageifyLogo}
            alt="Sageify"
            className="w-20 h-20 mx-auto rounded-full shadow-[var(--shadow-card)] border-2 border-white/15"
          />
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground tracking-wide">
            בחרו את השאלונים שלכם
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            תוכלו לבחור אילו שאלונים למלא, לפי מה שמרגיש רלוונטי עבורכם.
            <br />
            <span className="text-foreground font-medium">
              להמלצה מדויקת ומשמעותית יותר, מומלץ להשלים לפחות 3 שאלונים.
            </span>
          </p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card border border-border/60 rounded-2xl p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-display font-semibold text-foreground tracking-wide">
              התקדמות
            </span>
            <span className="text-sm text-muted-foreground">
              {completedCount} מתוך 6 {hasMinimum ? '✦' : `(מומלץ: 3+)`}
            </span>
          </div>
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 6) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`text-right p-6 rounded-2xl border shadow-[var(--shadow-card)] transition-all duration-300 group ${
                  completed
                    ? 'bg-secondary/[0.04] border-secondary/25 hover:border-secondary/40'
                    : 'bg-card border-border/60 hover:border-secondary/30 hover:shadow-[var(--shadow-elevated)]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-colors duration-300 ${
                    completed
                      ? 'bg-secondary/15 text-secondary'
                      : 'bg-muted/40 text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary'
                  }`}>
                    {completed ? (
                      <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 + i * 0.07 }}
                      >
                        ✓
                      </motion.span>
                    ) : q.icon}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold font-display text-foreground tracking-wide text-base">
                        {q.title}
                      </h3>
                      {completed && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 + i * 0.07 }}
                          className="text-xs bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full font-display font-semibold flex-shrink-0"
                        >
                          הושלם
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{q.desc}</p>
                    <p className="text-xs text-muted-foreground/60 font-display">⏱ {q.duration}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}

          {/* Thinking Skills - Coming Soon */}
          <motion.div
            custom={questionnaires.length}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <ThinkingSkillsPlaceholder
              trigger={
                <div className="text-right p-6 rounded-2xl border border-dashed border-border bg-card/50 shadow-none transition-all duration-300 hover:border-secondary/20 cursor-pointer h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0 bg-gold-light text-foreground">
                      🧠
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold font-display text-foreground tracking-wide text-base">
                          הערכת חשיבה וגמישות
                        </h3>
                        <span className="text-xs bg-gold-light text-foreground px-2.5 py-0.5 rounded-full font-display font-semibold flex-shrink-0">
                          בקרוב
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        הערכה קצרה שחושפת חוזקות חשיבה ייחודיות ומתרגמת אותן לצעדים הבאים
                      </p>
                      <p className="text-xs text-muted-foreground/60 font-display">⏱ 5–8 דק׳</p>
                    </div>
                  </div>
                </div>
              }
            />
          </motion.div>
        </div>

        {/* CTA - See Results */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center space-y-4 pb-12"
        >
          {!hasMinimum && (
            <p className="text-sm text-muted-foreground bg-card border border-border/60 rounded-2xl px-5 py-3 inline-block shadow-[var(--shadow-card)]">
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
