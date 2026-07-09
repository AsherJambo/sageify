import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, ArrowLeft, Sparkles, GraduationCap } from "lucide-react";

const tracks = [
  {
    to: "/healthcare-sim/pt",
    name: "פיזיותרפיה",
    en: "Physical Therapy",
    emoji: "🏃",
    tag: "תנועה · שיקום · ארגונומיה",
    hero: "כאב זז. אתה מזיז אותו.",
    gradient: "linear-gradient(135deg, hsl(199 89% 55%), hsl(174 72% 45%))",
    glow: "hsl(199 89% 55%)",
  },
  {
    to: "/healthcare-sim/nutrition",
    name: "תזונה קלינית",
    en: "Clinical Nutrition",
    emoji: "🥗",
    tag: "BMI · סוכר · חלבון · תפריט",
    hero: "מזון הוא תרופה. אתה הרוקח.",
    gradient: "linear-gradient(135deg, hsl(142 71% 45%), hsl(48 96% 55%))",
    glow: "hsl(142 71% 45%)",
  },
  {
    to: "/nursing-er",
    name: "סיעוד — משמרת מיון",
    en: "Nursing · ER Shift",
    emoji: "🚑",
    tag: "Vitals · טיפול מהיר · ניירת",
    hero: "90 שניות. משמרת אחת במיון.",
    gradient: "linear-gradient(135deg, hsl(346 77% 55%), hsl(48 96% 55%))",
    glow: "hsl(346 77% 55%)",
  },
];

export default function HealthcareSimHub() {
  return (
    <div
      dir="rtl"
      className="min-h-dvh text-white relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 15% -10%, hsl(199 89% 48% / 0.28), transparent), radial-gradient(900px 500px at 100% 5%, hsl(346 77% 55% / 0.22), transparent), linear-gradient(180deg, #0b1220 0%, #0a0f1a 100%)",
      }}
    >
      <nav className="relative z-10 max-w-6xl mx-auto px-5 pt-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 font-black tracking-tight text-lg">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/15"
            aria-hidden
          >
            <Stethoscope className="w-5 h-5" />
          </span>
          <span>Care<span className="text-[hsl(48_96%_65%)]">.Play</span></span>
        </div>
        <a
          href="#paths"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition"
        >
          <GraduationCap className="w-4 h-4" aria-hidden />
          תארים בתחום
        </a>
      </nav>

      <main className="max-w-6xl mx-auto px-5 pt-10 pb-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/15 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(48_96%_65%)]" aria-hidden />
            סימולטור קריירה במקצועות הבריאות
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-5 font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight"
          >
            תרגיש איך זה שם
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, hsl(48 96% 65%), hsl(346 77% 65%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              לפני שנרשמת ל-4 שנים.
            </span>
          </motion.h1>

          <p className="mt-5 text-lg md:text-xl text-white/75 leading-relaxed">
            שלושה מסלולים. סימולציה מהירה, מטופלים אמיתיים, החלטות תחת שעון.
            <br />
            בחר מסלול, שחק משמרת אחת, וגלה אם זו הקריירה שלך.
          </p>
        </section>

        {/* Tracks grid */}
        <section className="mt-14" aria-label="בחירת מסלול">
          <div className="grid md:grid-cols-3 gap-5">
            {tracks.map((t, i) => (
              <motion.div
                key={t.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
              >
                <Link
                  to={t.to}
                  className="group relative block rounded-3xl p-6 border border-white/10 bg-white/[0.04] backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 h-full"
                  style={{ boxShadow: `0 20px 60px -30px ${t.glow}` }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-white/15"
                    style={{ background: t.gradient }}
                    aria-hidden
                  >
                    {t.emoji}
                  </div>
                  <div className="text-[10px] font-black tracking-[0.25em] text-white/45">{t.en}</div>
                  <h2 className="mt-1 font-serif text-2xl leading-tight">{t.name}</h2>
                  <p className="mt-3 text-white/75 text-base leading-snug">{t.hero}</p>
                  <div className="mt-4 text-xs text-white/50">{t.tag}</div>

                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-white transition-transform group-hover:-translate-x-1">
                    התחל משמרת
                    <ArrowLeft className="w-4 h-4" aria-hidden />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Paths */}
        <section id="paths" className="mt-20 pt-10 border-t border-white/10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/15">
              <GraduationCap className="w-3.5 h-3.5" aria-hidden />
              למה זה קיים
            </div>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl leading-tight">
              מקצועות הבריאות דורשים יד בטוחה, ראש קר וסבלנות.
            </h2>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">
              רוב הצעירים נרשמים לתואר בבריאות בלי לדעת איך באמת מרגיש רגע העבודה עצמו.
              הסימולטור הזה נותן טעימה של 90 שניות מכל מסלול — לפני החלטה של 4 שנים.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
