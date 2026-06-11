import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, CalendarCheck, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
];

// Strict email pattern (RFC-ish, no spaces, single @, real TLD)
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
// Hebrew + English letters, spaces, hyphen, apostrophe (e.g. כהן-לוי, O'Brien)
const NAME_RE = /^[A-Za-z\u0590-\u05FF\s'\-]+$/;

// Normalize Israeli phone: strip spaces/dashes/parens/+972 → 0XXXXXXXXX
const normalizePhone = (raw: string) => {
  let p = raw.replace(/[\s\-()]/g, '');
  if (p.startsWith('+972')) p = '0' + p.slice(4);
  else if (p.startsWith('972')) p = '0' + p.slice(3);
  return p;
};
// Valid Israeli mobile (05X-XXXXXXX) or landline (0X-XXXXXXX), 9–10 digits total
const PHONE_RE = /^0(5\d{8}|[2-489]\d{7,8})$/;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'שם קצר מדי — נא להזין שם מלא')
    .max(60, 'שם ארוך מדי (עד 60 תווים)')
    .regex(NAME_RE, 'השם יכול להכיל רק אותיות, רווחים ומקפים')
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, {
      message: 'נא להזין שם פרטי ושם משפחה',
    }),
  email: z
    .string()
    .trim()
    .min(1, 'נא להזין כתובת מייל')
    .max(255, 'כתובת מייל ארוכה מדי')
    .regex(EMAIL_RE, 'כתובת מייל לא תקינה (לדוגמה: name@example.com)'),
  phone: z
    .string()
    .trim()
    .min(1, 'נא להזין מספר טלפון')
    .transform(normalizePhone)
    .refine((v) => PHONE_RE.test(v), {
      message: 'מספר טלפון ישראלי לא תקין (לדוגמה: 050-1234567)',
    }),
  notes: z.string().trim().max(1000, 'הערות ארוכות מדי (עד 1000 תווים)').optional(),
});

interface MeetingBookingModalProps {
  open: boolean;
  onClose: () => void;
}

const MeetingBookingModal = ({ open, onClose }: MeetingBookingModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const reset = () => {
    setName(''); setEmail(''); setPhone(''); setNotes('');
    setDate(undefined); setTime(''); setErrors({}); setStatus('idle');
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  // Esc to close, focus trap, restore focus
  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    // Focus close button when modal opens
    const focusTimer = setTimeout(() => closeBtnRef.current?.focus(), 50);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      lastFocusedRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  const validateField = (field: 'name' | 'email' | 'phone', value: string) => {
    const fieldSchema = (schema.shape as any)[field];
    const r = fieldSchema.safeParse(value);
    setErrors((p) => ({ ...p, [field]: r.success ? '' : r.error.issues[0].message }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    const parsed = schema.safeParse({ name, email, phone, notes: notes || undefined });
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => {
        const key = i.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
    }
    if (!date) fieldErrors.date = 'נא לבחור תאריך';
    if (!time) fieldErrors.time = 'נא לבחור שעה';
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus('sending');
    try {
      const clean = parsed.data!;
      const { error } = await supabase.from('meeting_bookings').insert({
        name: clean.name,
        email: clean.email.toLowerCase(),
        phone: clean.phone, // already normalized
        meeting_date: format(date!, 'yyyy-MM-dd'),
        meeting_time: time,
        notes: clean.notes || null,
      });
      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error('Meeting booking error:', err);
      setStatus('idle');
      setErrors({ submit: 'אירעה שגיאה. נסו שוב.' });
    }
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            ref={dialogRef}
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="meeting-modal-title"
            aria-describedby="meeting-modal-desc"
            tabIndex={-1}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-[var(--shadow-elevated)] focus:outline-none"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-7 pt-7 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent" aria-hidden="true">
                  <CalendarCheck size={20} />
                </div>
                <h3 id="meeting-modal-title" className="text-xl font-bold font-serif">תיאום פגישה עם יועץ תעסוקתי</h3>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                aria-label="סגור חלון תיאום פגישה"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="px-7 text-sm text-muted-foreground mb-5">
              בחרו מועד נוח ומלאו פרטים — יועץ תעסוקתי המתמחה בתעסוקה אקטיבית אחרי פרישה יחזור אליכם לאישור.
            </p>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-12 px-7 text-center"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 font-serif">הבקשה נשלחה!</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    קיבלנו את הבקשה לפגישה ב־{date && format(date, 'EEEE, d בMMMM', { locale: he })} בשעה {time}.
                    היועץ יחזור אליכם לאישור בהקדם.
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
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">תאריך מועדף</label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-background text-foreground text-sm text-right transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30',
                            errors.date ? 'border-destructive' : 'border-border',
                          )}
                        >
                          <CalendarIcon size={18} className="text-muted-foreground" />
                          <span className={date ? '' : 'text-muted-foreground'}>
                            {date ? format(date, 'EEEE, d בMMMM yyyy', { locale: he }) : 'בחרו תאריך'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => { setDate(d); setCalendarOpen(false); if (errors.date) setErrors((p) => ({ ...p, date: '' })); }}
                          disabled={(d) => d < today || d.getDay() === 6}
                          initialFocus
                          locale={he}
                          className={cn('p-3 pointer-events-auto')}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
                  </div>

                  {/* Time slots */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">שעה מועדפת</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const selected = time === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => { setTime(slot); if (errors.time) setErrors((p) => ({ ...p, time: '' })); }}
                            className={cn(
                              'py-2 rounded-lg text-sm font-semibold border transition-all',
                              selected
                                ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                                : 'bg-background text-foreground border-border hover:border-accent/60 hover:bg-accent/5',
                            )}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {errors.time && <p className="text-xs text-destructive mt-1">{errors.time}</p>}
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="mb-name" className="block text-sm font-semibold mb-1.5">
                      שם מלא <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="mb-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                      }}
                      onBlur={(e) => validateField('name', e.target.value)}
                      autoComplete="name"
                      maxLength={60}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'mb-name-err' : undefined}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                        errors.name ? 'border-destructive' : 'border-border',
                      )}
                      placeholder="ישראל ישראלי"
                      disabled={status === 'sending'}
                    />
                    {errors.name && <p id="mb-name-err" className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="mb-phone" className="block text-sm font-semibold mb-1.5">
                      טלפון <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="mb-phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                      }}
                      onBlur={(e) => validateField('phone', e.target.value)}
                      autoComplete="tel"
                      maxLength={20}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'mb-phone-err' : 'mb-phone-hint'}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                        errors.phone ? 'border-destructive' : 'border-border',
                      )}
                      placeholder="050-1234567"
                      dir="ltr"
                      disabled={status === 'sending'}
                    />
                    {errors.phone ? (
                      <p id="mb-phone-err" className="text-xs text-destructive mt-1">{errors.phone}</p>
                    ) : (
                      <p id="mb-phone-hint" className="text-xs text-muted-foreground mt-1">
                        מספר ישראלי, נייד או קווי
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="mb-email" className="block text-sm font-semibold mb-1.5">
                      כתובת מייל <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="mb-email"
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                      }}
                      onBlur={(e) => validateField('email', e.target.value)}
                      autoComplete="email"
                      maxLength={255}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'mb-email-err' : undefined}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                        errors.email ? 'border-destructive' : 'border-border',
                      )}
                      placeholder="example@email.com"
                      dir="ltr"
                      disabled={status === 'sending'}
                    />
                    {errors.email && <p id="mb-email-err" className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>


                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      הערות <span className="text-muted-foreground font-normal">(אופציונלי)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="נושאים שתרצו לדבר עליהם, העדפות נוספות..."
                      disabled={status === 'sending'}
                    />
                  </div>

                  {errors.submit && (
                    <p className="text-sm text-destructive text-center">{errors.submit}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-all duration-300 shadow-sm disabled:opacity-70"
                  >
                    {status === 'sending' ? (
                      <><Loader2 size={18} className="animate-spin" /> שולח...</>
                    ) : (
                      <><CalendarCheck size={18} /> אישור תיאום פגישה</>
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

export default MeetingBookingModal;
