import { motion } from 'framer-motion';

const LandingCTA = () => (
  <section className="px-6 py-16 md:py-24">
    <div className="max-w-xl mx-auto text-right">
      <motion.h2
        className="text-2xl md:text-[2.25rem] font-bold mb-4 leading-tight"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        הפרק הבא שלכם מתחיל כאן
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-base mb-8 leading-relaxed"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
      >
        תהליך אישי שייתן לכם בהירות וכיוון
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
          className="px-8 py-3.5 rounded-lg bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-opacity duration-300"
        >
          בואו נתחיל
        </button>
      </motion.div>
    </div>
  </section>
);

export default LandingCTA;
