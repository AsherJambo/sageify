import { motion } from 'framer-motion';
import previewHolland from '@/assets/preview-holland-playful.jpg';
import previewThinking from '@/assets/preview-thinking-playful.jpg';
import previewSkills from '@/assets/preview-skills-playful.jpg';
import { Sparkles } from 'lucide-react';

const LandingProductGlimpse = () => {
  return (
    <section className="py-28 md:py-36 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Intro — narrow, intentional */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-md mb-20 md:mb-24"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-secondary mb-4 font-medium inline-flex items-center gap-2">
            <Sparkles size={12} className="text-secondary" />
            הצצה פנימה
          </p>
          <h2 className="text-3xl md:text-[2.25rem] font-display font-bold text-foreground leading-[1.25] mb-5">
            שאלונים שנבנו <br className="hidden md:block" />
            כמו שיחה אמיתית
          </h2>
          <p className="text-base text-muted-foreground leading-[1.85] max-w-sm">
            שמונה שאלונים קצרים, כל אחד עומד בפני עצמו.
            ענו בקצב שלכם, חזרו אחורה, או דלגו ותחזרו מחר.
          </p>
        </motion.div>

        {/* First screenshot — large, off-center to the right, with playful hand-drawn callouts */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="md:mr-12 lg:mr-24 mb-24 md:mb-32 relative group"
        >
          {/* Floating playful badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, type: 'spring' }}
            className="absolute -top-5 -left-3 md:-top-6 md:-left-8 z-10 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
            style={{ transform: 'rotate(-6deg)' }}
          >
            8 תחומים ✦
          </motion.div>

          {/* Pulsing dot */}
          <div className="absolute top-8 right-8 z-10 hidden md:flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
            </span>
            <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">live</span>
          </div>

          <div className="rounded-md overflow-hidden shadow-[0_20px_60px_-20px_hsl(210_12%_16%/0.18)] border border-border/40 transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_30px_70px_-20px_hsl(210_12%_16%/0.25)]">
            <img
              src={previewHolland}
              alt="שאלון נטיות תעסוקתיות — כפתורי כן/לא צבעוניים עם קונפטי"
              loading="lazy"
              width={1280}
              height={896}
              className="w-full h-auto block"
            />
          </div>
          <figcaption className="text-sm text-muted-foreground mt-5 md:mr-2 max-w-md leading-relaxed">
            <span className="text-foreground font-medium">נטיות תעסוקתיות.</span>{' '}
            כן או לא, פשוט וכיף. קצב של שיחה, לא של בוחן.
          </figcaption>
        </motion.figure>

        {/* Second + Third — asymmetric pair, different sizes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-end">
          <motion.figure
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.05 }}
            className="md:col-span-7 relative group"
          >
            {/* Sticky-note style tag */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-6 z-10 bg-[hsl(45_70%_88%)] text-foreground text-[11px] font-medium px-3 py-1.5 rounded shadow-md border border-[hsl(45_50%_75%)]"
              style={{ transform: 'rotate(2deg)' }}
            >
              ✏️ ארגז כלים מנצח
            </motion.div>

            <div className="rounded-md overflow-hidden shadow-[0_16px_50px_-20px_hsl(210_12%_16%/0.16)] border border-border/40 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-0.5deg]">
              <img
                src={previewSkills}
                alt="שאלון כישורים — מיון לארבע קטגוריות"
                loading="lazy"
                width={1280}
                height={708}
                className="w-full h-auto block"
              />
            </div>
            <figcaption className="text-sm text-muted-foreground mt-5 max-w-sm leading-relaxed">
              <span className="text-foreground font-medium">מיון כישורים.</span>{' '}
              לא רק מה אתם יודעים — אלא מה עוד מעניין אתכם, ומה כבר מיציתם.
            </figcaption>
          </motion.figure>

          <motion.figure
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="md:col-span-5 md:mb-12 relative group"
          >
            {/* Star burst with count */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, type: 'spring', bounce: 0.5 }}
              className="absolute -top-4 -right-3 md:-top-5 md:-right-5 z-10 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-accent/15 rounded-full animate-pulse" />
              <div className="relative bg-accent text-accent-foreground rounded-full w-10 h-10 md:w-12 md:h-12 flex flex-col items-center justify-center text-[10px] font-bold leading-none shadow-md" style={{ transform: 'rotate(-12deg)' }}>
                <span className="text-base">🧩</span>
                <span className="text-[8px] mt-0.5 opacity-90">חידה</span>
              </div>
            </motion.div>

            <div className="rounded-md overflow-hidden shadow-[0_16px_50px_-20px_hsl(210_12%_16%/0.16)] border border-border/40 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[0.5deg]">
              <img
                src={previewThinking}
                alt="מבחן חשיבה — חידת מטריצות חזותית עם טיימר"
                loading="lazy"
                width={1280}
                height={896}
                className="w-full h-auto block"
              />
            </div>
            <figcaption className="text-sm text-muted-foreground mt-5 max-w-xs leading-relaxed">
              <span className="text-foreground font-medium">מבחן חשיבה.</span>{' '}
              חידות חזותיות, טיימר עדין, וסגי שמלווה אתכם בדרך.
            </figcaption>
          </motion.figure>
        </div>

        {/* Playful footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-xs text-muted-foreground/70 mt-16 md:mt-20 italic"
        >
          ↑ זה לא mockup. אלו צילומי מסך אמיתיים מהמערכת.
        </motion.p>
      </div>
    </section>
  );
};

export default LandingProductGlimpse;
