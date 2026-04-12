import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import owlLogo from '@/assets/owl-logo.png';

interface AnswerKeyItem {
  label: string;
  desc: string;
}

interface SectionIntroProps {
  title?: string;
  badge?: string;
  paragraphs: string[];
  bulletPoints?: string[];
  paragraphs2?: string[];
  notes?: string[];
  onContinue: () => void;
  buttonText?: string;
  contextFeedback?: string;
  exampleQuestions?: string[];
  answerKey?: AnswerKeyItem[];
}

const fadeSlideUp = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

const SectionIntro = ({
  title,
  badge,
  paragraphs,
  bulletPoints,
  paragraphs2,
  notes,
  onContinue,
  buttonText = '← בואו נמשיך',
  contextFeedback,
  exampleQuestions,
  answerKey,
}: SectionIntroProps) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-10">
        {/* Contextual feedback toast */}
        {contextFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-secondary/8 border border-secondary/20 rounded-2xl px-6 py-4 text-center text-base text-foreground font-medium"
          >
            {contextFeedback}
          </motion.div>
        )}

        {/* Logo */}
        <motion.div
          {...fadeSlideUp}
          className="text-center"
        >
          <img
            src={owlLogo}
            alt="Sageify"
            className="w-24 h-24 mx-auto mb-6 rounded-full shadow-[var(--shadow-card)] animate-float"
          />
          {badge && (
            <div className="inline-block px-5 py-2 rounded-full bg-secondary/8 text-secondary font-medium text-base mb-3 tracking-wide border border-secondary/15">
              {badge}
            </div>
          )}
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">{title}</h2>
          )}
        </motion.div>

        {/* Main content card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-3xl p-8 md:p-10 border border-border/60 shadow-[var(--shadow-card)] space-y-5"
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="text-foreground leading-relaxed text-lg">
              {p}
            </p>
          ))}

          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="space-y-4 pr-2">
              {bulletPoints.map((bp, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground text-lg">
                  <span className="text-secondary/60 mt-1 flex-shrink-0 text-sm">◆</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          )}

          {paragraphs2 && paragraphs2.map((p, i) => (
            <p key={`p2-${i}`} className="text-foreground leading-relaxed text-lg">
              {p}
            </p>
          ))}
        </motion.div>

        {/* Example questions */}
        {exampleQuestions && exampleQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-3xl p-8 border border-secondary/15 shadow-[var(--shadow-card)] space-y-4"
          >
            <p className="font-semibold font-display text-foreground text-lg tracking-wide">
              💡 דוגמאות לשאלות בשאלון:
            </p>
            <ul className="space-y-3 pr-2">
              {exampleQuestions.map((eq, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground text-lg">
                  <span className="text-secondary/50 mt-0.5 flex-shrink-0 text-base font-bold">{i + 1}.</span>
                  <span className="italic text-muted-foreground">{eq}</span>
                </li>
              ))}
            </ul>

            {/* Answer key toggle */}
            {answerKey && answerKey.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className="flex items-center gap-2 text-secondary hover:text-secondary/80 font-display font-semibold text-base transition-colors duration-200 min-h-[44px]"
                >
                  <span className="text-lg">{showAnswerKey ? '▾' : '▸'}</span>
                  <span>{showAnswerKey ? 'הסתר הגדרות תשובות' : 'הצג הגדרות תשובות'}</span>
                </button>
                <AnimatePresence>
                  {showAnswerKey && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2 bg-muted/30 rounded-2xl p-5 border border-border/40">
                        {answerKey.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-base">
                            <span className="font-bold text-foreground bg-secondary/10 px-3 py-1 rounded-lg text-sm min-w-fit">
                              {item.label}
                            </span>
                            <span className="text-muted-foreground">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Notes block */}
        {notes && notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-3xl p-8 border border-secondary/15 shadow-[var(--shadow-card)] space-y-4"
          >
            <p className="font-semibold font-display text-foreground text-lg tracking-wide">הערות אחרונות לפני שמתחילים:</p>
            <ul className="space-y-3 pr-2">
              {notes.map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground text-base">
                  <span className="text-secondary/50 mt-0.5 flex-shrink-0 text-sm">✦</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            <p className="text-foreground text-lg font-medium mt-2">בהצלחה, ונתראה בהמשך!</p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center pt-10"
        >
          <button
            onClick={onContinue}
            className="px-14 py-6 bg-primary text-primary-foreground rounded-2xl text-xl font-semibold font-display tracking-wide hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)] min-h-[52px]"
          >
            {buttonText}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SectionIntro;
