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
    transition: { delay: i * 0.18, duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPremium} alt="" className="w-full h-full object-cover" width={1920} height={960} />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200_28%_14%/0.88)] via-[hsl(200_28%_14%/0.72)] to-background" />
        </div>

        {/* Organic decorative shape */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,40 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 md:py-44 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <img src={sageifyLogo} alt="Sageify Logo" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-10 drop-shadow-xl rounded-2xl" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-[3.75rem] font-bold text-white mb-7 leading-[1.12] tracking-tight"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            יודעים שיש עוד פרק —
            <br />
            אבל לא בטוחים לאן?
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            תהליך אבחון אישי, מבוסס פסיכולוגיה תעסוקתית,
            <br className="hidden md:block" />
            שהופך את הניסיון שלכם לכיוון ברור ומעשי
          </motion.p>

          <motion.div
            className="flex flex-col items-center gap-5"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <a
              href="mailto:sageify.ai@gmail.com"
              className="inline-flex items-center justify-center px-12 py-4.5 rounded-2xl bg-white text-primary font-bold text-lg hover:bg-white/95 transition-all duration-700 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.3)] hover:translate-y-[-2px]"
            >
              התחילו את התהליך האישי
            </a>
            <span className="text-white/40 text-sm tracking-wide">פרטיות מלאה</span>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <LandingEmotional />
      <LandingHowItWorks />
      <LandingResultPreview />
      <LandingTrust />
      <LandingAudiences />
      <LandingTeam />
      <LandingFAQ />
      <LandingCTA />

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-primary/[0.02]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={sageifyLogo} alt="Sageify" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-bold text-base tracking-wide">Sageify</span>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <span>© {new Date().getFullYear()} Sageify. כל הזכויות שמורות.</span>
            <Link to="/admin-panel" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-400 text-sm font-medium">
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
