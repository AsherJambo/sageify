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
    title: 'משבר זהות',
    desc: '40% מהפורשים חווים ירידה במצב הנפשי ואובדן סטטוס',
  },
  {
    title: 'כשל אבחוני',
    desc: 'כלי המדידה הקיימים עוצבו לבני 20, לא לבעלי ניסיון חיים',
  },
  {
    title: 'היעדר מצפן',
    desc: 'בדידות וירידה קוגניטיבית מואצת בשל היעדר ייעוד חדש',
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
        <p className="text-sm text-accent font-semibold mb-3 tracking-wide">האתגר</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">ואקום המשמעות</h2>
        <p className="text-muted-foreground text-base max-w-lg mx-auto">
          פרדוקס האריכות: 20-30 שנות חיוניות אל מול תהום של חוסר מעש
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className="border border-border/50 rounded-lg p-8 text-center bg-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i + 1}
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
