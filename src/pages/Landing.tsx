import { motion } from 'framer-motion';
import sageifyLogo from '@/assets/owl-logo.png';
import heroPremium from '@/assets/hero-premium.jpg';
import { Link } from 'react-router-dom';
import { ContactModalProvider, useContactModal } from '@/contexts/ContactModalContext';
import { Settings } from 'lucide-react';

import LandingNav from '@/components/LandingNav';
import LandingEmotional from '@/components/LandingEmotional';
import LandingDashboardPreview from '@/components/LandingDashboardPreview';
import LandingPillars from '@/components/LandingPillars';
import LandingHowItWorks from '@/components/LandingHowItWorks';
import LandingResultPreview from '@/components/LandingResultPreview';
import LandingTrust from '@/components/LandingTrust';
import LandingAudiences from '@/components/LandingAudiences';
import LandingPricing from '@/components/LandingPricing';
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
      <LandingNav />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPremium} alt="" className="w-full h-full object-cover" width={1920} height={960} />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210_12%_16%/0.88)] via-[hsl(210_12%_16%/0.72)] to-background" />
        </div>

        {/* Organic wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,40 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-32 md:pt-48 md:pb-44 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <img src={sageifyLogo} alt="Sageify Logo" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-10 drop-shadow-xl rounded-2xl" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-[3.75rem] font-bold text-white mb-7 leading-[1.12] tracking-tight"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            הקריירה מסתיימת.
            <br />
            <span className="text-[hsl(105_20%_72%)]">המשמעות רק מתחילה.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Sageify משלב פסיכולוגיה תעסוקתית, תפיסות "שלב הגשר בחיים"
            <br className="hidden md:block" />
            במעבר לשלב הפרישה ובינה מלאכותית
            <br className="hidden md:block" />
            כדי להפוך את חוסר הוודאות של הפרישה למסע מובנה
            <br className="hidden md:block" />
            לעבר הזהות הבאה שלכם
          </motion.p>

          <motion.div
            className="flex flex-col items-center gap-5"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <a
              href="mailto:sageify.ai@gmail.com"
              className="inline-flex items-center justify-center px-12 py-4.5 rounded-2xl bg-accent text-accent-foreground font-bold text-lg hover:opacity-90 transition-all duration-500 shadow-[0_8px_24px_-6px_hsl(16_72%_50%/0.35)] hover:shadow-[0_12px_32px_-6px_hsl(16_72%_50%/0.45)] hover:translate-y-[-2px]"
            >
              בואו נתחיל את המסע ✨
            </a>
            <span className="text-white/40 text-sm tracking-wide">פרטיות מלאה</span>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <LandingEmotional />
      <div id="dashboard"><LandingDashboardPreview /></div>
      <LandingPillars />
      <div id="how-it-works"><LandingHowItWorks /></div>
      <LandingResultPreview />
      <LandingTrust />
      <LandingAudiences />
      <div id="pricing"><LandingPricing /></div>
      <LandingTeam />
      <LandingFAQ />
      <LandingCTA />

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-card/50">
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
