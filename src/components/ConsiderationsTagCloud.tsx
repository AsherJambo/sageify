import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { considerations } from '@/data/considerationsData';
import QuestionnaireNav from './QuestionnaireNav';
import { Slider } from '@/components/ui/slider';
import { burstConfetti } from '@/lib/confetti';

interface Props {
  onComplete: (selected: string[], points: Record<string, number>) => void;
  onBackToHub?: () => void;
}

// Pseudo-random but stable sizes per index
const sizeFor = (i: number) => {
  const sizes = ['text-base', 'text-lg', 'text-xl', 'text-base', 'text-lg', 'text-2xl', 'text-base'];
  return sizes[i % sizes.length];
};

const ConsiderationsTagCloud = ({ onComplete, onBackToHub }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [points, setPoints] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<'cloud' | 'distribute'>('cloud');

  const shuffled = useMemo(() => {
    const arr = [...considerations].map((c, i) => ({ c, i }));
    // stable order by hash-ish index
    return arr.sort((a, b) => ((a.i * 7) % 13) - ((b.i * 7) % 13));
  }, []);

  const total = Object.values(points).reduce((a, b) => a + b, 0);
  const remaining = 100 - total;

  const toggle = (tag: string) => {
    setSelected(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) :
      prev.length >= 6 ? prev : [...prev, tag]
    );
  };

  const startDistribute = () => {
    const init: Record<string, number> = {};
    selected.forEach(s => { init[s] = Math.floor(100 / selected.length); });
    // adjust remainder
    const sum = Object.values(init).reduce((a, b) => a + b, 0);
    if (selected.length) init[selected[0]] += (100 - sum);
    setPoints(init);
    setPhase('distribute');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const setPoint = (tag: string, value: number) => {
    const others = Object.entries(points).filter(([k]) => k !== tag).reduce((a, [, v]) => a + v, 0);
    const max = 100 - others;
    setPoints(prev => ({ ...prev, [tag]: Math.min(Math.max(0, value), max) }));
  };

  if (phase === 'distribute') {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm border border-secondary/15">⚖ חלוקת משקל</div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">חלקו 100 נקודות</h2>
            <p className="text-muted-foreground text-base">תנו משקל לכל שיקול לפי החשיבות האמיתית שלו עבורכם</p>
          </div>

          <div className={`sticky top-2 z-10 mx-auto px-5 py-2.5 rounded-full text-base font-bold font-display backdrop-blur shadow-md w-fit
            ${remaining === 0 ? 'bg-success/15 text-success border border-success/30' :
              remaining < 0 ? 'bg-destructive/15 text-destructive border border-destructive/30' :
              'bg-card/90 text-foreground border border-border/60'}`}>
            נותרו {remaining}/100 נקודות
          </div>

          <div className="space-y-3">
            {selected.map(tag => (
              <motion.div
                key={tag}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl p-5 border border-border/60 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-foreground text-base">{tag}</p>
                  <div className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold font-display text-base min-w-[52px] text-center">
                    {points[tag] || 0}
                  </div>
                </div>
                <Slider
                  value={[points[tag] || 0]}
                  onValueChange={(v) => setPoint(tag, v[0])}
                  min={0} max={100} step={1}
                />
              </motion.div>
            ))}
          </div>

          <QuestionnaireNav
            showPrev
            onPrev={() => setPhase('cloud')}
            showComplete
            onComplete={() => { burstConfetti(); onComplete(selected, points); }}
            completeDisabled={remaining !== 0}
            completeLabel="סיום שאלון שיקולים"
            onBackToHub={onBackToHub}
          />
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center px-4 py-10 fade-in">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm border border-secondary/15">⚖ שיקולים</div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">ענן השיקולים</h2>
          <p className="text-muted-foreground text-base md:text-lg">בחרו עד 6 שיקולים שמובילים אתכם בבחירת עיסוק</p>
        </div>

        <div className="sticky top-2 z-10 mx-auto px-5 py-2 rounded-full text-sm font-bold font-display bg-card/90 backdrop-blur shadow-md border border-border/60 w-fit">
          {selected.length}/6 נבחרו
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center p-5 rounded-3xl bg-card/40 border border-border/60 min-h-[320px]">
          <AnimatePresence>
            {shuffled.map(({ c, i }) => {
              const isSel = selected.includes(c);
              const disabled = !isSel && selected.length >= 6;
              return (
                <motion.button
                  key={c}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: disabled ? 0.4 : 1, scale: isSel ? 1.08 : 1 }}
                  whileHover={!disabled ? { scale: isSel ? 1.1 : 1.05 } : undefined}
                  whileTap={!disabled ? { scale: 0.95 } : undefined}
                  onClick={() => toggle(c)}
                  disabled={disabled}
                  className={`${sizeFor(i)} font-medium px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                    isSel
                      ? 'bg-secondary text-secondary-foreground border-secondary shadow-[0_8px_20px_hsl(var(--secondary)/0.35)]'
                      : 'bg-background text-foreground border-border/60 hover:border-secondary/40'
                  }`}
                >
                  {c}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <QuestionnaireNav
          showPrev={false}
          showComplete
          onComplete={startDistribute}
          completeDisabled={selected.length !== 6}
          completeLabel={selected.length === 6 ? 'המשך לחלוקת משקל' : `בחרו עוד ${6 - selected.length}`}
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default ConsiderationsTagCloud;
