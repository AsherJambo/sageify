import { motion } from 'framer-motion';
import sageifyLogo from '@/assets/owl-logo.png';
import heroPremium from '@/assets/hero-premium.jpg';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

import LandingEmotional from '@/components/LandingEmotional';
import LandingHowItWorks from '@/components/LandingHowItWorks';
import LandingResultPreview from '@/components/LandingResultPreview';
import LandingTrust from '@/components/LandingTrust';
import LandingAudiences from '@/components/LandingAudiences';
import LandingTeam from '@/components/LandingTeam';
import LandingFAQ from '@/components/LandingFAQ';
import LandingCTA from '@/components/LandingCTA';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPremium} alt="" className="w-full h-full object-cover" width={1920} height={960} />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(192_32%_16%/0.85)] via-[hsl(192_32%_16%/0.70)] to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-28 md:py-40 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <img src={sageifyLogo} alt="Sageify Logo" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 drop-shadow-lg" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-[3.5rem] font-bold text-white mb-6 leading-[1.15]"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            יודעים שיש עוד פרק —
            <br />
            אבל לא בטוחים לאן?
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-4 leading-relaxed font-light"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            תהליך אבחון קצר ואישי, מבוסס פסיכולוגיה תעסוקתית,
            <br className="hidden md:block" />
            שהופך את הניסיון שלכם לכיוון ברור ומעשי
          </motion.p>

          <motion.p
            className="text-base text-white/60 mb-10"
            initial="hidden" animate="visible" variants={fadeUp} custom={2.5}
          >
            ~10 דקות · אישי לחלוטין · בחינם
          </motion.p>

          <motion.div
            className="flex flex-col items-center gap-4"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <a
              href="mailto:sageify.ai@gmail.com"
              className="inline-flex items-center justify-center px-10 py-4 rounded-lg bg-white text-primary font-semibold text-lg hover:bg-white/90 transition-all duration-500 shadow-md"
            >
              התחילו את התהליך האישי
            </a>
            <span className="text-white/50 text-sm">ללא התחייבות · פרטיות מלאה</span>
          </motion.div>
        </div>
      </section>

      {/* 1. Emotional validation */}
      <LandingEmotional />

      {/* 2. How it works — 3 simple steps */}
      <LandingHowItWorks />

      {/* 3. Result preview */}
      <LandingResultPreview />

      {/* 4. Trust & credibility */}
      <LandingTrust />

      {/* 5. Audiences */}
      <LandingAudiences />

      {/* 6. Team */}
      <LandingTeam />

      {/* 7. FAQ */}
      <LandingFAQ />

      {/* 8. Final CTA */}
      <LandingCTA />

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={sageifyLogo} alt="Sageify" className="w-7 h-7" />
            <span className="font-semibold text-base">Sageify</span>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <span>© {new Date().getFullYear()} Sageify. כל הזכויות שמורות.</span>
            <Link to="/admin-panel" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-400 text-sm font-medium">
              <Settings size={14} />
              ניהול
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
