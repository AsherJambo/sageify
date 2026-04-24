import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
};

const stats = [
  {
    value: 40,
    suffix: '%',
    label: 'מהפורשים חווים ירידה במצב הנפשי',
    sub: 'משבר זהות ואובדן סטטוס',
    source: 'Wang, 2007 – Journal of Applied Gerontology',
  },
  {
    value: 30,
    suffix: '',
    prefix: '20-',
    label: 'שנות חיוניות לאחר הפרישה',
    sub: 'פרדוקס האריכות',
    source: 'WHO Life Expectancy Data, 2023',
  },
  {
    value: 0,
    suffix: '',
    label: 'כלי אבחון מותאמים לגיל השלישי',
    sub: 'כשל אבחוני מוחלט',
    staticDisplay: '0',
    source: 'סקירת ספרות – Geropsychology, 2022',
  },
];

const challenges = [
  {
    title: 'אין כלי אבחון מותאמים',
    desc: 'מבחני הפסיכולוגיה התעסוקתית הקיימים (Holland, Schein, VIA) עוצבו לבני 20 בתחילת הקריירה — לא לבעלי 40 שנות ניסיון בפתחו של פרק חדש',
  },
  {
    title: 'אין הכוונה לעשייה אקטיבית',
    desc: 'הייעוץ הקיים מתמקד בפן הכלכלי (פנסיה, השקעות) ומתעלם מהשאלה האמיתית: "מה אעשה עם 30 שנות החיוניות שנותרו לי?"',
  },
  {
    title: 'התוצאה: ואקום משמעות',
    desc: 'ללא מצפן מקצועי מותאם — משבר זהות, בדידות, וירידה קוגניטיבית מואצת בשל היעדר ייעוד פעיל',
  },
];

const LandingChallenge = () => {
  return (
    <section id="challenge" className="max-w-5xl mx-auto px-6 py-20 md:py-28">
      <motion.div
        className="text-center mb-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
      >
        <p className="text-sm text-accent font-semibold mb-3 tracking-wide">הכאב שאנחנו פותרים</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          אין כלי פסיכולוגיה תעסוקתית
          <br />
          <span className="text-accent">לאבחון והכוונה בגיל השלישי</span>
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
          בעוד שלצעירים מציעים עשרות מבחני התאמה תעסוקתית — בני 60+ נותרים ללא מצפן מקצועי
          {' '}בדיוק ברגע שבו נפתחות בפניהם 20-30 שנות חיוניות נוספות
        </p>
      </motion.div>

      {/* Hero stat — the core pain */}
      <motion.div
        className="relative border-2 border-accent/30 rounded-lg p-10 md:p-12 text-center bg-card mb-10 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={1}
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-accent via-accent/60 to-accent" />
        <p className="text-xs text-accent font-semibold mb-3 tracking-widest uppercase">הכשל האבחוני</p>
        <div className="text-7xl md:text-8xl font-black text-primary mb-4 tabular-nums font-serif leading-none">
          0
        </div>
        <p className="font-bold text-lg md:text-xl mb-2">
          כלי פסיכולוגיה תעסוקתית מותאמים לגיל 60+
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          כל המבחנים הפסיכומטריים והכלים להכוונה לעשייה אקטיבית עוצבו עבור בני 20-40.
          אין שום מענה מקצועי לבעלי הניסיון.
        </p>
        <p className="text-[10px] text-muted-foreground/60 italic">
          סקירת ספרות – Geropsychology, 2022
        </p>
      </motion.div>

      {/* Supporting stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {stats.filter((_, i) => i !== 2).map((s, i) => (
          <motion.div
            key={i}
            className="border border-border/50 rounded-lg p-8 text-center bg-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i + 2}
          >
            <div className="text-5xl md:text-6xl font-black text-primary mb-3 tabular-nums font-serif">
              {s.staticDisplay !== undefined ? (
                s.staticDisplay
              ) : (
                <>
                  {s.prefix && <span>{s.prefix}</span>}
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </>
              )}
            </div>
            <p className="font-semibold text-sm mb-1">{s.label}</p>
            <p className="text-xs text-muted-foreground mb-3">{s.sub}</p>
            <p className="text-[10px] text-muted-foreground/50 italic">{s.source}</p>
          </motion.div>
        ))}
      </div>

      {/* Challenge details */}
      <div className="grid md:grid-cols-3 gap-px bg-border/50 border border-border/50 rounded-lg overflow-hidden">
        {challenges.map((c, i) => (
          <motion.div
            key={i}
            className="bg-card p-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i + 4}
          >
            <div className="w-6 h-px bg-accent mx-auto mb-5" />
            <h3 className="text-lg font-bold mb-2 font-serif">{c.title}</h3>
            <p className="text-muted-foreground text-[15px] leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LandingChallenge;
