import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Stethoscope,
  HeartPulse,
  Users,
  Compass,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { cloudClient } from "@/lib/cloudClient";
import { toast } from "@/hooks/use-toast";

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "נא להזין שם מלא (לפחות 2 תווים)" })
  .max(100, { message: "השם ארוך מדי" });
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{9,20}$/, { message: "נא להזין מספר טלפון תקין" });
const emailSchema = z
  .string()
  .trim()
  .email({ message: "נא להזין כתובת אימייל תקינה" })
  .max(255, { message: "האימייל ארוך מדי" });

const pillars = [
  {
    icon: Compass,
    title: "הכוונה",
    text: "אבחון חכם שמזהה את החוזקות, המניעים והתאמה למקצועות הבריאות — לפני שנרשמים לתואר.",
  },
  {
    icon: HeartPulse,
    title: "ליווי",
    text: "סימולציות קצרות של רגעי עבודה אמיתיים: מיון, פיזיותרפיה ותזונה קלינית.",
  },
  {
    icon: Users,
    title: "קהילה",
    text: "מסלול מותאם לקהילה, בשפה שלכם, עם אנשים שעברו את הדרך הזו לפניכם.",
  },
];

const steps = [
  { n: "01", t: "מתחילים לגלות", d: "עונים על שאלה ראשונה — בלי טפסים ובלי הרשמה מקדימה." },
  { n: "02", t: "הפרטים תוך כדי", d: "השם, הטלפון והמייל נכנסים בדרך, שדה אחד בכל פעם." },
  { n: "03", t: "מקבלים כיוון", d: "דוח אישי עם המקצועות והמסלולים שמתאימים לכם." },
];

const professions = [
  "סיעוד",
  "פיזיותרפיה",
  "תזונה קלינית",
  "ריפוי בעיסוק",
  "פרמדיקים",
  "רדיולוגיה",
  "מעבדות רפואיות",
  "קלינאות תקשורת",
];

/** Interleaved flow: a question, then one detail field, then a question... */
type FlowStep =
  | { kind: "choice"; key: "interest" | "stage" | "timing"; q: string; sub?: string; options: string[] }
  | {
      kind: "field";
      key: "full_name" | "phone" | "email";
      q: string;
      sub?: string;
      type: string;
      placeholder: string;
      autoComplete: string;
    };

const flow: FlowStep[] = [
  {
    kind: "choice",
    key: "interest",
    q: "מה הכי מסקרן אותך בעולם הבריאות?",
    sub: "אין תשובה נכונה. פשוט מה שמדבר אליך.",
    options: ["טיפול באנשים", "מצבי חירום", "תנועה ושיקום", "תזונה ובריאות", "עדיין לא יודע"],
  },
  {
    kind: "field",
    key: "full_name",
    q: "איך לקרוא לך?",
    sub: "כדי שנוכל להתאים את התהליך אישית.",
    type: "text",
    placeholder: "לדוגמה: יוסי כהן",
    autoComplete: "name",
  },
  {
    kind: "choice",
    key: "stage",
    q: "באיזה שלב אתה נמצא?",
    options: ["לפני בחירת מקצוע", "מתלבט בין שניים", "רוצה להסב מקצוע", "רק בודק אפשרויות"],
  },
  {
    kind: "field",
    key: "phone",
    q: "לאיזה טלפון לחזור אליך?",
    sub: "שיחה אחת קצרה, בלי ספאם.",
    type: "tel",
    placeholder: "050-0000000",
    autoComplete: "tel",
  },
  {
    kind: "choice",
    key: "timing",
    q: "מתי תרצה להתחיל?",
    options: ["מיד", "בחודשים הקרובים", "בשנה הבאה", "רק לומד את השטח"],
  },
  {
    kind: "field",
    key: "email",
    q: "לאן לשלוח את הדוח האישי?",
    sub: "הדוח והגישה לתהליך נשלחים למייל הזה.",
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
  },
];

function InlineJourney() {
  const [i, setI] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const step = flow[i];
  const progress = Math.round((i / flow.length) * 100);

  const save = async (all: Record<string, string>) => {
    setSending(true);
    const { error: err } = await cloudClient.from("health_leads" as never).insert([
      {
        full_name: all.full_name,
        phone: all.phone,
        email: all.email,
        note: `תחום: ${all.interest || "—"} | שלב: ${all.stage || "—"} | תזמון: ${all.timing || "—"}`,
        source: "health-landing",
      },
    ] as never);
    setSending(false);
    if (err) {
      toast({ title: "משהו נתקע", description: "נסו שוב בעוד רגע", variant: "destructive" });
      return;
    }
    setDone(true);
  };

  const advance = (raw: string) => {
    if (step.kind === "field") {
      const schema =
        step.key === "full_name" ? nameSchema : step.key === "phone" ? phoneSchema : emailSchema;
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }
      raw = parsed.data;
    }
    const next = { ...data, [step.key]: raw };
    setData(next);
    setError("");
    setValue("");
    if (i + 1 >= flow.length) {
      void save(next);
      return;
    }
    setI(i + 1);
  };

  if (done) {
    return (
      <div className="rounded-3xl bg-med-surface p-6 sm:p-8 text-center shadow-[0_30px_80px_-30px_rgba(0,0,73,0.6)]">
        <CheckCircle2 className="w-14 h-14 mx-auto text-med-teal" aria-hidden />
        <h2 className="mt-4 font-display text-2xl text-med-navy">
          {data.full_name ? `${data.full_name}, סיימנו!` : "סיימנו!"}
        </h2>
        <p className="mt-3 text-lg text-med-navy/70 leading-relaxed">
          שמרנו את התשובות שלך. ניצור קשר עם קישור אישי להמשך התהליך — בינתיים אפשר להתנסות בסימולטור.
        </p>
        <a
          href="/#/healthcare-sim"
          className="mt-6 inline-flex items-center gap-2 min-h-[52px] px-6 rounded-full bg-med-teal text-med-surface text-base font-black transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-teal/40"
        >
          לסימולטור
          <ArrowLeft className="w-4 h-4" aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <div
      id="start"
      className="rounded-3xl bg-med-surface p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,73,0.6)] scroll-mt-24"
    >
      {/* progress */}
      <div className="flex items-center justify-between text-sm font-bold text-med-navy/55">
        <span>
          שלב {i + 1} מתוך {flow.length}
        </span>
        <span>בלי הרשמה מקדימה</span>
      </div>
      <div
        className="mt-2 h-2.5 rounded-full bg-med-navy/10 overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-med-teal"
          animate={{ width: `${Math.max(progress, 6)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.key}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-6"
        >
          <h2 className="font-display text-2xl sm:text-3xl text-med-navy leading-tight">{step.q}</h2>
          {step.sub && <p className="mt-2 text-base text-med-navy/65">{step.sub}</p>}

          {step.kind === "choice" ? (
            <div className="mt-6 flex flex-col gap-3">
              {step.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => advance(o)}
                  className="w-full min-h-[56px] px-5 rounded-2xl border-2 border-med-navy/12 text-right text-lg font-semibold text-med-navy transition-all duration-200 hover:border-med-teal hover:bg-med-teal/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-teal/30"
                >
                  {o}
                </button>
              ))}
            </div>
          ) : (
            <form
              className="mt-6 space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                advance(value);
              }}
            >
              <input
                key={step.key}
                id={step.key}
                name={step.key}
                type={step.type}
                dir={step.type === "email" ? "ltr" : undefined}
                autoComplete={step.autoComplete}
                placeholder={step.placeholder}
                value={value}
                autoFocus
                onChange={(e) => setValue(e.target.value)}
                aria-label={step.q}
                aria-invalid={!!error}
                aria-describedby={error ? `${step.key}-error` : undefined}
                className="w-full min-h-[56px] rounded-xl border-2 border-med-navy/15 bg-med-surface px-4 text-[1.05rem] text-med-navy placeholder:text-med-navy/35 transition-colors focus:border-med-teal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-teal/30"
              />
              {error && (
                <p id={`${step.key}-error`} className="text-sm font-semibold text-med-blue">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full min-h-[56px] rounded-xl bg-med-navy text-med-surface text-lg font-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-med-blue disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-teal/40"
              >
                {sending ? "שולח..." : i + 1 >= flow.length ? "סיום ושליחה" : "ממשיכים"}
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="mt-5 text-sm text-med-navy/55 leading-relaxed">
        הפרטים נשמרים אצלנו בלבד ומשמשים ליצירת קשר בנוגע לתהליך. ניתן להסיר בכל עת.
      </p>
    </div>
  );
}

export default function HealthLanding() {
  useEffect(() => {
    document.title = "SAGEIFY בריאות | גלו את המקצוע שלכם בעולם הרפואה";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        "אבחון וסימולציה חינמיים למקצועות הבריאות: סיעוד, פיזיותרפיה, תזונה ועוד. מתחילים מיד, הפרטים ממולאים תוך כדי התהליך.",
      );
    }
  }, []);

  return (
    <div dir="rtl" className="min-h-dvh bg-med-surface text-med-navy font-sans">
      {/* Diagonal brand stripes header */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--med-navy)) 0%, hsl(var(--med-blue)) 55%, hsl(var(--med-teal)) 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 z-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, hsl(var(--med-yellow)) 0 14px, transparent 14px 46px)",
          }}
          aria-hidden
        />

        <nav className="relative z-10 max-w-6xl mx-auto px-5 pt-6 flex items-center justify-between text-med-surface">
          <div className="inline-flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-med-surface/15 border border-med-surface/25 backdrop-blur">
              <Stethoscope className="w-5 h-5" aria-hidden />
            </span>
            <span className="text-xl font-black tracking-tight">
              SAGE<span className="text-med-yellow">IFY</span>
              <span className="mx-2 opacity-40">|</span>
              <span className="text-base font-bold opacity-90">בריאות</span>
            </span>
          </div>
          <a
            href="#start"
            className="hidden sm:inline-flex items-center min-h-[48px] px-5 rounded-full bg-med-yellow text-med-navy text-base font-black transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-surface/60"
          >
            מתחילים עכשיו
          </a>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="text-med-surface">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-med-surface/12 border border-med-surface/25 backdrop-blur">
              <Sparkles className="w-4 h-4 text-med-yellow" aria-hidden />
              Discover a New World
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08]"
            >
              עולם הבריאות
              <br />
              <span className="text-med-yellow">מחכה לכם מבפנים.</span>
            </motion.h1>
            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-med-surface/85 max-w-2xl">
              רפואה, סיעוד, פיזיותרפיה, תזונה ועוד — עשרות מקצועות, מסלול אחד שמתאים לכם.
              מתחילים מיד בשאלה הראשונה, והפרטים ממולאים תוך כדי התהליך. ללא עלות וללא כרטיס אשראי.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#start"
                className="inline-flex items-center gap-2 min-h-[56px] px-7 rounded-full bg-med-yellow text-med-navy text-lg font-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-surface/60"
              >
                מתחילים בשאלה אחת
                <ArrowLeft className="w-5 h-5" aria-hidden />
              </a>
              <a
                href="/#/healthcare-sim"
                className="inline-flex items-center gap-2 min-h-[56px] px-7 rounded-full border-2 border-med-surface/40 text-med-surface text-lg font-bold transition-colors duration-300 hover:bg-med-surface/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-surface/60"
              >
                לסימולטור המקצועות
              </a>
            </div>
          </div>

          {/* Inline progressive journey (no signup gate) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          >
            <InlineJourney />
          </motion.div>
        </div>
      </header>

      <main>
        {/* Pillars */}
        <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl text-med-navy">שלושה עמודים, מסלול אחד</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="rounded-3xl border-2 border-med-navy/10 p-6 bg-med-surface"
              >
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-med-teal/12 text-med-teal">
                  <p.icon className="w-7 h-7" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-2xl text-med-navy">{p.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-med-navy/70">{p.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Steps on brand blue with yellow stripes */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 z-0 bg-med-blue" aria-hidden />
          <div
            className="absolute inset-0 z-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, hsl(var(--med-yellow)) 0 18px, transparent 18px 54px)",
            }}
            aria-hidden
          />
          <div className="relative z-10 max-w-6xl mx-auto px-5 text-med-surface">
            <h2 className="font-display text-3xl sm:text-4xl">איך זה עובד</h2>
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="rounded-3xl bg-med-navy/35 border border-med-surface/20 p-6 backdrop-blur"
                >
                  <div className="text-med-yellow font-black tracking-[0.3em] text-sm">{s.n}</div>
                  <h3 className="mt-3 font-display text-2xl">{s.t}</h3>
                  <p className="mt-2.5 text-lg leading-relaxed text-med-surface/80">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Professions */}
        <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-med-teal/12 text-med-teal text-sm font-bold">
            <GraduationCap className="w-4 h-4" aria-hidden />
            מקצועות במסלול
          </div>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl text-med-navy max-w-3xl leading-tight">
            לא צריך לדעת מה רוצים. צריך רק להתחיל לבדוק.
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {professions.map((p) => (
              <li
                key={p}
                className="px-5 py-3 rounded-full border-2 border-med-navy/12 text-lg font-semibold text-med-navy"
              >
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-5 pb-20">
          <div
            className="rounded-3xl p-8 sm:p-12 text-med-surface text-center"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--med-teal)) 0%, hsl(var(--med-blue)) 60%, hsl(var(--med-navy)) 100%)",
            }}
          >
            <h2 className="font-display text-3xl sm:text-4xl leading-tight">
              בלי טפסים מקדימים. מתחילים ובודקים.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-med-surface/85 max-w-2xl mx-auto leading-relaxed">
              שאלה, עוד שאלה, והפרטים ממולאים בדרך — עד לדוח אישי בעולם הבריאות.
            </p>
            <a
              href="#start"
              className="mt-8 inline-flex items-center gap-2 min-h-[56px] px-8 rounded-full bg-med-yellow text-med-navy text-lg font-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-surface/60"
            >
              להתחיל עכשיו
              <ArrowLeft className="w-5 h-5" aria-hidden />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-med-navy/10">
        <div className="max-w-6xl mx-auto px-5 py-8 text-base text-med-navy/60">
          © {new Date().getFullYear()} SAGEIFY · מסלול מקצועות הבריאות
        </div>
      </footer>
    </div>
  );
}
