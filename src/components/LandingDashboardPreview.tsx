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
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 120 120" className="w-28 h-28">
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
              fill="none" stroke={seg.color} strokeWidth="12"
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
      <div className="flex gap-4 text-xs text-muted-foreground">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span>{seg.label} {seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingDashboardPreview = () => (
  <section className="py-16 md:py-24">
    <div className="max-w-4xl mx-auto px-6">
      <motion.p className="text-sm font-semibold text-primary tracking-wide text-right mb-3"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}>
        הפלטפורמה
      </motion.p>
      <motion.h2 className="text-2xl md:text-[2.25rem] font-bold text-right mb-4 leading-tight"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}>
        מפת הדרכים האישית שלכם
      </motion.h2>
      <motion.p className="text-muted-foreground text-right text-base mb-10"
        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 }}>
        כל התובנות, ההתקדמות וההמלצות — במקום אחד
      </motion.p>

      {/* Two items side by side on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-5 md:items-start">
        <motion.div
          className="flex-1 border border-border rounded-lg p-6 bg-card/60"
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          <h3 className="text-base font-bold mb-5 font-display">התקדמות במסע</h3>
          <div className="space-y-4">
            {[
              { label: 'שלב 1 — חקירה', pct: 100 },
              { label: 'שלב 2 — מעבר', pct: 65 },
              { label: 'שלב 3 — השפעה', pct: 20 },
            ].map((step, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-muted-foreground text-xs">{step.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: step.pct === 100 ? 'hsl(var(--primary))' : 'hsl(var(--accent))' }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${step.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            בעיצומו של שלב המעבר
          </div>
        </motion.div>

        <motion.div
          className="md:w-72 border border-border rounded-lg p-6 bg-card/60"
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <h3 className="text-base font-bold mb-4 font-display">התפלגות פעילויות</h3>
          <DonutChart />
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: 'חוזקות', val: '12' },
              { label: 'עוגנים', val: '5' },
              { label: 'התאמות', val: '24' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-2">
                <div className="text-lg font-bold text-secondary">{stat.val}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default LandingDashboardPreview;
