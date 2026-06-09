import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayShell, { DoneScreen } from "./PlayShell";
import { setComplete } from "./playStorage";
import { Trophy, Sparkles, Flame, EyeOff } from "lucide-react";

const SKILLS = [
  "ניהול פרויקטים",
  "כתיבה",
  "ניתוח נתונים",
  "מנטורינג",
  "מכירות",
  "תכנון אסטרטגי",
  "עיצוב חזותי",
  "תקשורת בין־אישית",
  "ניהול תקציב",
  "פתרון בעיות",
  "הוראה",
  "טכנולוגיה",
];

type Bucket = "winners" | "aspirations" | "burners" | "not_relevant";

const BUCKETS: { id: Bucket; label: string; Icon: any; color: string }[] = [
  { id: "winners", label: "מנצחים", Icon: Trophy, color: "from-amber-400 to-orange-500" },
  { id: "aspirations", label: "שאיפות", Icon: Sparkles, color: "from-violet-400 to-fuchsia-500" },
  { id: "burners", label: "שורפים", Icon: Flame, color: "from-rose-400 to-red-500" },
  { id: "not_relevant", label: "לא רלוונטי", Icon: EyeOff, color: "from-slate-400 to-slate-600" },
];

export default function PlaySkills() {
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<Record<Bucket, string[]>>({
    winners: [],
    aspirations: [],
    burners: [],
    not_relevant: [],
  });
  const [done, setDone] = useState(false);
  const [flying, setFlying] = useState<Bucket | null>(null);

  const current = SKILLS[idx];

  const assign = (b: Bucket) => {
    if (flying) return;
    setFlying(b);
    setTimeout(() => {
      const next = { ...result, [b]: [...result[b], current] };
      setResult(next);
      setFlying(null);
      if (idx + 1 >= SKILLS.length) {
        setComplete("skills", next);
        setDone(true);
      } else {
        setIdx(idx + 1);
      }
    }, 450);
  };

  return (
    <PlayShell
      title="The Champion Draft"
      step={idx + 1}
      total={SKILLS.length}
      bg="bg-background"
    >
      {done ? (
        <DoneScreen title="הכישורים שלך מסודרים." subtitle="הצוות הראשי שלך מוכן.">
          <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm text-right">
            {BUCKETS.map((b) => (
              <div key={b.id} className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                  <b.Icon className="w-3 h-3" />
                  {b.label}
                </div>
                <div className="text-xs">
                  {result[b.id].length ? result[b.id].join(" · ") : "—"}
                </div>
              </div>
            ))}
          </div>
        </DoneScreen>
      ) : (
        <div className="flex-1 flex flex-col px-5 py-6">
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current + (flying || "")}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={
                  flying
                    ? {
                        opacity: 0,
                        scale: 0.6,
                        x:
                          flying === "winners"
                            ? -120
                            : flying === "aspirations"
                              ? 120
                              : flying === "burners"
                                ? -120
                                : 120,
                        y: flying === "winners" || flying === "aspirations" ? 200 : 280,
                        rotate: flying === "winners" || flying === "burners" ? -15 : 15,
                      }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
                className="w-64 h-80 rounded-3xl bg-gradient-to-br from-white via-slate-100 to-slate-200 text-slate-900 shadow-2xl border border-white/40 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="text-[10px] tracking-[0.3em] opacity-50 mb-3">SKILL CARD</div>
                <div className="text-2xl font-bold leading-tight">{current}</div>
                <div className="mt-auto pt-6 text-xs opacity-60">
                  {idx + 1} מתוך {SKILLS.length}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {BUCKETS.map((b) => (
              <motion.button
                key={b.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => assign(b.id)}
                className={`relative rounded-2xl bg-gradient-to-br ${b.color} text-white p-3 text-right overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{b.label}</span>
                  <b.Icon className="w-4 h-4 opacity-80" />
                </div>
                <div className="text-[10px] opacity-80 mt-1 tabular-nums">
                  {result[b.id].length} כרטיסים
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </PlayShell>
  );
}
