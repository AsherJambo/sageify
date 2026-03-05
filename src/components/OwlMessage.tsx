import { useState, useEffect } from 'react';
import owlLogo from '@/assets/sageify-logo.jpeg';

interface OwlMessageProps {
  message: string;
  variant?: 'encouragement' | 'tip' | 'celebration';
}

const OwlMessage = ({ message, variant = 'encouragement' }: OwlMessageProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [message]);

  const bgClass = variant === 'celebration'
    ? 'bg-secondary/10 border-secondary/30'
    : variant === 'tip'
    ? 'bg-primary/5 border-primary/15'
    : 'bg-card border-border';

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border shadow-sm transition-all duration-500 ${bgClass} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <img
        src={owlLogo}
        alt="הינשוף של Sageify"
        className="w-10 h-10 rounded-full flex-shrink-0 animate-bounce-gentle"
      />
      <p className="text-foreground text-base leading-relaxed pt-1">{message}</p>
    </div>
  );
};

export default OwlMessage;
