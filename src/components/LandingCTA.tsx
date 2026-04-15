import { motion } from 'framer-motion';

const LandingCTA = () => (
  <section className="px-6 py-20 md:py-28">
    <motion.div
      className="max-w-2xl mx-auto rounded-3xl bg-secondary p-12 md:p-16 shadow-[var(--shadow-elevated)] relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10 text-right">
        <h2 className="text-3xl md:text-[2.4rem] font-bold text-secondary-foreground mb-5 leading-tight">
          הפרק הבא שלכם מתחיל כאן
        </h2>
        <p className="text-secondary-foreground/70 text-lg mb-10 leading-relaxed max-w-md">
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
