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

      {/* Hero — asymmetric, text left-aligned (RTL = right) */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPremium} alt="" className="w-full h-full object-cover" width={1920} height={960} />
          <div className="absolute inset-0 bg-[hsl(210_12%_16%/0.82)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-28 md:pt-44 md:pb-40">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={sageifyLogo} alt="Sageify Logo" className="w-16 h-16 md:w-20 md:h-20 mb-8 rounded-xl" />
            </motion.div>

            <motion.h1
              className="text-3xl md:text-[3.25rem] font-bold text-white mb-6 leading-[1.15] tracking-tight"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              הקריירה מסתיימת.
              <br />
              <span className="text-[hsl(105_20%_72%)]">המשמעות רק מתחילה.</span>
            </motion.h1>

            <motion.p
              className="text-base md:text-lg text-white/75 max-w-lg mb-10 leading-[1.8]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              Sageify משלב פסיכולוגיה תעסוקתית, תפיסות "שלב הגשר בחיים"
              {' '}במעבר לשלב הפרישה ובינה מלאכותית
              {' '}כדי להפוך את חוסר הוודאות של הפרישה למסע מובנה
              {' '}לעבר הזהות הבאה שלכם
            </motion.p>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
                className="px-8 py-3.5 rounded-lg bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-opacity duration-300"
              >
                בואו נתחיל את המסע
              </button>
              <span className="text-white/35 text-sm">פרטיות מלאה</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sections — varied spacing */}
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

      {/* Footer — minimal */}
      <footer className="py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={sageifyLogo} alt="Sageify" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-bold text-sm tracking-wide">Sageify</span>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <span>© {new Date().getFullYear()} Sageify</span>
            <Link to="/admin-panel" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm">
              <Settings size={13} />
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
