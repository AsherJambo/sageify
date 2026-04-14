import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const LandingCTA = () => (
  <section className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
    <motion.div
      className="rounded-3xl bg-secondary p-14 md:p-20 shadow-[var(--shadow-elevated)] relative overflow-hidden"
      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
    >
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-3xl md:text-[2.5rem] font-bold text-secondary-foreground mb-5 leading-tight">
          הפרק הבא שלכם מתחיל כאן
        </h2>
        <p className="text-secondary-foreground/70 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          תהליך אישי שייתן לכם בהירות וכיוון
        </p>
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
          className="inline-flex items-center justify-center px-12 py-4.5 rounded-2xl bg-accent text-accent-foreground font-bold text-lg hover:opacity-90 transition-all duration-500 shadow-[0_8px_24px_-6px_hsl(16_72%_50%/0.3)] hover:translate-y-[-2px]"
        >
          בואו נתחיל ✨
        </button>
      </div>
    </motion.div>
  </section>
);

export default LandingCTA;
