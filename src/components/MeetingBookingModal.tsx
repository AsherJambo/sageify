import { useState } from 'react';
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

const schema = z.object({
  name: z.string().trim().min(2, 'נא להזין שם מלא').max(100),
  email: z.string().trim().email('כתובת מייל לא תקינה').max(255),
  phone: z
    .string()
    .trim()
    .min(9, 'נא להזין מספר טלפון תקין')
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, 'מספר טלפון לא תקין'),
  notes: z.string().trim().max(1000).optional(),
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

  const reset = () => {
    setName(''); setEmail(''); setPhone(''); setNotes('');
    setDate(undefined); setTime(''); setErrors({}); setStatus('idle');
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    const parsed = schema.safeParse({ name, email, phone, notes: notes || undefined });
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => { fieldErrors[i.path[0] as string] = i.message; });
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
      const { error } = await supabase.from('meeting_bookings').insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        meeting_date: format(date!, 'yyyy-MM-dd'),
        meeting_time: time,
        notes: notes.trim() || null,
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
            dir="rtl"
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-[var(--shadow-elevated)]"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-7 pt-7 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                  <CalendarCheck size={20} />
                </div>
                <h3 className="text-xl font-bold font-serif">תיאום פגישה עם יועץ תעסוקתי</h3>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                aria-label="סגור"
              >
                <X size={18} />
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
                    <label className="block text-sm font-semibold mb-1.5">שם מלא</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                        errors.name ? 'border-destructive' : 'border-border',
                      )}
                      placeholder="ישראל ישראלי"
                      disabled={status === 'sending'}
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">טלפון</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                        errors.phone ? 'border-destructive' : 'border-border',
                      )}
                      placeholder="050-1234567"
                      dir="ltr"
                      disabled={status === 'sending'}
                    />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">כתובת מייל</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                        errors.email ? 'border-destructive' : 'border-border',
                      )}
                      placeholder="example@email.com"
                      dir="ltr"
                      disabled={status === 'sending'}
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
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
