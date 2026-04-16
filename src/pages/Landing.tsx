import { motion } from 'framer-motion';
import sageifyLogo from '@/assets/owl-logo.png';
import heroPremium from '@/assets/hero-premium.jpg';
import { Link } from 'react-router-dom';
import { ContactModalProvider } from '@/contexts/ContactModalContext';
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

const Landing = () => {
  return (
    <ContactModalProvider>
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPremium} alt="" className="w-full h-full object-cover" width={1920} height={960} />
          <div className="absolute inset-0 bg-[hsl(210_12%_16%/0.82)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-24 md:pt-40 md:pb-36">
          <div className="max-w-lg">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
              <img src={sageifyLogo} alt="Sageify Logo" className="w-14 h-14 md:w-16 md:h-16 mb-7 rounded-lg" />
            </motion.div>

            <motion.h1
              className="text-2xl md:text-[2.75rem] font-bold text-white mb-5 leading-[1.2] tracking-tight"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              הקריירה מסתיימת.
              <br />
              <span className="text-[hsl(105_20%_72%)]">המשמעות רק מתחילה.</span>
            </motion.h1>

            <motion.p
              className="text-sm md:text-base text-white/65 max-w-md mb-8 leading-[1.85]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.25 }}
            >
              Sageify משלב פסיכולוגיה תעסוקתית, תפיסות "שלב הגשר בחיים"
              {' '}במעבר לשלב הפרישה ובינה מלאכותית
              {' '}כדי להפוך את חוסר הוודאות של הפרישה למסע מובנה
              {' '}לעבר הזהות הבאה שלכם
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
                className="px-7 py-3 rounded-lg bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition-opacity duration-300"
              >
                בואו נתחיל את המסע
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Each section at different widths and spacings — no uniform rhythm */}
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

      <footer className="py-8 px-6 border-t border-border/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={sageifyLogo} alt="Sageify" className="w-6 h-6 rounded-md" />
            <span className="font-display font-bold text-sm">Sageify</span>
          </div>
          <div className="flex items-center gap-5 text-muted-foreground text-xs">
            <span>© {new Date().getFullYear()} Sageify</span>
            <Link to="/admin-panel" className="inline-flex items-center gap-1 hover:text-foreground transition-colors text-xs">
              <Settings size={11} />
              ניהול
            </Link>
          </div>
        </div>
      </footer>
    </div>
    </ContactModalProvider>
  );
};

export default Landing;
