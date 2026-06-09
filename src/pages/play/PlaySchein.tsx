import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayShell, { DoneScreen } from "./PlayShell";
import { setComplete } from "./playStorage";
import { Anchor } from "lucide-react";

const ANCHORS = [
  { id: "autonomy", label: "אוטונומיה ועצמאות" },
  { id: "security", label: "ביטחון ויציבות" },
  { id: "technical", label: "מומחיות טכנית" },
  { id: "managerial", label: "ניהול כללי" },
  { id: "entrepreneur", label: "יזמות" },
  { id: "service", label: "שליחות ועזרה לזולת" },
  { id: "challenge", label: "אתגר טהור" },
  { id: "lifestyle", label: "איזון חיים" },
];

// Build single-elimination bracket
function buildBracket(items: typeof ANCHORS) {
  const rounds: [typeof ANCHORS[0], typeof ANCHORS[0]][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rounds.push([items[i], items[i + 1]]);
  }
  return rounds;
}

export default function PlaySchein() {
  const initial = useMemo(() => buildBracket(ANCHORS), []);
  const [queue, setQueue] = useState(initial);
  const [winners, setWinners] = useState<typeof ANCHORS>([]);
  const [eliminated, setEliminated] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [champion, setChampion] = useState<typeof ANCHORS[0] | null>(null);

  const total = ANCHORS.length - 1;
  const step = total - (queue.length + (winners.length > 0 ? Math.ceil(winners.length / 2) : 0)) + 1;

  const pick = (winner: typeof ANCHORS[0], loser: typeof ANCHORS[0]) => {
    setEliminated(loser.id);
    setTimeout(() => {
      setEliminated(null);
      const newWinners = [...winners, winner];
      const newQueue = queue.slice(1);
      if (newQueue.length === 0) {
        // round done
        if (newWinners.length === 1) {
          setChampion(newWinners[0]);
          setComplete("schein", newWinners[0]);
          setDone(true);
          return;
        }
        setQueue(buildBracket(newWinners));
        setWinners([]);
      } else {
        setQueue(newQueue);
        setWinners(newWinners);
      }
    }, 700);
  };

  const current = queue[0];

  return (
    <PlayShell
      title="Weight of the Anchor"
      step={Math.max(1, step)}
      total={total}
      bg="bg-background"
    >
      {done && champion ? (
        <DoneScreen title="העוגן שלך נמצא." subtitle="זה הדבר שלא תוותר עליו.">
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur">
            <Anchor className="w-6 h-6" />
            <span className="font-bold text-lg">{champion.label}</span>
          </div>
        </DoneScreen>
      ) : (
        <div className="flex-1 flex flex-col px-5 py-6">
          <p className="text-center text-sm opacity-80 mb-6">
            בחר/י את העוגן שאת/ה <span className="font-bold">לא מוכן/ה</span> להשליך
          </p>

          {/* Wavy ship illustration */}
          <div className="relative h-20 mb-4 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-700/40 to-sky-900/60">
            <motion.div
              animate={{ x: [0, 6, 0], rotate: [-1, 1, -1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute left-1/2 top-3 -translate-x-1/2 text-3xl"
            >
              ⛵
            </motion.div>
            <svg className="absolute bottom-0 inset-x-0" viewBox="0 0 100 20" preserveAspectRatio="none" style={{ height: 24 }}>
              <path d="M0 10 Q 25 0 50 10 T 100 10 V20 H0 Z" fill="rgba(255,255,255,0.1)" />
            </svg>
          </div>

          {current && (
            <div className="grid grid-cols-2 gap-3 flex-1 content-center">
              {current.map((a) => (
                <AnchorCard
                  key={a.id}
                  label={a.label}
                  eliminated={eliminated === a.id}
                  onClick={() => {
                    const loser = current.find((x) => x.id !== a.id)!;
                    pick(a, loser);
                  }}
                />
              ))}
            </div>
          )}

          <AnimatePresence>
            {eliminated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-xs opacity-60 mt-4"
              >
                💦 שקע במצולות
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PlayShell>
  );
}

function AnchorCard({
  label,
  onClick,
  eliminated,
}: {
  label: string;
  onClick: () => void;
  eliminated: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={eliminated}
      initial={{ opacity: 0, y: 20 }}
      animate={
        eliminated
          ? { y: 600, opacity: 0, rotate: 30 }
          : { opacity: 1, y: 0 }
      }
      transition={{ duration: eliminated ? 0.6 : 0.4, ease: "easeIn" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className="relative h-44 rounded-3xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500 text-slate-900 p-4 flex flex-col items-center justify-center text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border border-white/40"
    >
      <Anchor className="w-10 h-10 mb-2 text-slate-800" strokeWidth={2} />
      <span className="font-bold leading-tight">{label}</span>
    </motion.button>
  );
}
