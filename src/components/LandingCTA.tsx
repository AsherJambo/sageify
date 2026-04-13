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
      className="rounded-3xl bg-primary p-14 md:p-20 shadow-[var(--shadow-elevated)] relative overflow-hidden"
      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
    >
      {/* Decorative organic glow */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-secondary/10 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-3xl md:text-[2.5rem] font-bold text-primary-foreground mb-5 leading-tight">
          הפרק הבא שלכם מתחיל כאן
        </h2>
        <p className="text-primary-foreground/70 text-lg mb-5 max-w-md mx-auto leading-relaxed">
          תהליך אישי שייתן לכם בהירות וכיוון
        </p>
        <p className="text-primary-foreground/45 text-sm mb-10 max-w-sm mx-auto">
          צרו קשר ונשלח לכם קישור אישי להתחלת התהליך
        </p>
        <a
          href="mailto:sageify.ai@gmail.com"
          className="inline-flex items-center justify-center px-12 py-4.5 rounded-2xl bg-white text-primary font-bold text-lg hover:bg-white/95 transition-all duration-700 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2)] hover:translate-y-[-2px]"
        >
          צרו קשר
        </a>
      </div>
    </motion.div>
  </section>
);

export default LandingCTA;
