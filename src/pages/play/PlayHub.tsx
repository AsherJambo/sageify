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
  tint: string;
  iconBg: string;
};

const cards: Card[] = [
  {
    id: "via",
    to: "/play/via",
    num: "#02",
    title: "VIA — חוזקות אופי",
    subtitle: "ליבת הזהות שלך",
    minutes: "4 דק׳",
    Icon: Sparkles,
    tint: "bg-accent/20 border-accent/50",
    iconBg: "bg-accent text-foreground",
  },
  {
    id: "schein",
    to: "/play/schein",
    num: "#03",
    title: "Schein — עוגני קריירה",
    subtitle: "מה באמת מחזיק אותך",
    minutes: "5 דק׳",
    Icon: Anchor,
    tint: "bg-sage/20 border-sage/50",
    iconBg: "bg-sage text-foreground",
  },
  {
    id: "thinking",
    to: "/play/thinking",
    num: "#05",
    title: "חשיבה — דפוסים",
    subtitle: "המטריצה האישית",
    minutes: "6 דק׳",
    Icon: Puzzle,
    tint: "bg-sky-soft border-sky/50",
    iconBg: "bg-sky text-foreground",
  },
  {
    id: "skills",
    to: "/play/skills",
    num: "#06",
    title: "מיון כישורים",
    subtitle: "ארגז הכלים שלך",
    minutes: "5 דק׳",
    Icon: Layers,
    tint: "bg-sunny-soft border-sunny/50",
    iconBg: "bg-sunny text-foreground",
  },
  {
    id: "considerations",
    to: "/play/considerations",
    num: "#07",
    title: "שיקולי קריירה",
    subtitle: "מה חשוב באמת",
    minutes: "4 דק׳",
    Icon: Scale,
    tint: "bg-coral-soft border-coral/50",
    iconBg: "bg-destructive text-destructive-foreground",
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
    <div dir="rtl" className="min-h-screen bg-background text-foreground relative">
      {/* Cozy ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-sage/25 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <header className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70 hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            דף הבית
          </Link>
          <button
            onClick={() => {
              resetProgress();
              setProgress(getProgress());
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/55 hover:text-foreground transition px-3 py-2 rounded-full border-2 border-foreground/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            איפוס
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-sage/15 text-foreground border-2 border-sage/40">
            <Sparkles size={16} />
            המשחקים של סגי'
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">
            המשחקים שלך,
            <br />
            <span style={{ color: 'hsl(var(--accent))' }}>ה־DNA הקריירתי שלך.</span>
          </h1>
          <p className="mt-4 text-lg text-foreground/75 leading-relaxed">
            חמש חוויות אינטראקטיביות קצרות. בלי שאלונים יבשים — רק תנועה, משחק ותובנות מיידיות.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm font-semibold text-foreground/70 mb-2">
              <span>התקדמות</span>
              <span className="px-3 py-1 rounded-full bg-accent text-foreground border-2 border-foreground/15 text-xs tabular-nums"
                style={{ boxShadow: '0 2px 0 0 hsl(var(--foreground) / 0.20)' }}>
                {completed}/{cards.length}
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden border-2 border-foreground/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-l from-[hsl(var(--accent))] to-[hsl(var(--destructive))]"
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
                  className={`group relative block rounded-[1.75rem] border-2 p-5 transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 ${c.tint}`}
                  style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.14)' }}
                >
                  <div className="relative flex items-center gap-4">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-foreground/15 ${c.iconBg}`}
                      style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.20)' }}>
                      <c.Icon className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] font-bold text-foreground/55">
                        <span>{c.num}</span>
                        <span className="opacity-50">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {c.minutes}
                        </span>
                      </div>
                      <h3 className="mt-1 font-serif text-xl leading-tight">{c.title}</h3>
                      <p className="text-sm text-foreground/65 mt-0.5">{c.subtitle}</p>
                    </div>
                    {done ? (
                      <div className="shrink-0 inline-flex items-center gap-1 text-[hsl(var(--success))] text-sm font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        הושלם
                      </div>
                    ) : (
                      <div className="shrink-0 text-sm font-bold text-foreground inline-flex items-center gap-1 transition group-hover:-translate-x-0.5">
                        התחל
                        <ArrowLeft className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-sm text-foreground/55 mt-10">
          המשחקים נשמרים מקומית במכשיר שלך 🦉
        </p>
      </div>
    </div>
  );
}

// Add `to` prop to cards via type fix
declare module './PlayHub' {}
