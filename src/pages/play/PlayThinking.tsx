import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayShell, { DoneScreen } from "./PlayShell";
import { setComplete } from "./playStorage";
import { Check, X } from "lucide-react";

// Each puzzle: 3x3 grid of shapes; one missing; options
// Shapes encoded as emoji-like glyphs for simplicity.
type Puzzle = {
  grid: (string | null)[]; // length 9; null = missing slot
  options: string[];
  answer: number;
};

const PUZZLES: Puzzle[] = [
  {
    grid: ["▲", "■", "●", "■", "●", "▲", "●", "▲", null],
    options: ["■", "●", "▲", "◆"],
    answer: 0,
  },
  {
    grid: ["○", "○", "○", "△", "△", "△", "□", "□", null],
    options: ["○", "△", "□", "◇"],
    answer: 2,
  },
  {
    grid: ["1", "2", "3", "2", "4", "6", "3", "6", null],
    options: ["7", "8", "9", "10"],
    answer: 2,
  },
  {
    grid: ["◐", "◓", "◑", "◓", "◑", "◐", "◑", "◐", null],
    options: ["◐", "◓", "◑", "●"],
    answer: 1,
  },
  {
    grid: ["★", "☆", "★", "☆", "★", "☆", "★", "☆", null],
    options: ["☆", "★", "✦", "✧"],
    answer: 1,
  },
];

export default function PlayThinking() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const p = PUZZLES[idx];

  const pick = (i: number) => {
    if (feedback) return;
    setPicked(i);
    const ok = i === p.answer;
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= PUZZLES.length) {
        setComplete("thinking", { score: ok ? score + 1 : score, total: PUZZLES.length });
        setDone(true);
      } else {
        setIdx(idx + 1);
        setFeedback(null);
        setPicked(null);
      }
    }, 900);
  };

  return (
    <PlayShell
      title="The Laser Matrix"
      step={idx + 1}
      total={PUZZLES.length}
      bg="bg-background"
    >
      {done ? (
        <DoneScreen
          title="הכספת נפרצה."
          subtitle={`פתרת ${score} מתוך ${PUZZLES.length} חידות.`}
        />
      ) : (
        <div className="flex-1 px-5 py-6 flex flex-col items-center">
          <div className="relative w-full max-w-xs aspect-square rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-emerald-500/10 p-4 shadow-[0_0_60px_-10px_rgba(16,185,129,0.4)]">
            {/* Scanline */}
            <motion.div
              animate={{ y: [0, 240, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-x-2 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
            />
            <div className="grid grid-cols-3 gap-2 h-full">
              {p.grid.map((cell, i) => (
                <div
                  key={i}
                  className={`rounded-xl flex items-center justify-center text-3xl font-light ${
                    cell === null
                      ? "border-2 border-dashed border-emerald-400/60 bg-emerald-400/5"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {cell === null && feedback === "correct" ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-emerald-300"
                    >
                      {p.options[p.answer]}
                    </motion.span>
                  ) : (
                    <span className="text-white/90">{cell}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs opacity-60 mt-6 mb-3">איזה חלק חסר?</p>
          <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
            {p.options.map((o, i) => {
              const isPicked = picked === i;
              const state =
                feedback && isPicked
                  ? feedback === "correct"
                    ? "ring-2 ring-emerald-400 bg-emerald-500/20"
                    : "ring-2 ring-rose-400 bg-rose-500/20"
                  : "bg-white/5 hover:bg-white/10";
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => pick(i)}
                  className={`aspect-square rounded-2xl border border-white/10 text-3xl flex items-center justify-center transition ${state}`}
                >
                  {o}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                  feedback === "correct"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {feedback === "correct" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {feedback === "correct" ? "פיצוח!" : "כמעט"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PlayShell>
  );
}
