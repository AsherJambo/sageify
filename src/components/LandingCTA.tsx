import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const LandingCTA = () => (
  <section className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
    <motion.div
      className="rounded-lg bg-primary p-12 md:p-16 shadow-[var(--shadow-elevated)]"
      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
        הפרק הבא שלכם מתחיל כאן
      </h2>
      <p className="text-primary-foreground/75 text-lg mb-4 max-w-md mx-auto leading-relaxed">
        תהליך אישי שייתן לכם בהירות וכיוון
      </p>
      <p className="text-primary-foreground/55 text-sm mb-8 max-w-sm mx-auto">
        צרו קשר ונשלח לכם קישור אישי להתחלת התהליך
      </p>
      <a
        href="mailto:sageify.ai@gmail.com"
        className="inline-flex items-center justify-center px-10 py-4 rounded-lg bg-white text-primary font-semibold text-lg hover:bg-white/90 transition-all duration-500 shadow-md"
      >
        צרו קשר — זה בחינם
      </a>
    </motion.div>
  </section>
);

export default LandingCTA;
