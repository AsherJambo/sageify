import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Anchor,
  Puzzle,
  Layers,
  Scale,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Clock,
} from "lucide-react";
import { getProgress, resetProgress, type PlayGameId } from "./playStorage";

type Card = {
  id: PlayGameId;
  num: string;
  title: string;
  subtitle: string;
  minutes: string;
  Icon: any;
  to: string;
  gradient: string;
  glow: string;
};

const cards: Card[] = [
  {
    id: "via",
    num: "#02",
    title: "VIA — חוזקות אופי",
    subtitle: "The Core Forge",
    minutes: "4 דק׳",
    Icon: Sparkles,
    to: "/play/via",
    gradient: "from-violet-500/20 via-fuchsia-500/10 to-indigo-500/20",
    glow: "shadow-[0_20px_60px_-20px_rgba(139,92,246,0.45)]",
  },
  {
    id: "schein",
    num: "#03",
    title: "Schein — עוגני קריירה",
    subtitle: "Weight of the Anchor",
    minutes: "5 דק׳",
    Icon: Anchor,
    to: "/play/schein",
    gradient: "from-sky-500/20 via-cyan-400/10 to-teal-500/20",
    glow: "shadow-[0_20px_60px_-20px_rgba(14,165,233,0.45)]",
  },
  {
    id: "thinking",
    num: "#05",
    title: "חשיבה — דפוסים",
    subtitle: "The Laser Matrix",
    minutes: "6 דק׳",
    Icon: Puzzle,
    to: "/play/thinking",
    gradient: "from-emerald-500/20 via-lime-400/10 to-cyan-500/20",
    glow: "shadow-[0_20px_60px_-20px_rgba(16,185,129,0.45)]",
  },
  {
    id: "skills",
    num: "#06",
    title: "מיון כישורים",
    subtitle: "The Champion Draft",
    minutes: "5 דק׳",
    Icon: Layers,
    to: "/play/skills",
    gradient: "from-amber-500/20 via-orange-400/10 to-rose-500/20",
    glow: "shadow-[0_20px_60px_-20px_rgba(245,158,11,0.45)]",
  },
  {
    id: "considerations",
    num: "#07",
    title: "שיקולי קריירה",
    subtitle: "Energy Balancer",
    minutes: "4 דק׳",
    Icon: Scale,
    to: "/play/considerations",
    gradient: "from-rose-500/20 via-pink-400/10 to-violet-500/20",
    glow: "shadow-[0_20px_60px_-20px_rgba(244,63,94,0.45)]",
  },
];

export default function PlayHub() {
  const [progress, setProgress] = useState(getProgress());

  useEffect(() => {
    const onFocus = () => setProgress(getProgress());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const completed = cards.filter((c) => progress[c.id].completed).length;
  const pct = Math.round((completed / cards.length) * 100);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            דף הבית
          </Link>
          <button
            onClick={() => {
              resetProgress();
              setProgress(getProgress());
            }}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition"
          >
            <RotateCcw className="w-3 h-3" />
            איפוס
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-xs tracking-[0.3em] text-slate-400 mb-3">PLAY MODE</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            המשחקים שלך,
            <br />
            <span className="bg-gradient-to-l from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
              ה־DNA הקריירתי שלך.
            </span>
          </h1>
          <p className="mt-4 text-slate-500 leading-relaxed">
            חמש חוויות אינטראקטיביות קצרות. בלי שאלונים יבשים — רק תנועה, משחק ותובנות מיידיות.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>התקדמות</span>
              <span className="font-semibold text-slate-700">{completed}/{cards.length}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-l from-violet-500 to-fuchsia-500"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4">
          {cards.map((c, i) => {
            const done = progress[c.id].completed;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              >
                <Link
                  to={c.to}
                  className={`group relative block overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 ${c.glow}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-60 pointer-events-none`} />
                  <div className="relative flex items-center gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/80 backdrop-blur border border-white shadow-sm flex items-center justify-center">
                      <c.Icon className="w-6 h-6 text-slate-800" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-slate-500">
                        <span>{c.num}</span>
                        <span className="opacity-50">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {c.minutes}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-lg leading-tight">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{c.subtitle}</p>
                    </div>
                    {done ? (
                      <div className="shrink-0 inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        הושלם
                      </div>
                    ) : (
                      <div className="shrink-0 text-xs font-semibold text-slate-900 group-hover:translate-x-[-2px] transition">
                        התחל ←
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          המשחקים נשמרים מקומית במכשיר שלך.
        </p>
      </div>
    </div>
  );
}
