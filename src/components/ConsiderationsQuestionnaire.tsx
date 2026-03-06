import { useState } from 'react';
import { considerations } from '@/data/considerationsData';
import { considerationsDistributeIntro } from '@/data/sectionIntros';
import SectionIntro from './SectionIntro';
import OwlMessage from './OwlMessage';
import owlLogo from '@/assets/owl-logo.png';

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
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ✦ חלק ג׳
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">שיקולים בבחירת עיסוק</h2>
          {phase === 'select' ? (
            <p className="text-muted-foreground text-lg">בחרו 6 שיקולים שיגרמו לכם לבחור בעיסוק ספציפי</p>
          ) : (
            <p className="text-muted-foreground text-lg">חלקו 100 נקודות בין 6 השיקולים שבחרתם לפי חשיבותם</p>
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
                  className={`w-full text-right px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    selected.includes(item)
                      ? 'bg-primary/5 text-foreground border-primary/40 shadow-[var(--shadow-card)]'
                      : 'bg-card text-foreground border-border/60 hover:border-secondary/30 hover:shadow-[var(--shadow-card)]'
                  }`}
                >
                  <span className="text-base font-medium">{item}</span>
                </button>
              ))}
            </div>
            <div className="text-center pt-4">
              <button
                onClick={handleSelectComplete}
                disabled={selected.length !== 6}
                className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold font-display text-lg tracking-wide disabled:opacity-25 hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)]"
              >
                המשך לחלוקת נקודות →
              </button>
            </div>
          </>
        )}

        {phase === 'distribute' && (
          <>
            <div className={`text-center font-bold font-display text-xl tracking-wide ${remaining === 0 ? 'text-secondary' : remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
              נותרו: {remaining} נקודות מתוך 100
            </div>
            <div className="space-y-4">
              {selected.map((item) => (
                <div key={item} className="bg-card rounded-3xl p-5 border border-border/60 shadow-[var(--shadow-card)]">
                  <p className="font-medium text-foreground mb-3 text-base">{item}</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={points[item] || 0}
                      onChange={e => handlePointChange(item, Number(e.target.value))}
                      className="flex-1 accent-secondary"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={points[item] || 0}
                      onChange={e => handlePointChange(item, Number(e.target.value))}
                      className="w-16 text-center rounded-2xl border border-border/60 bg-card p-2 font-bold font-display"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center pt-4">
              <button
                onClick={() => onComplete(selected, points)}
                disabled={remaining !== 0}
                className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold font-display text-lg tracking-wide disabled:opacity-25 hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)]"
              >
                <img src={owlLogo} alt="" className="w-6 h-6 rounded-full ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110" />
                <span>סיום חלק ג׳</span>
                <span className="text-primary-foreground/60 transition-transform duration-300 group-hover:translate-x-[-4px]">✓</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsiderationsQuestionnaire;
