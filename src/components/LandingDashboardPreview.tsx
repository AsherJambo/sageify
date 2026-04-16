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
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0">
        {segments.map((seg, i) => {
          const radius = 48;
          const circumference = 2 * Math.PI * radius;
          const dashLength = (seg.pct / total) * circumference;
          const dashOffset = -(cumulative / total) * circumference;
          cumulative += seg.pct;
          return (
            <circle key={i} cx="60" cy="60" r={radius} fill="none" stroke={seg.color} strokeWidth="12"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`} strokeDashoffset={dashOffset}
              strokeLinecap="round" />
          );
        })}
        <text x="60" y="58" textAnchor="middle" className="fill-foreground text-[12px] font-bold font-sans">65%</text>
        <text x="60" y="70" textAnchor="middle" className="fill-muted-foreground text-[7px] font-sans">אבחון</text>
      </svg>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span>{seg.label} {seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingDashboardPreview = () => (
  <section className="py-14 md:py-20">
    {/* Full-width feel, wider than other sections */}
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 md:items-start">
        {/* Left side: text intro — no label/subtitle pattern */}
        <div className="md:w-56 shrink-0 md:pt-2">
          <motion.h2 className="text-xl md:text-2xl font-bold leading-tight mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.9 }}>
            מפת הדרכים האישית שלכם
          </motion.h2>
          <motion.p className="text-muted-foreground text-sm leading-relaxed"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}>
            כל התובנות, ההתקדמות וההמלצות — במקום אחד
          </motion.p>
        </div>

        {/* Right side: preview content inline */}
        <div className="flex-1 space-y-6">
          <motion.div
            className="border border-border/50 rounded-lg p-5"
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="space-y-3.5">
              {[
                { label: 'שלב 1 — חקירה', pct: 100 },
                { label: 'שלב 2 — מעבר', pct: 65 },
                { label: 'שלב 3 — השפעה', pct: 20 },
              ].map((step, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sm">{step.label}</span>
                    <span className="text-muted-foreground text-xs">{step.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ backgroundColor: step.pct === 100 ? 'hsl(var(--primary))' : 'hsl(var(--accent))' }}
                      initial={{ width: 0 }} whileInView={{ width: `${step.pct}%` }} viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.1 }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-start gap-5 sm:items-center"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <DonutChart />
            <div className="flex gap-4 text-center">
              {[{ label: 'חוזקות', val: '12' }, { label: 'עוגנים', val: '5' }, { label: 'התאמות', val: '24' }].map((s, i) => (
                <div key={i}>
                  <div className="text-lg font-bold text-secondary">{s.val}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export default LandingDashboardPreview;
