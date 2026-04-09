import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionnaireNav from './QuestionnaireNav';
import OwlMessage from './OwlMessage';
import {
  motivationClusters,
  intentionStatements,
  type MotivationScores,
  type IntentionAnswers,
} from '@/data/motivationQuestions';

interface MotivationQuestionnaireProps {
  onComplete: (motivationScores: MotivationScores, intentionAnswers: IntentionAnswers) => void;
  onBackToHub?: () => void;
}

const SCALE = [1, 2, 3, 4, 5];
const scaleLabels: Record<number, string> = {
  1: 'כלל לא',
  2: 'במידה מועטה',
  3: 'במידה בינונית',
  4: 'במידה רבה',
  5: 'במידה רבה מאוד',
};

type Part = 'A' | 'B';

const MotivationQuestionnaire = ({ onComplete, onBackToHub }: MotivationQuestionnaireProps) => {
  const [part, setPart] = useState<Part>('A');
  const [motivationScores, setMotivationScores] = useState<MotivationScores>({});
  const [intentionAnswers, setIntentionAnswers] = useState<IntentionAnswers>({});

  const partAComplete = Object.keys(motivationScores).length >= motivationClusters.length;
  const partBAnswered = Object.keys(intentionAnswers).length;
  const partBComplete = partBAnswered >= intentionStatements.length;
  const allComplete = partAComplete && partBComplete;

  const partAProgress = (Object.keys(motivationScores).length / motivationClusters.length) * 100;
  const partBProgress = (partBAnswered / intentionStatements.length) * 100;
  const totalProgress = part === 'A' ? partAProgress * 0.5 : 50 + partBProgress * 0.5;

  const handleMotivationScore = (clusterId: string, score: number) => {
    setMotivationScores(prev => ({ ...prev, [clusterId]: score }));
  };

  const handleIntentionAnswer = (id: number, score: number) => {
    setIntentionAnswers(prev => ({ ...prev, [id]: score }));
  };

  const getEncouragement = (): string | null => {
    if (part === 'A') {
      const count = Object.keys(motivationScores).length;
      if (count === 0) return null;
      if (count < motivationClusters.length) return 'יופי, המשיכו – כל תשובה עוזרת לי להבין מה באמת מניע אתכם 🌿';
      return 'מצוין! סיימתם את חלק א׳. בואו נמשיך לחלק הבא ✦';
    }
    if (partBAnswered === 0) return null;
    if (partBAnswered < 5) return 'אתם בדרך הנכונה – ענו בכנות, אין תשובות נכונות או לא נכונות 🪶';
    if (!partBComplete) return 'כמעט שם! עוד כמה אמירות אחרונות ✨';
    return 'מעולה! סיימתם את השאלון – סגי כבר מעבד את התובנות 🦉';
  };

  const encouragement = getEncouragement();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            🔥 מניעים וכוונות
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            {part === 'A' ? 'מניעים להמשך הדרך' : 'כוונות לחיפוש תעסוקה'}
          </h2>
          <p className="text-muted-foreground text-lg">
            {part === 'A'
              ? 'דרגו עד כמה כל אשכול מניע אתכם לחפש עיסוק לאחר הפרישה (1-5)'
              : 'דרגו את מידת ההסכמה עם כל אמירה (1 – לא מסכים כלל, 5 – מסכים לחלוטין)'}
          </p>
        </div>

        {/* Part tabs */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setPart('A')}
            className={`px-6 py-3 rounded-xl font-display font-semibold text-base transition-all duration-400 min-h-[52px] ${
              part === 'A'
                ? 'bg-primary text-primary-foreground shadow-[var(--shadow-card)]'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            א׳ – מניעים
          </button>
          <button
            onClick={() => partAComplete && setPart('B')}
            disabled={!partAComplete}
            className={`px-6 py-3 rounded-xl font-display font-semibold text-base transition-all duration-400 min-h-[52px] ${
              part === 'B'
                ? 'bg-primary text-primary-foreground shadow-[var(--shadow-card)]'
                : partAComplete
                  ? 'bg-muted/50 text-muted-foreground hover:bg-muted cursor-pointer'
                  : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
            }`}
          >
            ב׳ – כוונות
          </button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-base text-muted-foreground">
            <span>
              {part === 'A'
                ? `${Object.keys(motivationScores).length} / ${motivationClusters.length} אשכולות`
                : `${partBAnswered} / ${intentionStatements.length} אמירות`}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full progress-bar-fill"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Encouragement */}
        {encouragement && <OwlMessage message={encouragement} variant="encouragement" />}

        {/* Content */}
        <AnimatePresence mode="wait">
          {part === 'A' ? (
            <motion.div
              key="partA"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              {motivationClusters.map((cluster, idx) => (
                <div
                  key={cluster.id}
                  className="bg-card rounded-3xl p-5 md:p-6 shadow-[var(--shadow-card)] border border-border/60 slide-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl flex-shrink-0">{cluster.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold font-display text-foreground text-base mb-1">{cluster.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cluster.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center items-center flex-wrap" dir="ltr">
                    <span className="text-sm text-muted-foreground w-16 text-right hidden sm:inline">כלל לא</span>
                    {SCALE.map(val => (
                      <button
                        key={val}
                        onClick={() => handleMotivationScore(cluster.id, val)}
                        className={`w-13 h-13 rounded-full font-bold text-lg transition-all duration-400 border-2 min-w-[52px] min-h-[52px] ${
                          motivationScores[cluster.id] === val
                            ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-[var(--shadow-card)]'
                            : 'bg-card text-foreground border-border hover:border-secondary/40 hover:scale-105'
                        }`}
                        title={scaleLabels[val]}
                        aria-label={`${scaleLabels[val]} – ${val}`}
                      >
                        {val}
                      </button>
                    ))}
                    <span className="text-sm text-muted-foreground w-16 text-left hidden sm:inline">מאוד</span>
                  </div>
                </div>
              ))}

              <QuestionnaireNav
                showPrev={false}
                showNext={true}
                showComplete={false}
                nextDisabled={!partAComplete}
                onNext={() => setPart('B')}
                completeLabel=""
                onBackToHub={onBackToHub}
              />
            </motion.div>
          ) : (
            <motion.div
              key="partB"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {intentionStatements.map((stmt, idx) => (
                <div
                  key={stmt.id}
                  className="bg-card rounded-3xl p-5 md:p-6 shadow-[var(--shadow-card)] border border-border/60 slide-up"
                  style={{ animationDelay: `${Math.min(idx * 0.03, 0.3)}s` }}
                >
                  <p className="text-lg font-medium text-foreground mb-4 leading-relaxed">
                    {stmt.id}. {stmt.text}
                  </p>
                  <div className="flex gap-3 justify-center items-center flex-wrap" dir="ltr">
                    <span className="text-sm text-muted-foreground w-20 text-right hidden sm:inline">לא מסכים כלל</span>
                    {SCALE.map(val => (
                      <button
                        key={val}
                        onClick={() => handleIntentionAnswer(stmt.id, val)}
                        className={`w-13 h-13 rounded-full font-bold text-lg transition-all duration-400 border-2 min-w-[52px] min-h-[52px] ${
                          intentionAnswers[stmt.id] === val
                            ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-[var(--shadow-card)]'
                            : 'bg-card text-foreground border-border hover:border-secondary/40 hover:scale-105'
                        }`}
                        title={scaleLabels[val]}
                        aria-label={`${scaleLabels[val]} – ${val}`}
                      >
                        {val}
                      </button>
                    ))}
                    <span className="text-sm text-muted-foreground w-20 text-left hidden sm:inline">מסכים לחלוטין</span>
                  </div>
                </div>
              ))}

              <QuestionnaireNav
                showPrev={true}
                showComplete={true}
                onPrev={() => setPart('A')}
                onComplete={() => onComplete(motivationScores, intentionAnswers)}
                completeDisabled={!allComplete}
                completeLabel="סיום שאלון מניעים"
                onBackToHub={onBackToHub}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MotivationQuestionnaire;
