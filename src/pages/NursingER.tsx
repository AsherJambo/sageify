import { useEffect, useMemo, useState } from "react";
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
  Timer,
  Trophy,
  GraduationCap,
  Sparkles,
  ChevronDown,
} from "lucide-react";

// ============================================================
// ER SHIFT — standalone experience for young adults exploring
// a degree in the health professions (nursing, paramedics, etc).
// Route: /nursing-er
// Tone: bold, dark-clinical, high-energy. NOT owl-forest.
// ============================================================

type ActionId = "oxygen" | "bandage" | "meds" | "discharge";

interface Vitals {
  oxygen: number;
  bpSys: number;
  bpDia: number;
  temp: number;
  bleeding: boolean;
}

interface Patient {
  id: number;
  name: string;
  emoji: string;
  complaint: string;
  vitals: Vitals;
  required: ActionId[];
}

const NAMES = [
  "רון, 34", "מיכל, 28", "אבי, 52", "נועה, 19", "יוסי, 61",
  "שירה, 24", "דני, 45", "תמר, 30", "עומר, 17", "ליאור, 39",
];
const EMOJIS = ["🧑", "👩", "🧔", "👱", "🧑‍🦱", "👨", "👩‍🦰"];

const COMPLAINTS = [
  "קוצר נשימה חד לאחר מאמץ",
  "פציעת ראש עם דימום פעיל",
  "כאב חזה מקרין וחום",
  "סחרחורת, רעד וזיעה קרה",
  "פצע חתך עמוק ברגל",
  "שיעול, קוצר נשימה וחום",
  "חולשה כללית ובלבול",
  "כווייה בדרגה שנייה ביד",
  "כאב בטן חד וחום",
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
  oxygen:    { label: "מסכת חמצן",     Icon: Wind,       tint: "bg-sky text-white" },
  bandage:   { label: "חבישה",         Icon: Bandage,    tint: "bg-coral text-white" },
  meds:      { label: "מתן תרופה",     Icon: Pill,       tint: "bg-secondary text-secondary-foreground" },
  discharge: { label: "תיעוד ושחרור",  Icon: FileCheck2, tint: "bg-success text-white" },
};

const SHIFT_SECONDS = 90;

export default function NursingER() {
  const [phase, setPhase] = useState<"landing" | "playing" | "done">("landing");
  const [score, setScore] = useState(0);
  const [treated, setTreated] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SHIFT_SECONDS);
  const [patient, setPatient] = useState<Patient>(() => randomPatient(1));
  const [vitalsShown, setVitalsShown] = useState(false);
  const [sequence, setSequence] = useState<ActionId[]>([]);
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null);

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
    // Scroll to top for the fast-paced view
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const addAction = (a: ActionId) => {
    if (!vitalsShown) {
      setFlash({ msg: "קודם בדוק סימנים חיוניים!", ok: false });
      setScore((s) => Math.max(0, s - 2));
      return;
    }
    if (sequence.includes(a)) return;

    if (a === "discharge") {
      const needed = patient.required.slice(0, -1);
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

  return (
    <div
      dir="rtl"
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, hsl(199 89% 48% / 0.25), transparent), radial-gradient(900px 500px at 100% 10%, hsl(346 77% 55% / 0.22), transparent), linear-gradient(180deg, #0b1220 0%, #0a0f1a 100%)",
      }}
    >
      {/* Top nav — no back link to /play, this is standalone */}
      <nav className="relative z-10 max-w-6xl mx-auto px-5 pt-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 font-black tracking-tight text-lg">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/15">
            <Stethoscope className="w-5 h-5" />
          </span>
          ER<span className="text-[hsl(346_77%_65%)]">.Shift</span>
        </div>
        <a
          href="#about"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition"
        >
          למה זה כאן?
          <ChevronDown className="w-4 h-4" />
        </a>
      </nav>

      <div className="max-w-3xl mx-auto px-5 pt-8 pb-16">
        {phase === "landing" && <Landing onStart={startShift} />}

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

      {phase === "landing" && <AboutSection />}
    </div>
  );
}

// ---------------- Landing ----------------

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/15 backdrop-blur">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(48_96%_65%)]" />
          חוויה לעתידי מקצועות הבריאות
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7 }}
        className="mt-5 font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight"
      >
        90 שניות.<br />
        <span
          style={{
            background: "linear-gradient(90deg, hsl(346 77% 65%), hsl(48 96% 65%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          משמרת אחת במיון.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-5 text-lg md:text-xl text-white/75 leading-relaxed max-w-xl mx-auto"
      >
        שוקל/ת תואר בסיעוד, פרמדיק, ריפוי בעיסוק או רפואה?
        בוא/י תרגיש/י איך זה באמת — טריאז׳, קבלת החלטות תחת לחץ, וכן — גם ניירת.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-9 py-5 rounded-full font-black text-lg text-[#0a0f1a] transition-all hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: "linear-gradient(90deg, hsl(48 96% 65%), hsl(346 77% 65%))",
            boxShadow: "0 20px 60px -20px hsl(346 77% 55% / 0.6), 0 0 0 1px rgba(255,255,255,0.08) inset",
            minHeight: 60,
          }}
        >
          <Activity className="w-5 h-5" />
          התחל/י משמרת
          <span className="text-xs font-bold opacity-70">· {SHIFT_SECONDS} שניות</span>
        </button>
        <p className="text-xs text-white/45">ללא הרשמה. ללא ציון בתעודה. רק אתה, שעון וחולה.</p>
      </motion.div>

      {/* three-rule strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-14 grid sm:grid-cols-3 gap-3 text-right"
      >
        <Rule n="01" title="Vitals לפני הכל" text="לחץ 'בדוק סימנים חיוניים' כדי לראות חמצן, ל.ד, חום ודימום." />
        <Rule n="02" title="החלטות מהירות" text="חמצן<90 · דימום · חום גבוה — כל תסמין דורש פעולה אחרת." />
        <Rule n="03" title="ניירת חובה" text="בלי 'תיעוד ושחרור' החולה לא זז, והנקודות יורדות. ברוך/ה הבא/ה לעולם האמיתי." />
      </motion.div>
    </div>
  );
}

function Rule({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div
      className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] backdrop-blur"
    >
      <div className="text-[11px] font-black tracking-[0.25em] text-[hsl(48_96%_65%)]">{n}</div>
      <div className="mt-1 font-serif text-lg leading-tight">{title}</div>
      <p className="mt-1 text-sm text-white/60 leading-snug">{text}</p>
    </div>
  );
}

function AboutSection() {
  return (
    <section
      id="about"
      className="relative z-10 border-t border-white/10 mt-12"
      style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.35))" }}
    >
      <div className="max-w-3xl mx-auto px-5 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/15">
          <GraduationCap className="w-3.5 h-3.5" />
          למה בנינו את זה
        </div>
        <h2 className="mt-4 font-serif text-3xl md:text-4xl leading-tight">
          לפני שנרשמים לתואר של 4 שנים —<br />
          כדאי להרגיש איך זה שם.
        </h2>
        <p className="mt-4 text-white/70 text-lg leading-relaxed">
          מקצועות הבריאות דורשים חשיבה מהירה, סדר, ואחריות. המשחק הזה הוא סימולציה זעירה של רגע אחד
          במיון — הרגע שבו את/ה עוצר/ת, קורא/ת נתונים, ופועל/ת. אם החוויה מרגישה כמו זרימה — יש כאן רמז.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <PathCard title="סיעוד" text="B.S.N — 4 שנים · ליבת המערכת" />
          <PathCard title="פרמדיקה" text="B.EMS — 4 שנים · שטח וחדר מיון" />
          <PathCard title="ריפוי בעיסוק" text="B.OT — 4 שנים · שיקום ותפקוד" />
          <PathCard title="פיזיותרפיה" text="B.PT — 4 שנים · תנועה וכאב" />
        </div>
      </div>
    </section>
  );
}

function PathCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl p-4 border border-white/10 bg-white/[0.04]">
      <div className="font-serif text-xl">{title}</div>
      <div className="text-sm text-white/55 mt-0.5">{text}</div>
    </div>
  );
}

// ---------------- Playing ----------------

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
      <div className="grid grid-cols-4 gap-2">
        <Stat icon={<Timer className="w-4 h-4" />} label="זמן" value={`${timeLeft}s`} accent={timeLeft <= 15 ? "text-[hsl(346_77%_65%)]" : ""} />
        <Stat icon={<Trophy className="w-4 h-4" />} label="ניקוד" value={score} />
        <Stat icon={<Heart className="w-4 h-4" />} label="שוחררו" value={treated} />
        <Stat icon={<Activity className="w-4 h-4" />} label="פספוסים" value={missed} />
      </div>

      <motion.div
        key={patient.id}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl p-5 border border-white/10 bg-white/[0.04] backdrop-blur"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">{patient.emoji}</div>
          <div className="flex-1">
            <div className="text-[10px] font-black text-white/45 tracking-[0.25em]">חולה #{patient.id}</div>
            <div className="font-serif text-xl">{patient.name}</div>
          </div>
          <button
            onClick={props.onSkip}
            className="text-xs font-semibold text-white/55 hover:text-[hsl(346_77%_65%)] px-3 py-1.5 rounded-full border border-white/15"
          >
            דלג (-5)
          </button>
        </div>

        <div className="rounded-2xl bg-[hsl(346_77%_55%/0.15)] border border-[hsl(346_77%_55%/0.4)] p-3 mb-4">
          <div className="text-[10px] font-black text-[hsl(346_77%_75%)] tracking-[0.25em] mb-0.5">תלונה עיקרית</div>
          <div className="text-base font-semibold">{patient.complaint}</div>
        </div>

        {!vitalsShown ? (
          <button
            onClick={props.onCheckVitals}
            className="w-full rounded-2xl py-4 font-bold text-base transition-all hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center justify-center gap-2 text-[#0a0f1a]"
            style={{
              background: "linear-gradient(90deg, hsl(199 89% 68%), hsl(199 89% 55%))",
              boxShadow: "0 8px 30px -8px hsl(199 89% 55% / 0.6)",
              minHeight: 56,
            }}
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

      <div className="grid grid-cols-2 gap-3">
        {(["oxygen", "bandage", "meds"] as ActionId[]).map((a) => {
          const m = ACTION_META[a];
          const used = sequence.includes(a);
          return (
            <button
              key={a}
              disabled={used}
              onClick={() => props.onAction(a)}
              className={`${m.tint} rounded-2xl p-4 font-bold text-base border border-white/15 transition-all hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0`}
              style={{ boxShadow: "0 8px 24px -12px rgba(0,0,0,0.6)", minHeight: 64 }}
            >
              <m.Icon className="w-5 h-5" />
              {m.label}
            </button>
          );
        })}
        <button
          onClick={() => props.onAction("discharge")}
          className="rounded-2xl p-4 font-bold text-base border border-white/15 transition-all hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center justify-center gap-2 text-white"
          style={{
            background: "linear-gradient(90deg, hsl(142 71% 45%), hsl(142 71% 35%))",
            boxShadow: "0 10px 30px -10px hsl(142 71% 45% / 0.5)",
            minHeight: 64,
          }}
        >
          <FileCheck2 className="w-5 h-5" />
          תיעוד ושחרור
        </button>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full font-bold text-sm shadow-2xl border ${
              flash.ok
                ? "bg-[hsl(142_71%_45%)] text-white border-[hsl(142_71%_45%)]"
                : "bg-[hsl(346_77%_55%)] text-white border-[hsl(346_77%_55%)]"
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center backdrop-blur">
      <div className={`inline-flex items-center gap-1 text-[10px] font-black text-white/55 tracking-[0.25em] ${accent}`}>
        {icon}
        {label}
      </div>
      <div className={`font-serif text-xl tabular-nums ${accent || "text-white"}`}>{value}</div>
    </div>
  );
}

function Vital({ icon, label, value, warn = false }: { icon: React.ReactNode; label: string; value: string; warn?: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2 ${
        warn
          ? "bg-[hsl(346_77%_55%/0.15)] border-[hsl(346_77%_55%/0.5)]"
          : "bg-white/[0.03] border-white/10"
      }`}
    >
      <div className={`inline-flex items-center gap-1 text-[10px] font-black tracking-[0.25em] ${warn ? "text-[hsl(346_77%_75%)]" : "text-white/55"}`}>
        {icon}
        {label}
      </div>
      <div className={`font-serif text-lg ${warn ? "text-[hsl(346_77%_75%)]" : "text-white"}`}>{value}</div>
    </div>
  );
}

// ---------------- Done ----------------

function DoneUI({ score, treated, missed, onRetry }: { score: number; treated: number; missed: number; onRetry: () => void }) {
  const rating = useMemo(() => {
    if (score >= 200) return { title: "יש לך את זה. באמת.", sub: "החוויה זרמה — כדאי לבדוק ברצינות תואר בבריאות." };
    if (score >= 100) return { title: "פוטנציאל אמיתי.", sub: "החלטת נכון תחת לחץ. שווה לך יום פתוח בפקולטה." };
    if (score >= 40)  return { title: "התחלה טובה.",     sub: "המשמרת הזו רק גירדה — יש עוד מה לגלות." };
    return              { title: "אולי בכיוון אחר?",     sub: "רפואה לא מרגישה טבעי — וזה גם מידע חשוב." };
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 md:p-10 text-center border border-white/10 bg-white/[0.04] backdrop-blur"
    >
      <div className="text-6xl mb-3">🏁</div>
      <h2 className="font-serif text-3xl md:text-4xl">{rating.title}</h2>
      <p className="mt-2 text-white/70 text-lg">{rating.sub}</p>

      <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
        <Stat icon={<Trophy className="w-4 h-4" />} label="ניקוד" value={score} />
        <Stat icon={<Heart className="w-4 h-4" />} label="שוחררו" value={treated} />
        <Stat icon={<Activity className="w-4 h-4" />} label="פספוסים" value={missed} />
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-[#0a0f1a]"
          style={{
            background: "linear-gradient(90deg, hsl(48 96% 65%), hsl(346 77% 65%))",
            boxShadow: "0 12px 30px -12px hsl(346 77% 55% / 0.5)",
            minHeight: 52,
          }}
        >
          משמרת נוספת
        </button>
        <a
          href="#about"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition"
          style={{ minHeight: 52 }}
        >
          <GraduationCap className="w-4 h-4" />
          מסלולי תואר בבריאות
        </a>
      </div>
    </motion.div>
  );
}
