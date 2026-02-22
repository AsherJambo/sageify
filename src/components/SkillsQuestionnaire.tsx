import { useState } from 'react';
import { skills, type SkillColumn } from '@/data/skillsData';
import OwlMessage from './OwlMessage';

interface SkillsQuestionnaireProps {
  onComplete: (assignments: Record<number, SkillColumn>) => void;
}

const columnLabels: Record<SkillColumn, { title: string; desc: string; emoji: string }> = {
  winner: { title: 'ארגז הכלים המנצח', desc: 'טוב/ה בזה, נהנה/ית, רוצה להמשיך', emoji: '🏆' },
  burnout: { title: 'טוב/ה אבל מיציתי', desc: 'הצטיינתי בזה, אבל לא בא לי יותר', emoji: '😮‍💨' },
  irrelevant: { title: 'פחות מדבר אליי', desc: 'לא החוזקה שלי או לא מעניין כרגע', emoji: '🤷' },
};

const SkillsQuestionnaire = ({ onComplete }: SkillsQuestionnaireProps) => {
  const [assignments, setAssignments] = useState<Record<number, SkillColumn>>({});

  const totalAssigned = Object.keys(assignments).length;
  const winnerCount = Object.values(assignments).filter(v => v === 'winner').length;
  const allAssigned = totalAssigned >= skills.length;
  const progress = (totalAssigned / skills.length) * 100;

  const assign = (id: number, column: SkillColumn) => {
    if (column === 'winner' && winnerCount >= 7 && assignments[id] !== 'winner') {
      return; // Max 7 in winner column
    }
    setAssignments(prev => ({ ...prev, [id]: column }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm">
            🧰 כישורים ותנאי סף
          </div>
          <h2 className="text-2xl font-bold text-foreground">שאלון כישורים</h2>
          <p className="text-muted-foreground">מיינו כל כישור לאחת משלוש העמודות (5-7 ב"ארגז המנצח")</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalAssigned} / {skills.length} כישורים מוינו</span>
            <span>🏆 ארגז מנצח: {winnerCount}/7</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {winnerCount >= 5 && winnerCount <= 7 && (
          <OwlMessage message="מעולה! בחרתם בין 5 ל-7 כישורים לארגז המנצח 💪" variant="encouragement" />
        )}

        {/* Skills list */}
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-card rounded-xl p-4 border border-border slide-up">
              <p className="text-foreground font-medium mb-3">{skill.id}. {skill.text}</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(columnLabels) as SkillColumn[]).map(col => (
                  <button
                    key={col}
                    onClick={() => assign(skill.id, col)}
                    disabled={col === 'winner' && winnerCount >= 7 && assignments[skill.id] !== 'winner'}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                      assignments[skill.id] === col
                        ? col === 'winner'
                          ? 'bg-secondary text-secondary-foreground border-secondary'
                          : col === 'burnout'
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-muted text-muted-foreground border-muted-foreground/30'
                        : 'bg-background text-foreground border-border hover:border-primary/30 disabled:opacity-30'
                    }`}
                  >
                    {columnLabels[col].emoji} {columnLabels[col].title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-6">
          <button
            onClick={() => onComplete(assignments)}
            disabled={!allAssigned || winnerCount < 5}
            className="px-10 py-4 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xl disabled:opacity-30 hover:opacity-90 transition-all"
          >
            🦉 סיום שאלון כישורים ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsQuestionnaire;
