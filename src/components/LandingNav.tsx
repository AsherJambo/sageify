import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sageifyLogo from '@/assets/owl-logo.png';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'איך זה עובד', href: '#how-it-works' },
  { label: 'מפת הדרכים שלי', href: '#dashboard' },
  { label: 'מסלולים', href: '#pricing' },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-md shadow-[var(--shadow-card)] border-b border-border/40'
          : 'bg-transparent'
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16 md:h-[72px]">
        <div className="flex items-center gap-2.5">
          <img src={sageifyLogo} alt="Sageify" className="w-9 h-9 rounded-xl" />
          <span className={`font-display font-bold text-lg tracking-wide transition-colors duration-500 ${
            scrolled ? 'text-foreground' : 'text-white'
          }`}>
            Sageify
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`text-sm font-semibold transition-colors duration-300 hover:text-primary ${
                scrolled ? 'text-foreground' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { try { const { useContactModal } = require('@/contexts/ContactModalContext'); } catch {} document.dispatchEvent(new CustomEvent('open-contact-modal')); }}
            className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-all duration-300 shadow-sm"
          >
            בואו נתחיל
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-card border-t border-border/40 shadow-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block w-full text-right py-3 text-base font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="mailto:sageify.ai@gmail.com"
                className="block text-center w-full py-3 mt-2 rounded-xl bg-accent text-accent-foreground font-bold"
              >
                בואו נתחיל
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LandingNav;
