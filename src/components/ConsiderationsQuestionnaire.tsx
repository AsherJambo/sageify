import { useState } from 'react';
import { considerations } from '@/data/considerationsData';
import { considerationsDistributeIntro } from '@/data/sectionIntros';
import SectionIntro from './SectionIntro';
import OwlMessage from './OwlMessage';

interface ConsiderationsQuestionnaireProps {
  onComplete: (selected: string[], points: Record<string, number>) => void;
}

const ConsiderationsQuestionnaire = ({ onComplete }: ConsiderationsQuestionnaireProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [points, setPoints] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<'select' | 'distribute-intro' | 'distribute'>('select');

  const totalPoints = Object.values(points).reduce((a, b) => a + b, 0);
  const remaining = 100 - totalPoints;

  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(s => s !== item));
    } else if (selected.length < 6) {
      setSelected([...selected, item]);
    }
  };

  const handlePointChange = (item: string, value: number) => {
    const otherPoints = Object.entries(points)
      .filter(([k]) => k !== item)
      .reduce((a, [, v]) => a + v, 0);
    const maxAllowed = 100 - otherPoints;
    const clamped = Math.min(Math.max(0, value), maxAllowed);
    setPoints({ ...points, [item]: clamped });
  };

  const handleSelectComplete = () => {
    const initial: Record<string, number> = {};
    selected.forEach(s => { initial[s] = 0; });
    setPoints(initial);
    setPhase('distribute-intro');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (phase === 'distribute-intro') {
    return (
      <SectionIntro
        badge={considerationsDistributeIntro.badge}
        title={considerationsDistributeIntro.title}
        paragraphs={considerationsDistributeIntro.paragraphs}
        onContinue={() => {
          setPhase('distribute');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm">
            📋 חלק ג׳
          </div>
          <h2 className="text-2xl font-bold text-foreground">שיקולים בבחירת עיסוק</h2>
          {phase === 'select' ? (
            <p className="text-muted-foreground">בחרו 6 שיקולים שיגרמו לכם לבחור בעיסוק ספציפי</p>
          ) : (
            <p className="text-muted-foreground">חלקו 100 נקודות בין 6 השיקולים שבחרתם לפי חשיבותם</p>
          )}
        </div>

        {phase === 'select' && (
          <>
            <OwlMessage message={`נבחרו ${selected.length} מתוך 6 שיקולים`} variant="encouragement" />
            <div className="space-y-2">
              {considerations.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleItem(item)}
                  className={`w-full text-right px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    selected.includes(item)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="text-center pt-4">
              <button
                onClick={handleSelectComplete}
                disabled={selected.length !== 6}
                className="px-10 py-4 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xl disabled:opacity-30 hover:opacity-90 transition-all"
              >
                המשך לחלוקת נקודות →
              </button>
            </div>
          </>
        )}

        {phase === 'distribute' && (
          <>
            <div className={`text-center font-bold text-xl ${remaining === 0 ? 'text-secondary' : remaining < 0 ? 'text-destructive' : 'text-accent'}`}>
              נותרו: {remaining} נקודות מתוך 100
            </div>
            <div className="space-y-4">
              {selected.map((item) => (
                <div key={item} className="bg-card rounded-xl p-4 border border-border">
                  <p className="font-medium text-foreground mb-2">{item}</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={points[item] || 0}
                      onChange={e => handlePointChange(item, Number(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={points[item] || 0}
                      onChange={e => handlePointChange(item, Number(e.target.value))}
                      className="w-16 text-center rounded-lg border border-border bg-background p-2 font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center pt-4">
              <button
                onClick={() => onComplete(selected, points)}
                disabled={remaining !== 0}
                className="px-10 py-4 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xl disabled:opacity-30 hover:opacity-90 transition-all"
              >
                🦉 סיום חלק ג׳ ✓
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsiderationsQuestionnaire;
