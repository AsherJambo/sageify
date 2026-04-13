import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
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
  },
  {
    value: 30,
    suffix: '',
    prefix: '20-',
    label: 'שנות חיוניות לאחר הפרישה',
    sub: 'פרדוקס האריכות',
  },
  {
    value: 0,
    suffix: '',
    label: 'כלי אבחון מותאמים לגיל השלישי',
    sub: 'כשל אבחוני מוחלט',
    staticDisplay: '0',
  },
];

const challenges = [
  {
    icon: '😰',
    title: 'משבר זהות',
    desc: '40% מהפורשים חווים ירידה במצב הנפשי ואובדן סטטוס',
  },
  {
    icon: '📉',
    title: 'כשל אבחוני',
    desc: 'כלי המדידה הקיימים עוצבו לבני 20, לא לבעלי ניסיון חיים',
  },
  {
    icon: '🧭',
    title: 'היעדר מצפן',
    desc: 'בדידות וירידה קוגניטיבית מואצת בשל היעדר ייעוד חדש',
  },
];

const LandingChallenge = () => {
  return (
    <section id="challenge" className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        className="text-center mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-semibold mb-4">
          האתגר
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">ואקום המשמעות</h2>
      </motion.div>

      {/* Stats Callouts */}
      <div className="grid md:grid-cols-3 gap-6 mb-14">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i + 1}
          >
            <div className="text-5xl md:text-6xl font-black text-primary mb-2 tabular-nums">
              {s.staticDisplay !== undefined ? (
                s.staticDisplay
              ) : (
                <>
                  {s.prefix && <span>{s.prefix}</span>}
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </>
              )}
            </div>
            <p className="text-lg font-bold mb-1">{s.label}</p>
            <p className="text-sm text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Challenge Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {challenges.map((c, i) => (
          <motion.div
            key={i}
            className="rounded-3xl border border-destructive/20 bg-destructive/[0.03] p-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i + 4}
          >
            <span className="text-4xl block mb-4">{c.icon}</span>
            <h3 className="text-xl font-bold mb-3">{c.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LandingChallenge;
