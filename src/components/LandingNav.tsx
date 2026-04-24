import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sageifyLogo from '@/assets/owl-logo.png';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'הכאב', href: '#challenge' },
  { label: 'איך זה עובד', href: '#how-it-works' },
  { label: 'מפת הדרכים', href: '#dashboard' },
];

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-sm border-b border-border/30'
          : 'bg-transparent'
      }`}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14 md:h-16">
        <div className="flex items-center gap-2">
          <img src={sageifyLogo} alt="Sageify" className="w-8 h-8 rounded-lg" />
          <span className={`font-display font-bold text-base tracking-wide transition-colors duration-400 ${
            scrolled ? 'text-foreground' : 'text-white'
          }`}>
            Sageify
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`text-sm font-medium transition-colors duration-300 ${
                scrolled ? 'text-foreground/70 hover:text-foreground' : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
            className="px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity duration-300"
          >
            בואו נתחיל
          </button>
        </nav>

        <button
          className={`md:hidden p-2 ${scrolled ? 'text-foreground' : 'text-white'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-background border-t border-border/30"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 py-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block w-full text-right py-2.5 text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileOpen(false); document.dispatchEvent(new CustomEvent('open-contact-modal')); }}
                className="block text-center w-full py-2.5 mt-1 rounded-lg bg-accent text-accent-foreground font-bold text-sm"
              >
                בואו נתחיל
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LandingNav;
