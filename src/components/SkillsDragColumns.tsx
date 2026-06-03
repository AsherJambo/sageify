import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skills, type SkillColumn } from '@/data/skillsData';
import QuestionnaireNav from './QuestionnaireNav';
import { burstConfetti } from '@/lib/confetti';

type Bucket = SkillColumn | 'pool';

interface Props {
  onComplete: (assignments: Record<number, SkillColumn>) => void;
  onBackToHub?: () => void;
}

const COLUMNS: { id: SkillColumn; title: string; emoji: string; accent: string; ring: string }[] = [
  { id: 'winner',     title: 'ארגז כלים מנצח', emoji: '🏆', accent: 'bg-success/10 border-success/40',   ring: 'ring-success' },
  { id: 'burnout',    title: 'טוב אבל מיציתי',  emoji: '🔥', accent: 'bg-coral/10   border-coral/40',     ring: 'ring-coral' },
  { id: 'aspire',     title: 'אשמח ללמוד',      emoji: '🌱', accent: 'bg-sky/10     border-sky/40',       ring: 'ring-sky' },
  { id: 'irrelevant', title: 'פחות מדבר אליי',  emoji: '💤', accent: 'bg-sunny/10   border-sunny/40',     ring: 'ring-sunny' },
];

const SkillsDragColumns = ({ onComplete, onBackToHub }: Props) => {
  const [assignments, setAssignments] = useState<Record<number, Bucket>>(
    Object.fromEntries(skills.map(s => [s.id, 'pool' as Bucket]))
  );
  const [error, setError] = useState<string | null>(null);
  const columnRefs = useRef<Record<SkillColumn, HTMLDivElement | null>>({
    winner: null, burnout: null, aspire: null, irrelevant: null,
  });

  const inColumn = (col: SkillColumn) =>
    skills.filter(s => assignments[s.id] === col);
  const inPool = skills.filter(s => assignments[s.id] === 'pool');
  const winnerCount = inColumn('winner').length;
  const placedCount = skills.length - inPool.length;

  const handleDragEnd = (id: number, info: { point: { x: number; y: number } }) => {
    for (const c of COLUMNS) {
      const el = columnRefs.current[c.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (info.point.x >= r.left && info.point.x <= r.right && info.point.y >= r.top && info.point.y <= r.bottom) {
        if (c.id === 'winner' && winnerCount >= 7 && assignments[id] !== 'winner') return;
        setAssignments(prev => ({ ...prev, [id]: c.id }));
        return;
      }
    }
  };

  const cycle = (id: number) => {
    const order: Bucket[] = ['pool', 'winner', 'burnout', 'aspire', 'irrelevant'];
    const cur = assignments[id];
    let next = order[(order.indexOf(cur) + 1) % order.length];
    if (next === 'winner' && winnerCount >= 7) next = 'burnout';
    setAssignments(prev => ({ ...prev, [id]: next }));
  };

  const reset = (id: number) => setAssignments(prev => ({ ...prev, [id]: 'pool' }));

  const handleComplete = () => {
    if (inPool.length > 0) {
      setError(`נותרו ${inPool.length} כישורים בבריכה. גררו או הקישו על כל אחד לעמודה.`);
      return;
    }
    if (winnerCount < 5) {
      setError(`יש לבחור לפחות 5 כישורים לארגז המנצח. כרגע: ${winnerCount}.`);
      return;
    }
    setError(null);
    burstConfetti();
    const final: Record<number, SkillColumn> = {};
    Object.entries(assignments).forEach(([k, v]) => { if (v !== 'pool') final[Number(k)] = v; });
    onComplete(final);
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center px-3 py-8 fade-in">
      <div className="w-full max-w-5xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm border border-secondary/15">
            ✦ כישורים
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            גררו כל כישור לעמודה
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            גררו (או הקישו לסבב) • מינימום 5, מקסימום 7 ב"ארגז המנצח"
          </p>
        </div>

        {/* Pool */}
        <div className="bg-card/60 backdrop-blur rounded-3xl p-4 border border-border/60 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold font-display text-foreground tracking-wide">בריכת הכישורים</span>
            <span className="text-xs text-muted-foreground">{placedCount}/{skills.length} מוינו · ארגז מנצח {winnerCount}/7</span>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[56px]">
            <AnimatePresence>
              {inPool.length === 0 && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground italic px-2 py-2"
                >
                  הבריכה ריקה — כל הכישורים מוינו ✓
                </motion.span>
              )}
              {inPool.map(skill => (
                <motion.button
                  key={skill.id}
                  layout
                  drag
                  dragSnapToOrigin
                  dragElastic={0.4}
                  whileDrag={{ scale: 1.06, zIndex: 50, boxShadow: '0 12px 30px hsl(var(--foreground)/0.18)' }}
                  onDragEnd={(_, info) => handleDragEnd(skill.id, info)}
                  onClick={() => cycle(skill.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="cursor-grab active:cursor-grabbing select-none text-right px-3 py-2 rounded-2xl bg-background border-2 border-border/60 hover:border-secondary/40 text-sm font-medium text-foreground max-w-[260px] touch-none"
                >
                  <span className="text-xs text-muted-foreground ms-1">{skill.id}.</span> {skill.text}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {COLUMNS.map(col => {
            const items = inColumn(col.id);
            const full = col.id === 'winner' && winnerCount >= 7;
            return (
              <div
                key={col.id}
                ref={el => (columnRefs.current[col.id] = el)}
                className={`rounded-3xl border-2 p-3 min-h-[200px] transition-all ${col.accent} ${full ? 'opacity-90' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold font-display text-foreground flex items-center gap-1.5">
                    <span className="text-lg">{col.emoji}</span> {col.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{items.length}{col.id === 'winner' ? '/7' : ''}</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {items.map(skill => (
                      <motion.div
                        key={skill.id}
                        layout
                        drag
                        dragSnapToOrigin
                        dragElastic={0.4}
                        whileDrag={{ scale: 1.06, zIndex: 50 }}
                        onDragEnd={(_, info) => handleDragEnd(skill.id, info)}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        onDoubleClick={() => reset(skill.id)}
                        className="cursor-grab active:cursor-grabbing select-none text-right px-3 py-2 rounded-2xl bg-card border border-border/60 text-xs font-medium text-foreground leading-snug touch-none shadow-sm"
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); reset(skill.id); }}
                          className="float-left text-muted-foreground hover:text-destructive ms-1 text-base leading-none"
                          aria-label="הסר"
                        >×</button>
                        {skill.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground/70 py-6 italic">גררו לכאן</p>
                  )}
                </div>
              </div>
            );
          })}
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

export default SkillsDragColumns;
