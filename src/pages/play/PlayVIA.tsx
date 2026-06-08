import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayShell, { DoneScreen } from "./PlayShell";
import { setComplete } from "./playStorage";

const STRENGTHS = [
  "יצירתיות",
  "סקרנות",
  "אומץ",
  "התמדה",
  "כנות",
  "חיוניות",
  "אהבה",
  "חסד",
  "אינטליגנציה חברתית",
  "עבודת צוות",
  "הוגנות",
  "מנהיגות",
  "סליחה",
  "ענווה",
  "זהירות",
  "ויסות עצמי",
  "הערכת יופי",
  "תקווה",
  "הומור",
  "רוחניות",
];

const COLORS = [
  "from-violet-400 to-fuchsia-500",
  "from-sky-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-indigo-400 to-violet-500",
];

export default function PlayVIA() {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [pulse, setPulse] = useState(0);

  const items = useMemo(
    () =>
      STRENGTHS.map((s, i) => ({
        name: s,
        color: COLORS[i % COLORS.length],
        // pseudo-random scattered positions
        x: ((i * 53) % 80) + 10,
        y: ((i * 31) % 60) + 5,
        delay: (i * 0.04) % 0.6,
      })),
    [],
  );

  const toggle = (name: string) => {
    if (picked.includes(name)) {
      setPicked(picked.filter((n) => n !== name));
      return;
    }
    if (picked.length >= 5) return;
    setPulse((p) => p + 1);
    const next = [...picked, name];
    setPicked(next);
    if (next.length === 5) {
      setTimeout(() => {
        setComplete("via", next);
        setDone(true);
      }, 900);
    }
  };

  return (
    <PlayShell
      title="The Core Forge"
      step={picked.length}
      total={5}
      bg="bg-gradient-to-b from-[#0b0420] via-[#120833] to-[#05010f]"
    >
      {done ? (
        <DoneScreen title="הליבה זהרה." subtitle="חמש החוזקות שלך נחרטו במרכז.">
          <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-sm">
            {picked.map((n) => (
              <span
                key={n}
                className="px-3 py-1.5 text-xs rounded-full bg-white/10 border border-white/20 backdrop-blur"
              >
                {n}
              </span>
            ))}
          </div>
        </DoneScreen>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          {/* Core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                boxShadow: [
                  "0 0 60px 10px rgba(168,85,247,0.35)",
                  "0 0 90px 20px rgba(236,72,153,0.55)",
                  "0 0 60px 10px rgba(168,85,247,0.35)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-36 h-36 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-600 flex items-center justify-center"
            >
              <div className="w-28 h-28 rounded-full bg-black/40 backdrop-blur flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-bold tabular-nums">{picked.length}</div>
                <div className="text-[10px] tracking-[0.25em] opacity-70">/ 5</div>
              </div>
            </motion.div>
            <AnimatePresence>
              {pulse > 0 && (
                <motion.div
                  key={pulse}
                  initial={{ scale: 0.4, opacity: 0.6 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 rounded-full border-2 border-fuchsia-400/60 pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Crystals */}
          <div className="relative w-full h-[520px]">
            {items.map((it) => {
              const isPicked = picked.includes(it.name);
              return (
                <motion.button
                  key={it.name}
                  onClick={() => toggle(it.name)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: isPicked ? 0.35 : 1,
                    scale: isPicked ? 0.85 : 1,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.4 },
                    y: { duration: 3 + (it.delay * 4), repeat: Infinity, delay: it.delay },
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    left: `${it.x}%`,
                    top: `${it.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-br ${it.color} shadow-lg border border-white/20`}
                >
                  {it.name}
                </motion.button>
              );
            })}
          </div>

          <div className="absolute bottom-4 inset-x-0 text-center text-xs opacity-70 px-6">
            הקש על 5 חוזקות שמדליקות אותך
          </div>
        </div>
      )}
    </PlayShell>
  );
}
