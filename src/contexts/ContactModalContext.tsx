import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import ContactFormModal from '@/components/ContactFormModal';

interface ContactModalContextValue {
  openContactModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export const useContactModal = () => {
  const ctx = useContext(ContactModalContext);
  if (!ctx) throw new Error('useContactModal must be used within ContactModalProvider');
  return ctx;
};

export const ContactModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener('open-contact-modal', handler);
    return () => document.removeEventListener('open-contact-modal', handler);
  }, []);

  return (
    <ContactModalContext.Provider value={{ openContactModal: () => setOpen(true) }}>
      {children}
      <ContactFormModal open={open} onClose={() => setOpen(false)} />
    </ContactModalContext.Provider>
  );
};
