import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

const leadSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "נא להזין שם מלא (לפחות 2 תווים)" })
    .max(100, { message: "השם ארוך מדי" }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{9,20}$/, { message: "נא להזין מספר טלפון תקין" }),
  email: z
    .string()
    .trim()
    .email({ message: "נא להזין כתובת אימייל תקינה" })
    .max(255, { message: "האימייל ארוך מדי" }),
});

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
  { n: "01", t: "משאירים פרטים", d: "שם, טלפון ואימייל. בלי תשלום, בלי התחייבות." },
  { n: "02", t: "מקבלים גישה", d: "משחקי אבחון קצרים וסימולטור מקצועות הבריאות." },
  { n: "03", t: "מגלים כיוון", d: "דוח אישי עם המקצועות והמסלולים שמתאימים לכם." },
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

export default function HealthLanding() {
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = "SAGEIFY בריאות | גלו את המקצוע שלכם בעולם הרפואה";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        "אבחון וסימולציה חינמיים למקצועות הבריאות: סיעוד, פיזיותרפיה, תזונה ועוד. משאירים שם, טלפון ומייל ומתחילים.",
      );
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSending(true);
    const { error } = await cloudClient.from("health_leads" as never).insert([
      { ...parsed.data, source: "health-landing" },
    ] as never);
    setSending(false);
    if (error) {
      toast({ title: "משהו נתקע", description: "נסו שוב בעוד רגע", variant: "destructive" });
      return;
    }
    setDone(true);
  };

  const field = (
    name: keyof typeof form,
    label: string,
    type: string,
    placeholder: string,
    autoComplete: string,
  ) => (
    <div>
      <label htmlFor={name} className="block text-base font-bold text-med-navy mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        dir={type === "email" ? "ltr" : undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="w-full min-h-[52px] rounded-xl border-2 border-med-navy/15 bg-med-surface px-4 text-[1.05rem] text-med-navy placeholder:text-med-navy/35 transition-colors focus:border-med-teal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-teal/30"
      />
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1.5 text-sm font-semibold text-med-blue">
          {errors[name]}
        </p>
      )}
    </div>
  );

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
          className="absolute inset-0 z-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, hsl(var(--med-yellow)) 0 14px, transparent 14px 46px)",
          }}
          aria-hidden
        />

        <nav className="relative z-10 max-w-6xl mx-auto px-5 pt-6 flex items-center justify-between text-med-surface">
          <div className="inline-flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-med-surface/15 border border-med-surface/25 backdrop-blur">
              <Stethoscope className="w-5.5 h-5.5" aria-hidden />
            </span>
            <span className="text-xl font-black tracking-tight">
              SAGE<span className="text-med-yellow">IFY</span>
              <span className="mx-2 opacity-40">|</span>
              <span className="text-base font-bold opacity-90">בריאות</span>
            </span>
          </div>
          <a
            href="#signup"
            className="hidden sm:inline-flex items-center min-h-[48px] px-5 rounded-full bg-med-yellow text-med-navy text-base font-black transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-surface/60"
          >
            הרשמה חינם
          </a>
        </nav>

        <div className="max-w-6xl mx-auto px-5 pt-14 pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
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
              SAGEIFY מאפשר לכם להתנסות, לגלות ולקבל הכוונה אישית. ללא עלות, ללא תשלום, ללא כרטיס אשראי.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#signup"
                className="inline-flex items-center gap-2 min-h-[56px] px-7 rounded-full bg-med-yellow text-med-navy text-lg font-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-surface/60"
              >
                נרשמים ומתחילים
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

          {/* Signup card */}
          <motion.div
            id="signup"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="rounded-3xl bg-med-surface p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,73,0.6)] scroll-mt-24"
          >
            {done ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 mx-auto text-med-teal" aria-hidden />
                <h2 className="mt-4 font-display text-2xl text-med-navy">נרשמתם בהצלחה!</h2>
                <p className="mt-3 text-lg text-med-navy/70 leading-relaxed">
                  ניצור איתכם קשר בקרוב עם קישור אישי להתחלת התהליך.
                  בינתיים אפשר להתנסות בסימולטור.
                </p>
                <a
                  href="/#/healthcare-sim"
                  className="mt-6 inline-flex items-center gap-2 min-h-[52px] px-6 rounded-full bg-med-teal text-med-surface text-base font-black transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-teal/40"
                >
                  לסימולטור
                  <ArrowLeft className="w-4 h-4" aria-hidden />
                </a>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl sm:text-3xl text-med-navy">הרשמה חינם</h2>
                <p className="mt-2 text-base text-med-navy/70">
                  שם, טלפון ומייל — וזה הכל. בלי תשלום ובלי התחייבות.
                </p>
                <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                  {field("full_name", "שם מלא", "text", "לדוגמה: יוסי כהן", "name")}
                  {field("phone", "טלפון", "tel", "050-0000000", "tel")}
                  {field("email", "אימייל", "email", "you@example.com", "email")}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full min-h-[56px] rounded-xl bg-med-navy text-med-surface text-lg font-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-med-blue disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-teal/40"
                  >
                    {sending ? "שולח..." : "שלחו לי גישה"}
                  </button>
                  <p className="text-sm text-med-navy/55 leading-relaxed">
                    הפרטים נשמרים אצלנו בלבד ומשמשים ליצירת קשר בנוגע לתהליך. ניתן להסיר בכל עת.
                  </p>
                </form>
              </>
            )}
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

        {/* Steps on brand blue with yellow parallelograms */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 z-0 bg-med-blue" aria-hidden />
          <div
            className="absolute inset-0 z-0 opacity-20"
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
              ההרשמה חינמית. הכיוון — שלכם.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-med-surface/85 max-w-2xl mx-auto leading-relaxed">
              משאירים שם, טלפון ומייל, ומקבלים גישה לתהליך גילוי אישי בעולם הבריאות.
            </p>
            <a
              href="#signup"
              className="mt-8 inline-flex items-center gap-2 min-h-[56px] px-8 rounded-full bg-med-yellow text-med-navy text-lg font-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-med-surface/60"
            >
              להרשמה
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
