import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, Timer, Trophy, Heart, Stethoscope, ChevronLeft } from "lucide-react";

// ============================================================
// TrackGame — shared engine for a fast healthcare simulator track.
// Patients queue up with a complaint + patience timer. The player
// clicks logic-blocks in the correct sequence to treat them.
// ============================================================

export interface Complaint {
  text: string;
  emoji: string;
  /** Ordered ids of blocks that must be clicked, in this exact order. */
  sequence: string[];
}

export interface LogicBlock {
  id: string;
  label: string;
  icon: string; // emoji
  tint: string; // tailwind classes
}

export interface TrackConfig {
  slug: string;
  name: string;
  tagline: string;
  hero: string; // 1-liner shown big on landing
  emoji: string;
  /** Gradient colors used for hero + CTA */
  gradient: [string, string]; // hsl strings
  patientEmojis: string[];
  complaints: Complaint[];
  blocks: LogicBlock[];
  /** Seconds each patient waits before leaving. */
  patience?: number;
  /** Shift length in seconds. */
  shiftSeconds?: number;
  /** Degree path bullets */
  paths: { title: string; text: string }[];
}

type Phase = "landing" | "playing" | "done";

interface Patient {
  id: number;
  emoji: string;
  complaint: Complaint;
  patience: number;
}

export default function TrackGame({ config }: { config: TrackConfig }) {
  const patienceSec = config.patience ?? 18;
  const shiftSec = config.shiftSeconds ?? 90;

  const [phase, setPhase] = useState<Phase>("landing");
  const [score, setScore] = useState(0);
  const [treated, setTreated] = useState(0);
  const [lost, setLost] = useState(0);
  const [timeLeft, setTimeLeft] = useState(shiftSec);
  const [patient, setPatient] = useState<Patient>(() => makePatient(1, config, patienceSec));
  const [sequence, setSequence] = useState<string[]>([]);
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null);

  // Shift timer
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

  // Patient patience timer
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      setPatient((p) => {
        if (p.patience <= 1) {
          setFlash({ msg: "המטופל עזב — פחות סבלנות מדי!", ok: false });
          setScore((s) => Math.max(0, s - 8));
          setLost((l) => l + 1);
          return makePatient(p.id + 1, config, patienceSec);
        }
        return { ...p, patience: p.patience - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, config, patienceSec]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1100);
    return () => clearTimeout(t);
  }, [flash]);

  const startShift = () => {
    setScore(0);
    setTreated(0);
    setLost(0);
    setTimeLeft(shiftSec);
    setSequence([]);
    setPatient(makePatient(1, config, patienceSec));
    setPhase("playing");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const clickBlock = (id: string) => {
    const nextIdx = sequence.length;
    const expected = patient.complaint.sequence[nextIdx];

    if (id === expected) {
      const newSeq = [...sequence, id];
      setSequence(newSeq);
      if (newSeq.length === patient.complaint.sequence.length) {
        // Treatment complete
        const bonus = 15 + patient.patience * 2;
        setFlash({ msg: `טופל בהצלחה! +${bonus}`, ok: true });
        setScore((s) => s + bonus);
        setTreated((t) => t + 1);
        setTimeout(() => {
          setPatient(makePatient(patient.id + 1, config, patienceSec));
          setSequence([]);
        }, 500);
      } else {
        setFlash({ msg: "צעד נכון ✓", ok: true });
        setScore((s) => s + 3);
      }
    } else {
      setFlash({ msg: "לא הצעד הבא בטיפול", ok: false });
      setScore((s) => Math.max(0, s - 4));
      setSequence([]); // reset sequence on wrong click
    }
  };

  const patiencePct = Math.round((patient.patience / patienceSec) * 100);
  const patienceCritical = patient.patience <= Math.ceil(patienceSec * 0.3);

  return (
    <div
      dir="rtl"
      className="min-h-dvh text-white relative overflow-hidden"
      style={{
        background: `radial-gradient(1100px 500px at 8% -10%, ${config.gradient[0]} / 0.25, transparent), radial-gradient(900px 500px at 100% 5%, ${config.gradient[1]} / 0.22, transparent), linear-gradient(180deg, #0b1220 0%, #0a0f1a 100%)`
          .replace(/hsl\((\d+ \d+% \d+%)\) \/ 0\./g, "hsl($1 / 0."),
      }}
    >
      {/* Top nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-5 pt-6 flex items-center justify-between">
        <Link
          to="/healthcare-sim"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
          כל המסלולים
        </Link>
        <div className="inline-flex items-center gap-2 font-black tracking-tight text-lg">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/15" aria-hidden>
            <Stethoscope className="w-5 h-5" />
          </span>
          <span>Care<span style={{ color: config.gradient[1] }}>.Play</span></span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 pt-8 pb-16">
        {phase === "landing" && <Landing config={config} onStart={startShift} />}
        {phase === "playing" && (
          <Playing
            config={config}
            patient={patient}
            sequence={sequence}
            score={score}
            treated={treated}
            lost={lost}
            timeLeft={timeLeft}
            patiencePct={patiencePct}
            patienceCritical={patienceCritical}
            flash={flash}
            onClickBlock={clickBlock}
          />
        )}
        {phase === "done" && (
          <Done config={config} score={score} treated={treated} lost={lost} onRetry={startShift} />
        )}
      </main>
    </div>
  );
}

function makePatient(id: number, config: TrackConfig, patience: number): Patient {
  const complaint = config.complaints[Math.floor(Math.random() * config.complaints.length)];
  const emoji = config.patientEmojis[Math.floor(Math.random() * config.patientEmojis.length)];
  return { id, emoji, complaint, patience };
}

// ---------------- Landing ----------------

function Landing({ config, onStart }: { config: TrackConfig; onStart: () => void }) {
  return (
    <div className="text-center">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/15 backdrop-blur">
        <span aria-hidden>{config.emoji}</span>
        {config.name}
      </span>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-5 font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight"
      >
        {config.hero}
      </motion.h1>

      <p className="mt-5 text-lg md:text-xl text-white/75 leading-relaxed max-w-xl mx-auto">
        {config.tagline}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-3 px-9 py-5 rounded-full font-black text-lg text-[#0a0f1a] transition-transform hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          style={{
            background: `linear-gradient(90deg, ${config.gradient[0]}, ${config.gradient[1]})`,
            boxShadow: `0 20px 60px -20px ${config.gradient[1]}80, 0 0 0 1px rgba(255,255,255,0.08) inset`,
            minHeight: 60,
          }}
        >
          <Activity className="w-5 h-5" aria-hidden />
          התחל/י משמרת
          <span className="text-xs font-bold opacity-70">· {config.shiftSeconds ?? 90} שניות</span>
        </button>
        <p className="text-xs text-white/45">ללא הרשמה. סימולציה מהירה. לחץ, החליט, טפל.</p>
      </div>

      <ul className="mt-14 grid sm:grid-cols-3 gap-3 text-right list-none p-0">
        <RuleCard n="01" title="קרא את התלונה" text="כל מטופל מגיע עם בעיה ספציפית." />
        <RuleCard n="02" title="בחר סדר טיפול" text="לחץ על אבני הבניין בסדר הנכון." />
        <RuleCard n="03" title="שים לב לסבלנות" text="הסרגל הכתום יורד — פעל מהר." />
      </ul>

      <section className="mt-14 pt-10 border-t border-white/10 text-right" aria-labelledby="paths-heading">
        <h2 id="paths-heading" className="font-serif text-2xl md:text-3xl">מסלולי לימוד בתחום</h2>
        <ul className="mt-4 grid sm:grid-cols-2 gap-3 list-none p-0">
          {config.paths.map((p) => (
            <li key={p.title} className="rounded-2xl p-4 border border-white/10 bg-white/[0.04]">
              <div className="font-serif text-xl">{p.title}</div>
              <div className="text-sm text-white/55 mt-0.5">{p.text}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RuleCard({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <li className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] backdrop-blur">
      <div className="text-[11px] font-black tracking-[0.25em] text-[hsl(48_96%_65%)]">{n}</div>
      <div className="mt-1 font-serif text-lg leading-tight">{title}</div>
      <p className="mt-1 text-sm text-white/60 leading-snug">{text}</p>
    </li>
  );
}

// ---------------- Playing ----------------

function Playing(props: {
  config: TrackConfig;
  patient: Patient;
  sequence: string[];
  score: number;
  treated: number;
  lost: number;
  timeLeft: number;
  patiencePct: number;
  patienceCritical: boolean;
  flash: { msg: string; ok: boolean } | null;
  onClickBlock: (id: string) => void;
}) {
  const { config, patient, sequence, score, treated, lost, timeLeft, patiencePct, patienceCritical, flash } = props;
  const nextIdx = sequence.length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2" role="status" aria-live="polite">
        <Stat icon={<Timer className="w-4 h-4" aria-hidden />} label="זמן" value={`${timeLeft}s`} accent={timeLeft <= 15 ? "text-[hsl(346_77%_65%)]" : ""} />
        <Stat icon={<Trophy className="w-4 h-4" aria-hidden />} label="ניקוד" value={score} />
        <Stat icon={<Heart className="w-4 h-4" aria-hidden />} label="טופלו" value={treated} />
        <Stat icon={<Activity className="w-4 h-4" aria-hidden />} label="עזבו" value={lost} />
      </div>

      {/* Patient */}
      <motion.article
        key={patient.id}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl p-5 border border-white/10 bg-white/[0.04] backdrop-blur"
        aria-label={`מטופל ${patient.id}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl" aria-hidden>{patient.emoji}</div>
          <div className="flex-1">
            <div className="text-[10px] font-black text-white/45 tracking-[0.25em]">מטופל #{patient.id}</div>
            <div className="font-serif text-xl">{patient.complaint.emoji} {patient.complaint.text}</div>
          </div>
        </div>

        {/* Patience bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-black text-white/55 tracking-[0.25em] mb-1">
            <span>סבלנות המטופל</span>
            <span className={patienceCritical ? "text-[hsl(346_77%_75%)]" : ""}>{patient.patience}s</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={patiencePct} aria-valuemin={0} aria-valuemax={100} aria-label="סבלנות המטופל">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${patiencePct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                background: patienceCritical
                  ? "linear-gradient(90deg, hsl(346 77% 55%), hsl(346 77% 65%))"
                  : `linear-gradient(90deg, ${config.gradient[0]}, ${config.gradient[1]})`,
              }}
            />
          </div>
        </div>

        {/* Sequence chips */}
        <div className="mt-4 flex flex-wrap gap-2 min-h-[38px]" aria-label="רצף טיפול שנבחר">
          {patient.complaint.sequence.map((needId, i) => {
            const done = i < sequence.length;
            const isNext = i === sequence.length;
            const block = config.blocks.find((b) => b.id === needId);
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  done
                    ? "bg-[hsl(142_71%_45%)] text-white border-[hsl(142_71%_45%)]"
                    : isNext
                    ? "border-white/40 text-white bg-white/5"
                    : "border-white/10 text-white/40 bg-white/[0.02]"
                }`}
              >
                <span aria-hidden>{done ? "✓" : i + 1}</span>
                {block?.label ?? "?"}
              </span>
            );
          })}
        </div>
      </motion.article>

      {/* Logic blocks */}
      <div>
        <h3 className="sr-only">אבני בניין לטיפול</h3>
        <div className="grid grid-cols-2 gap-3">
          {config.blocks.map((b) => (
            <button
              key={b.id}
              onClick={() => props.onClickBlock(b.id)}
              className={`${b.tint} rounded-2xl p-4 font-bold text-base border border-white/15 transition-transform hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40`}
              style={{ boxShadow: "0 8px 24px -12px rgba(0,0,0,0.6)", minHeight: 64 }}
              aria-label={`טיפול: ${b.label}. הצעד הבא ברצף: ${nextIdx + 1}`}
            >
              <span aria-hidden className="text-lg">{b.icon}</span>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flash */}
      <div className="sr-only" role="status" aria-live="assertive">
        {flash?.msg ?? ""}
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

// ---------------- Done ----------------

function Done({ config, score, treated, lost, onRetry }: { config: TrackConfig; score: number; treated: number; lost: number; onRetry: () => void }) {
  const rating = useMemo(() => {
    if (score >= 220) return { title: "זה זורם לך.", sub: `אולי ${config.name} זה בדיוק המסלול שלך.` };
    if (score >= 120) return { title: "פוטנציאל אמיתי.", sub: "החלטת נכון תחת לחץ. שווה יום פתוח בפקולטה." };
    if (score >= 50) return { title: "התחלה טובה.", sub: "המשמרת רק גירדה — יש עוד מה לגלות." };
    return { title: "אולי בכיוון אחר?", sub: "לפעמים דווקא ה'לא' הוא מידע חשוב." };
  }, [score, config.name]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 md:p-10 text-center border border-white/10 bg-white/[0.04] backdrop-blur"
      aria-labelledby="done-heading"
    >
      <div className="text-6xl mb-3" aria-hidden>🏁</div>
      <h2 id="done-heading" className="font-serif text-3xl md:text-4xl">{rating.title}</h2>
      <p className="mt-2 text-white/70 text-lg">{rating.sub}</p>

      <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
        <Stat icon={<Trophy className="w-4 h-4" aria-hidden />} label="ניקוד" value={score} />
        <Stat icon={<Heart className="w-4 h-4" aria-hidden />} label="טופלו" value={treated} />
        <Stat icon={<Activity className="w-4 h-4" aria-hidden />} label="עזבו" value={lost} />
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-[#0a0f1a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          style={{
            background: `linear-gradient(90deg, ${config.gradient[0]}, ${config.gradient[1]})`,
            boxShadow: `0 12px 30px -12px ${config.gradient[1]}80`,
            minHeight: 52,
          }}
        >
          משמרת נוספת
        </button>
        <Link
          to="/healthcare-sim"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition"
          style={{ minHeight: 52 }}
        >
          כל המסלולים
        </Link>
      </div>
    </motion.section>
  );
}
