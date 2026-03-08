import { useState } from 'react';
import { skills, type SkillColumn } from '@/data/skillsData';
import OwlMessage from './OwlMessage';
import owlLogo from '@/assets/owl-logo.png';

interface SkillsQuestionnaireProps {
  onComplete: (assignments: Record<number, SkillColumn>) => void;
}

const columnLabels: Record<SkillColumn, { title: string; desc: string; symbol: string }> = {
  winner: { title: 'ארגז הכלים המנצח', desc: 'טוב/ה בזה, נהנה/ית, רוצה להמשיך', symbol: '◆' },
  burnout: { title: 'טוב/ה אבל מיציתי', desc: 'הצטיינתי בזה, אבל לא בא לי יותר', symbol: '●' },
  aspire: { title: 'אשמח ללמוד', desc: 'לא טוב/ה בזה, אבל אשמח ללמוד ולעסוק', symbol: '✦' },
  irrelevant: { title: 'פחות מדבר אליי', desc: 'לא החוזקה שלי או לא מעניין כרגע', symbol: '○' },
};

const SkillsQuestionnaire = ({ onComplete }: SkillsQuestionnaireProps) => {
  const [assignments, setAssignments] = useState<Record<number, SkillColumn>>({});

  const totalAssigned = Object.keys(assignments).length;
  const winnerCount = Object.values(assignments).filter(v => v === 'winner').length;
  const allAssigned = totalAssigned >= skills.length;
  const progress = (totalAssigned / skills.length) * 100;

  const assign = (id: number, column: SkillColumn) => {
    if (column === 'winner' && winnerCount >= 7 && assignments[id] !== 'winner') {
      return;
    }
    setAssignments(prev => ({ ...prev, [id]: column }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ✦ חלק ה׳
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

        {winnerCount >= 5 && winnerCount <= 7 && (
          <OwlMessage message="מעולה! בחרתם בין 5 ל-7 כישורים לארגז המנצח" variant="celebration" />
        )}

        {/* Skills list */}
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-card rounded-3xl p-5 border border-border/60 shadow-[var(--shadow-card)] slide-up">
              <p className="text-foreground font-medium mb-4 text-lg leading-relaxed">{skill.id}. {skill.text}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(columnLabels) as SkillColumn[]).map(col => (
                  <button
                    key={col}
                    onClick={() => assign(skill.id, col)}
                    disabled={col === 'winner' && winnerCount >= 7 && assignments[skill.id] !== 'winner'}
                    className={`px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border-2 ${
                      assignments[skill.id] === col
                        ? col === 'winner'
                          ? 'bg-secondary/10 text-secondary border-secondary/40 shadow-[var(--shadow-card)]'
                          : col === 'burnout'
                          ? 'bg-primary/10 text-primary border-primary/40'
                          : col === 'aspire'
                          ? 'bg-accent/10 text-accent border-accent/40'
                          : 'bg-muted text-muted-foreground border-muted-foreground/20'
                        : 'bg-card text-foreground border-border/60 hover:border-secondary/30 disabled:opacity-25'
                    }`}
                  >
                    <span className="text-xs opacity-60">{columnLabels[col].symbol}</span> {columnLabels[col].title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <QuestionnaireNav
          showPrev={false}
          showComplete
          onComplete={() => onComplete(assignments)}
          completeDisabled={!allAssigned || winnerCount < 5}
          completeLabel="סיום חלק ה׳"
        />
      </div>
    </div>
  );
};

export default SkillsQuestionnaire;
