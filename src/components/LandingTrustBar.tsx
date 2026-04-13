import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const companies = [
  'Teva Pharmaceutical',
  'Israel Aerospace Industries',
  'Bank Leumi',
  'Elbit Systems',
  'Check Point',
  'IDF Veteran Services',
];

const LandingTrustBar = () => {
  return (
    <section className="py-12 border-y border-border/40">
      <div className="max-w-5xl mx-auto px-6">
        <motion.p
          className="text-sm text-muted-foreground text-center mb-8 tracking-wide uppercase font-medium"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          ארגונים שסומכים עלינו
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center items-center gap-8 md:gap-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          {companies.map((name, i) => (
            <div
              key={i}
              className="text-muted-foreground/40 font-semibold text-sm md:text-base tracking-wide select-none"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTrustBar;
