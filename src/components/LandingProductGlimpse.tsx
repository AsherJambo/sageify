import { motion } from 'framer-motion';
import previewHub from '@/assets/preview-hub.png';
import previewVia from '@/assets/preview-via.png';
import previewSkills from '@/assets/preview-skills.png';

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
          <p className="text-xs uppercase tracking-[0.18em] text-secondary mb-4 font-medium">
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

        {/* First screenshot — large, off-center to the right */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="md:mr-12 lg:mr-24 mb-24 md:mb-32"
        >
          <div className="rounded-md overflow-hidden shadow-[0_20px_60px_-20px_hsl(210_12%_16%/0.18)] border border-border/40">
            <img
              src={previewHub}
              alt="מסך בחירת השאלונים — שמונה אזורי חקירה לבחירה חופשית"
              loading="lazy"
              width={1280}
              height={708}
              className="w-full h-auto block"
            />
          </div>
          <figcaption className="text-sm text-muted-foreground mt-5 md:mr-2 max-w-md leading-relaxed">
            <span className="text-foreground font-medium">תפריט הבחירה.</span>{' '}
            שמונה תחומי חקירה. בוחרים מה שמרגיש נכון, באיזה סדר שרוצים.
          </figcaption>
        </motion.figure>

        {/* Second + Third — asymmetric pair, different sizes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-end">
          <motion.figure
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.05 }}
            className="md:col-span-7"
          >
            <div className="rounded-md overflow-hidden shadow-[0_16px_50px_-20px_hsl(210_12%_16%/0.16)] border border-border/40">
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
            className="md:col-span-5 md:mb-12"
          >
            <div className="rounded-md overflow-hidden shadow-[0_16px_50px_-20px_hsl(210_12%_16%/0.16)] border border-border/40">
              <img
                src={previewVia}
                alt="שאלון חוזקות VIA — דירוג בסולם של 1 עד 5"
                loading="lazy"
                width={1280}
                height={708}
                className="w-full h-auto block"
              />
            </div>
            <figcaption className="text-sm text-muted-foreground mt-5 max-w-xs leading-relaxed">
              <span className="text-foreground font-medium">חוזקות VIA.</span>{' '}
              מזהים את הדפוסים שחזרו על עצמם בכל תחנה בקריירה שלכם.
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
};

export default LandingProductGlimpse;
