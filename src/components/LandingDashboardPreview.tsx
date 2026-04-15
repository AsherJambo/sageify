import { motion } from 'framer-motion';

const DonutChart = () => {
  const segments = [
    { label: 'התנדבות', pct: 40, color: 'hsl(105 16% 57%)' },
    { label: 'פרילנס', pct: 35, color: 'hsl(210 12% 24%)' },
    { label: 'עבודה', pct: 25, color: 'hsl(16 72% 62%)' },
  ];

  const total = segments.reduce((s, seg) => s + seg.pct, 0);
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-36 h-36">
        {segments.map((seg, i) => {
          const radius = 48;
          const circumference = 2 * Math.PI * radius;
          const dashLength = (seg.pct / total) * circumference;
          const dashOffset = -(cumulative / total) * circumference;
          cumulative += seg.pct;
          return (
            <circle
              key={i}
              cx="60" cy="60" r={radius}
              fill="none" stroke={seg.color} strokeWidth="14"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          );
        })}
        <text x="60" y="56" textAnchor="middle" className="fill-foreground text-[13px] font-bold font-sans">65%</text>
        <text x="60" y="72" textAnchor="middle" className="fill-muted-foreground text-[8px] font-sans">השלמת אבחון</text>
      </svg>
      <div className="flex gap-4 text-sm">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.label} {seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingDashboardPreview = () => (
  <section className="relative py-20 md:py-28 overflow-hidden">
    <div className="max-w-4xl mx-auto px-6">
      <motion.p className="text-sm font-semibold text-primary tracking-widest uppercase text-right mb-4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}>
        הפלטפורמה
      </motion.p>
      <motion.h2 className="text-3xl md:text-[2.6rem] font-bold text-right mb-5 leading-tight"
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.1 }}>
        מפת הדרכים האישית שלכם
      </motion.h2>
      <motion.p className="text-muted-foreground text-right text-lg mb-14"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}>
        כל התובנות, ההתקדמות וההמלצות — במקום אחד
      </motion.p>

      {/* Staggered: progress card wider on top, donut card offset below */}
      <div className="space-y-6">
        <motion.div
          className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] md:max-w-xl"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.25 }}
        >
          <h3 className="text-lg font-bold mb-6 font-display">התקדמות במסע</h3>
          <div className="space-y-5">
            {[
              { label: 'שלב 1 — חקירה', pct: 100 },
              { label: 'שלב 2 — מעבר', pct: 65 },
              { label: 'שלב 3 — השפעה', pct: 20 },
            ].map((step, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-muted-foreground">{step.pct}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: step.pct === 100 ? 'hsl(var(--primary))' : 'hsl(var(--accent))' }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${step.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-primary font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            בעיצומו של שלב המעבר
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] md:max-w-md md:mr-auto"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          <h3 className="text-lg font-bold mb-6 font-display">התפלגות פעילויות מומלצות</h3>
          <DonutChart />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'חוזקות שזוהו', val: '12' },
              { label: 'עוגנים', val: '5' },
              { label: 'התאמות', val: '24' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-xl font-bold text-secondary">{stat.val}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default LandingDashboardPreview;
