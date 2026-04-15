import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'נא להזין שם מלא').max(100),
  email: z.string().trim().email('נא להזין כתובת מייל תקינה').max(255),
  message: z.string().trim().min(1, 'נא להזין הודעה').max(2000),
});

type FormData = z.infer<typeof contactSchema>;

interface ContactFormModalProps {
  open: boolean;
  onClose: () => void;
}

const ContactFormModal = ({ open, onClose }: ContactFormModalProps) => {
  const [form, setForm] = useState<FormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormData;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setStatus('sending');
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: result.data.name,
        email: result.data.email,
        message: result.data.message,
      });
      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus('idle');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' });
      setErrors({});
      setStatus('idle');
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-7 pb-2">
              <h3 className="text-xl font-bold font-serif">השאירו פרטים</h3>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                aria-label="סגור"
              >
                <X size={18} />
              </button>
            </div>
            <p className="px-7 text-sm text-muted-foreground mb-6">
              נחזור אליכם בהקדם עם כל הפרטים
            </p>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-14 px-7 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 font-serif">תודה רבה!</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    קיבלנו את הפרטים שלכם ונחזור אליכם בהקדם האפשרי
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-8 px-8 py-3 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-muted-foreground/10 transition-all"
                  >
                    סגור
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="px-7 pb-7 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">שם מלא</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.name ? 'border-destructive' : 'border-border'}`}
                      placeholder="ישראל ישראלי"
                      disabled={status === 'sending'}
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">כתובת מייל</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.email ? 'border-destructive' : 'border-border'}`}
                      placeholder="example@email.com"
                      dir="ltr"
                      disabled={status === 'sending'}
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">הודעה</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.message ? 'border-destructive' : 'border-border'}`}
                      placeholder="ספרו לנו במה נוכל לעזור..."
                      disabled={status === 'sending'}
                    />
                    {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-all duration-300 shadow-sm disabled:opacity-70"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        שולח...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        שליחה
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactFormModal;
