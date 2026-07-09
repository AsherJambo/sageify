import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Stethoscope,
  Droplet,
  Thermometer,
  Wind,
  Pill,
  Bandage,
  FileCheck2,
  Heart,
  ArrowLeft,
  Timer,
  Trophy,
} from "lucide-react";

// ============================================================
// Nursing (ER Shift) — a fast-paced triage micro-game
// Route: /nursing-er
// ============================================================

type ActionId = "oxygen" | "bandage" | "meds" | "discharge";

interface Vitals {
  oxygen: number; // %
  bpSys: number; // mmHg
  bpDia: number;
  temp: number; // °C
  bleeding: boolean;
}

interface Patient {
  id: number;
  name: string;
  emoji: string;
  complaint: string;
  vitals: Vitals;
  required: ActionId[]; // must include "discharge" as last
}

const NAMES = [
  "מר כהן", "גב' לוי", "מר אבוטבול", "גב' פרץ", "מר ביטון",
  "גב' שפירא", "מר מזרחי", "גב' דהן", "מר אזולאי", "גב' חדד",
];
const EMOJIS = ["🧓", "👴", "👵", "🧔", "👨‍🦳", "👩‍🦳"];

const COMPLAINTS = [
  "קוצר נשימה חד",
  "פציעת ראש עם דימום",
  "כאב חזה וחום גבוה",
  "סחרחורת ורעד",
  "פצע פתוח ברגל",
  "שיעול וחום",
  "חולשה כללית",
  "כווייה קלה ביד",
];

function randomPatient(id: number): Patient {
  const oxygen = Math.random() < 0.55 ? 82 + Math.floor(Math.random() * 8) : 92 + Math.floor(Math.random() * 7);
  const temp = Math.random() < 0.55 ? 38.2 + Math.random() * 1.6 : 36.4 + Math.random() * 1.0;
  const bleeding = Math.random() < 0.5;
  const bpSys = 100 + Math.floor(Math.random() * 60);
  const bpDia = 60 + Math.floor(Math.random() * 30);

  const required: ActionId[] = [];
  if (oxygen < 90) required.push("oxygen");
  if (bleeding) required.push("bandage");
  if (temp >= 38) required.push("meds");
  // Guarantee at least one treatment
  if (required.length === 0) required.push("meds");
  required.push("discharge");

  return {
    id,
    name: NAMES[id % NAMES.length],
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    complaint: COMPLAINTS[Math.floor(Math.random() * COMPLAINTS.length)],
    vitals: { oxygen, temp: +temp.toFixed(1), bleeding, bpSys, bpDia },
    required,
  };
}

const ACTION_META: Record<ActionId, { label: string; Icon: any; tint: string }> = {
  oxygen: { label: "מסכת חמצן", Icon: Wind, tint: "bg-sky text-white" },
  bandage: { label: "חבישה", Icon: Bandage, tint: "bg-coral text-white" },
  meds: { label: "מתן תרופה", Icon: Pill, tint: "bg-secondary text-secondary-foreground" },
  discharge: { label: "תיעוד ושחרור", Icon: FileCheck2, tint: "bg-success text-white" },
};

const SHIFT_SECONDS = 90;

export default function NursingER() {
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [score, setScore] = useState(0);
  const [treated, setTreated] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SHIFT_SECONDS);
  const [patient, setPatient] = useState<Patient>(() => randomPatient(1));
  const [vitalsShown, setVitalsShown] = useState(false);
  const [sequence, setSequence] = useState<ActionId[]>([]);
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setPhase("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1200);
    return () => clearTimeout(t);
  }, [flash]);

  const nextPatient = (id: number) => {
    setPatient(randomPatient(id));
    setVitalsShown(false);
    setSequence([]);
  };

  const startShift = () => {
    setScore(0);
    setTreated(0);
    setMissed(0);
    setTimeLeft(SHIFT_SECONDS);
    nextPatient(1);
    setPhase("playing");
  };

  const addAction = (a: ActionId) => {
    if (!vitalsShown) {
      setFlash({ msg: "קודם בדוק סימנים חיוניים!", ok: false });
      setScore((s) => Math.max(0, s - 2));
      return;
    }
    if (sequence.includes(a)) return;

    if (a === "discharge") {
      // Evaluate: needed treatments must all be present before discharge
      const needed = patient.required.slice(0, -1); // exclude discharge
      const gotAll = needed.every((n) => sequence.includes(n));
      const extra = sequence.filter((x) => !needed.includes(x)).length;

      if (!gotAll) {
        setFlash({ msg: "החולה לא מוכן לשחרור — טיפולים חסרים!", ok: false });
        setScore((s) => Math.max(0, s - 10));
        setMissed((m) => m + 1);
      } else {
        const bonus = 20 + needed.length * 10 - extra * 5;
        setFlash({ msg: `שוחרר! +${bonus} נקודות`, ok: true });
        setScore((s) => s + bonus);
        setTreated((t) => t + 1);
      }
      setTimeout(() => nextPatient(patient.id + 1), 700);
      return;
    }

    setSequence((seq) => [...seq, a]);
    const needed = patient.required.slice(0, -1);
    if (needed.includes(a)) {
      setFlash({ msg: "טיפול נכון ✓", ok: true });
      setScore((s) => s + 5);
    } else {
      setFlash({ msg: "טיפול לא נדרש", ok: false });
      setScore((s) => Math.max(0, s - 3));
    }
  };

  const checkVitals = () => {
    if (vitalsShown) return;
    setVitalsShown(true);
    setScore((s) => s + 1);
  };

  const skipPatient = () => {
    setMissed((m) => m + 1);
    setScore((s) => Math.max(0, s - 5));
    nextPatient(patient.id + 1);
  };

  // ---------------- Render ----------------

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-coral/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-sky/25 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6">
        <header className="flex items-center justify-between mb-6">
          <Link
            to="/play"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70 hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            מרכז המשחקים
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-coral/15 text-coral border-2 border-coral/40">
            <Stethoscope size={14} />
            Track #03 · Nursing (ER Shift)
          </span>
        </header>

        {phase === "intro" && <Intro onStart={startShift} />}

        {phase === "playing" && (
          <PlayingUI
            patient={patient}
            vitalsShown={vitalsShown}
            sequence={sequence}
            score={score}
            treated={treated}
            missed={missed}
            timeLeft={timeLeft}
            flash={flash}
            onCheckVitals={checkVitals}
            onAction={addAction}
            onSkip={skipPatient}
          />
        )}

        {phase === "done" && (
          <DoneUI score={score} treated={treated} missed={missed} onRetry={startShift} />
        )}
      </div>
    </div>
  );
}

// ---------------- Sub-components ----------------

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card border-2 border-foreground/10 p-6 md:p-8"
      style={{ boxShadow: "0 6px 0 0 hsl(var(--foreground) / 0.12)" }}
    >
      <div className="text-6xl mb-3">🚑</div>
      <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-2">
        משמרת חדר מיון
      </h1>
      <p className="text-lg text-foreground/75 leading-relaxed mb-5">
        משחק מהיר: חולים מגיעים עם תלונה. קודם בדוק סימנים חיוניים, ואז החלט על סדר הטיפולים הנכון.
        <br />
        <strong>כל טיפול חייב להסתיים ב"תיעוד ושחרור" — אחרת החולה לא זז והנקודות יורדות.</strong>
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-6 text-right">
        <Rule n={1} text="בדוק Vitals לפני כל טיפול" />
        <Rule n={2} text="חמצן<90 · דימום · חום גבוה — פעל בהתאם" />
        <Rule n={3} text="סיים תמיד ב'תיעוד ושחרור' 📋" />
      </div>

      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-foreground/15 transition-all hover:-translate-y-1 active:translate-y-0.5"
        style={{ boxShadow: "0 5px 0 0 hsl(var(--foreground) / 0.30)", minHeight: 56 }}
      >
        <Activity className="w-5 h-5" />
        התחלת המשמרת ({SHIFT_SECONDS} שניות)
      </button>
    </motion.div>
  );
}

function Rule({ n, text }: { n: number; text: string }) {
  return (
    <div className="bg-background/70 rounded-xl p-3 border-2 border-foreground/10 flex items-start gap-2">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-coral/20 text-coral text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <span className="text-sm text-foreground/85 leading-snug">{text}</span>
    </div>
  );
}

function PlayingUI(props: {
  patient: Patient;
  vitalsShown: boolean;
  sequence: ActionId[];
  score: number;
  treated: number;
  missed: number;
  timeLeft: number;
  flash: { msg: string; ok: boolean } | null;
  onCheckVitals: () => void;
  onAction: (a: ActionId) => void;
  onSkip: () => void;
}) {
  const { patient, vitalsShown, sequence, score, treated, missed, timeLeft, flash } = props;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        <Stat icon={<Timer className="w-4 h-4" />} label="זמן" value={`${timeLeft}s`} accent={timeLeft <= 15 ? "text-coral" : ""} />
        <Stat icon={<Trophy className="w-4 h-4" />} label="ניקוד" value={score} />
        <Stat icon={<Heart className="w-4 h-4" />} label="שוחררו" value={treated} />
        <Stat icon={<Activity className="w-4 h-4" />} label="פספוסים" value={missed} />
      </div>

      {/* Patient card */}
      <motion.div
        key={patient.id}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-card border-2 border-foreground/10 p-5"
        style={{ boxShadow: "0 6px 0 0 hsl(var(--foreground) / 0.12)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">{patient.emoji}</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-foreground/55 tracking-widest">חולה #{patient.id}</div>
            <div className="font-serif text-xl">{patient.name}</div>
          </div>
          <button
            onClick={props.onSkip}
            className="text-xs font-semibold text-foreground/55 hover:text-coral px-3 py-1.5 rounded-full border-2 border-foreground/10"
          >
            דלג (-5)
          </button>
        </div>

        <div className="rounded-2xl bg-coral/10 border-2 border-coral/30 p-3 mb-4">
          <div className="text-[11px] font-bold text-coral tracking-widest mb-0.5">תלונה עיקרית</div>
          <div className="text-base font-semibold">{patient.complaint}</div>
        </div>

        {/* Vitals */}
        {!vitalsShown ? (
          <button
            onClick={props.onCheckVitals}
            className="w-full bg-sky text-white rounded-2xl py-4 font-bold text-base border-2 border-foreground/15 transition-all hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center justify-center gap-2"
            style={{ boxShadow: "0 4px 0 0 hsl(var(--foreground) / 0.22)", minHeight: 56 }}
          >
            <Stethoscope className="w-5 h-5" />
            בדוק סימנים חיוניים
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2"
          >
            <Vital icon={<Wind className="w-4 h-4" />} label="חמצן" value={`${patient.vitals.oxygen}%`} warn={patient.vitals.oxygen < 90} />
            <Vital icon={<Activity className="w-4 h-4" />} label="ל.ד" value={`${patient.vitals.bpSys}/${patient.vitals.bpDia}`} />
            <Vital icon={<Thermometer className="w-4 h-4" />} label="חום" value={`${patient.vitals.temp}°C`} warn={patient.vitals.temp >= 38} />
            <Vital icon={<Droplet className="w-4 h-4" />} label="דימום" value={patient.vitals.bleeding ? "כן" : "לא"} warn={patient.vitals.bleeding} />
          </motion.div>
        )}
      </motion.div>

      {/* Sequence chips */}
      {sequence.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {sequence.map((s, i) => {
            const m = ACTION_META[s];
            return (
              <span key={i} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${m.tint}`}>
                <m.Icon className="w-3.5 h-3.5" />
                {m.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        {(["oxygen", "bandage", "meds"] as ActionId[]).map((a) => {
          const m = ACTION_META[a];
          const used = sequence.includes(a);
          return (
            <button
              key={a}
              disabled={used}
              onClick={() => props.onAction(a)}
              className={`${m.tint} rounded-2xl p-4 font-bold text-base border-2 border-foreground/15 transition-all hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0`}
              style={{ boxShadow: "0 4px 0 0 hsl(var(--foreground) / 0.22)", minHeight: 64 }}
            >
              <m.Icon className="w-5 h-5" />
              {m.label}
            </button>
          );
        })}
        <button
          onClick={() => props.onAction("discharge")}
          className="bg-success text-white rounded-2xl p-4 font-bold text-base border-2 border-foreground/15 transition-all hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 0 0 hsl(var(--foreground) / 0.30)", minHeight: 64 }}
        >
          <FileCheck2 className="w-5 h-5" />
          תיעוד ושחרור
        </button>
      </div>

      {/* Flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full font-bold text-sm shadow-2xl border-2 ${
              flash.ok ? "bg-success text-white border-success" : "bg-coral text-white border-coral"
            }`}
          >
            {flash.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon, label, value, accent = "" }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl bg-card border-2 border-foreground/10 px-3 py-2 text-center">
      <div className={`inline-flex items-center gap-1 text-[10px] font-bold text-foreground/55 tracking-widest ${accent}`}>
        {icon}
        {label}
      </div>
      <div className={`font-serif text-xl tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}

function Vital({ icon, label, value, warn = false }: { icon: React.ReactNode; label: string; value: string; warn?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 px-3 py-2 ${warn ? "bg-coral/15 border-coral/50" : "bg-background border-foreground/10"}`}>
      <div className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-widest ${warn ? "text-coral" : "text-foreground/55"}`}>
        {icon}
        {label}
      </div>
      <div className={`font-serif text-lg ${warn ? "text-coral" : ""}`}>{value}</div>
    </div>
  );
}

function DoneUI({ score, treated, missed, onRetry }: { score: number; treated: number; missed: number; onRetry: () => void }) {
  const rating = useMemo(() => {
    if (score >= 200) return { title: "אחות/אח בכיר/ה 🏆", tint: "text-success" };
    if (score >= 100) return { title: "אחות/אח מנוסה 💪", tint: "text-sky" };
    if (score >= 40) return { title: "מתמחה בהתקדמות ✨", tint: "text-secondary" };
    return { title: "צריך עוד תרגול 🩺", tint: "text-coral" };
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card border-2 border-foreground/10 p-6 md:p-8 text-center"
      style={{ boxShadow: "0 6px 0 0 hsl(var(--foreground) / 0.12)" }}
    >
      <div className="text-6xl mb-3">🏁</div>
      <h2 className="font-serif text-3xl mb-1">סוף המשמרת</h2>
      <p className={`text-lg font-bold mb-6 ${rating.tint}`}>{rating.title}</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat icon={<Trophy className="w-4 h-4" />} label="ניקוד" value={score} />
        <Stat icon={<Heart className="w-4 h-4" />} label="שוחררו" value={treated} />
        <Stat icon={<Activity className="w-4 h-4" />} label="פספוסים" value={missed} />
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-coral text-white px-6 py-3 rounded-full font-bold border-2 border-foreground/15 transition-all hover:-translate-y-0.5 active:translate-y-0.5"
          style={{ boxShadow: "0 4px 0 0 hsl(var(--foreground) / 0.28)", minHeight: 52 }}
        >
          משמרת נוספת
        </button>
        <Link
          to="/play"
          className="inline-flex items-center gap-2 bg-card text-foreground px-6 py-3 rounded-full font-bold border-2 border-foreground/15 transition-all hover:-translate-y-0.5 active:translate-y-0.5"
          style={{ boxShadow: "0 4px 0 0 hsl(var(--foreground) / 0.18)", minHeight: 52 }}
        >
          <ArrowLeft className="w-4 h-4" />
          חזרה למרכז המשחקים
        </Link>
      </div>
    </motion.div>
  );
}
