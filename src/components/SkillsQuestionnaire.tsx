import { useState } from 'react';
import { motion } from 'framer-motion';
import { skills, type SkillColumn } from '@/data/skillsData';
import OwlMessage from './OwlMessage';
import QuestionnaireNav from './QuestionnaireNav';
import AnswerKeyReminder from './AnswerKeyReminder';
import QuestProgressBadge from './QuestProgressBadge';
import { burstConfetti } from '@/lib/confetti';

const skillsAnswerKey = [
  { label: '🏆 ארגז כלים מנצח', desc: 'טוב/ה בזה + רוצה להמשיך' },
  { label: '🔥 טוב אבל מיציתי', desc: 'טוב/ה בזה, אבל מיציתי' },
  { label: '🌱 אשמח ללמוד', desc: 'לא טוב/ה עדיין, אבל רוצה ללמוד' },
  { label: '💤 לא רלוונטי', desc: 'לא טוב/ה ולא מעוניין/ת' },
];

interface SkillsQuestionnaireProps {
  onComplete: (assignments: Record<number, SkillColumn>) => void;
  onBackToHub?: () => void;
}

const columnLabels: Record<SkillColumn, { title: string; desc: string; symbol: string; color: string; activeClass: string; hoverClass: string }> = {
  winner: {
    title: 'ארגז כלים מנצח',
    desc: 'טוב/ה בזה, נהנה/ית, רוצה להמשיך',
    symbol: '🏆',
    color: 'success',
    activeClass: 'bg-success text-success-foreground border-success scale-[1.03] shadow-[0_0_18px_hsl(var(--success)/0.35)]',
    hoverClass: 'hover:border-success/60 hover:bg-success-soft/50',
  },
  burnout: {
    title: 'טוב אבל מיציתי',
    desc: 'הצטיינתי בזה, אבל לא בא לי יותר',
    symbol: '🔥',
    color: 'coral',
    activeClass: 'bg-coral text-coral-foreground border-coral scale-[1.03] shadow-[0_0_18px_hsl(var(--coral)/0.35)]',
    hoverClass: 'hover:border-coral/60 hover:bg-coral-soft/50',
  },
  aspire: {
    title: 'אשמח ללמוד',
    desc: 'רוצה ללמוד ולעסוק בזה',
    symbol: '🌱',
    color: 'sky',
    activeClass: 'bg-sky text-white border-sky scale-[1.03] shadow-[0_0_18px_hsl(var(--sky)/0.35)]',
    hoverClass: 'hover:border-sky/60 hover:bg-sky-soft/50',
  },
  irrelevant: {
    title: 'פחות מדבר אליי',
    desc: 'לא החוזקה שלי או לא מעניין כרגע',
    symbol: '💤',
    color: 'sunny',
    activeClass: 'bg-sunny text-foreground border-sunny scale-[1.03] shadow-[0_0_18px_hsl(var(--sunny)/0.35)]',
    hoverClass: 'hover:border-sunny/60 hover:bg-sunny-soft/50',
  },
};

const SkillsQuestionnaire = ({ onComplete, onBackToHub }: SkillsQuestionnaireProps) => {
  const [assignments, setAssignments] = useState<Record<number, SkillColumn>>({});
  const [error, setError] = useState<string | null>(null);

  const totalAssigned = Object.keys(assignments).length;
  const winnerCount = Object.values(assignments).filter(v => v === 'winner').length;
  const allAssigned = totalAssigned >= skills.length;
  const progress = (totalAssigned / skills.length) * 100;

  const handleComplete = () => {
    if (!allAssigned) {
      setError(`יש למיין את כל ${skills.length} הכישורים. מיינתם ${totalAssigned} מתוך ${skills.length}.`);
      return;
    }
    if (winnerCount < 5) {
      setError(`יש לבחור לפחות 5 כישורים לארגז המנצח. בחרתם ${winnerCount} מתוך 5.`);
      return;
    }
    setError(null);
    burstConfetti();
    onComplete(assignments);
  };

  const assign = (id: number, column: SkillColumn) => {
    if (column === 'winner' && winnerCount >= 7 && assignments[id] !== 'winner') {
      return;
    }
    setAssignments(prev => ({ ...prev, [id]: column }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <QuestProgressBadge current={totalAssigned} total={skills.length} label="כישורים" icon="◆" />
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ✦ כישורים
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">כישורים ותנאי סף</h2>
          <p className="text-muted-foreground text-lg">מיינו כל כישור לאחת מ-4 העמודות (מינימום 5 ומקסימום 7 בעמודת "הארגז המנצח")</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalAssigned} / {skills.length} כישורים מוינו</span>
            <span>◆ ארגז מנצח: {winnerCount}/7</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <AnswerKeyReminder items={skillsAnswerKey} />

        {winnerCount >= 5 && winnerCount <= 7 && (
          <OwlMessage message="מעולה! בחרתם בין 5 ל-7 כישורים לארגז המנצח" variant="celebration" />
        )}

        {/* Skills list */}
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-card rounded-3xl p-5 border border-border/60 shadow-[var(--shadow-card)] slide-up">
              <p className="text-foreground font-medium mb-4 text-lg leading-relaxed">{skill.id}. {skill.text}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(columnLabels) as SkillColumn[]).map(col => {
                  const meta = columnLabels[col];
                  const isActive = assignments[skill.id] === col;
                  return (
                    <motion.button
                      key={col}
                      onClick={() => assign(skill.id, col)}
                      disabled={col === 'winner' && winnerCount >= 7 && assignments[skill.id] !== 'winner'}
                      whileTap={!(col === 'winner' && winnerCount >= 7 && assignments[skill.id] !== 'winner') ? { scale: 0.92, transition: { type: "spring", stiffness: 400, damping: 15 } } : undefined}
                      className={`px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border-2 ${
                        isActive
                          ? meta.activeClass
                          : `bg-card text-foreground border-border/60 ${meta.hoverClass} disabled:opacity-25`
                      }`}
                    >
                      <span className="text-base">{meta.symbol}</span> {meta.title}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

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
          completeLabel="סיום שאלון כישורים"
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default SkillsQuestionnaire;
