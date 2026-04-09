import { useState, useEffect } from 'react';
import owlLogo from '@/assets/owl-logo.png';

interface OwlMessageProps {
  message: string;
  variant?: 'encouragement' | 'tip' | 'celebration';
}

const OwlMessage = ({ message, variant = 'encouragement' }: OwlMessageProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-4 p-5 md:p-6 rounded-3xl border shadow-[var(--shadow-card)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        variant === 'celebration'
          ? 'bg-secondary/5 border-secondary/20'
          : variant === 'tip'
          ? 'bg-card border-border/60'
          : 'bg-card border-border/60'
      } ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <img
        src={owlLogo}
        alt="סגי"
        className="w-11 h-11 rounded-full flex-shrink-0 ring-1 ring-secondary/20 shadow-sm"
      />
      <p className="text-foreground text-lg leading-relaxed pt-0.5">{message}</p>
    </div>
  );
};

export default OwlMessage;
