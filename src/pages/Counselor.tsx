import { useState, useEffect, useMemo } from 'react';
import { cloudClient } from '@/lib/cloudClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Phone, Mail, FileText, RefreshCw, Search, Download, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import owlLogo from '@/assets/owl-logo.png';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  meeting_date: string;
  meeting_time: string;
  notes: string | null;
  created_at: string;
}

const PASSWORD = 'MEGO';
const SESSION_KEY = 'counselor_auth';

const Counselor = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'today'>('upcoming');

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password.trim().toUpperCase() === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthenticated(true);
    } else {
      toast.error('סיסמה שגויה');
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await cloudClient.functions.invoke('admin', {
        headers: { 'x-admin-password': PASSWORD },
        body: { action: 'list-meeting-bookings' },
      });
      if (error) throw error;
      setBookings((data?.bookings || []) as Booking[]);
    } catch {
      toast.error('שגיאה בטעינת הפגישות');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) load();
  }, [authenticated]);

  const filteredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return bookings.filter(b => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit = b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.phone.includes(q);
        if (!hit) return false;
      }
      // Filter
      if (filter === 'today') return b.meeting_date === todayStr;
      if (filter === 'upcoming') return b.meeting_date >= todayStr;
      if (filter === 'past') return b.meeting_date < todayStr;
      return true;
    });
  }, [bookings, search, filter]);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      total: bookings.length,
      today: bookings.filter(b => b.meeting_date === todayStr).length,
      upcoming: bookings.filter(b => b.meeting_date >= todayStr).length,
    };
  }, [bookings]);

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק את הפגישה?')) return;
    try {
      const { error } = await cloudClient.functions.invoke('admin', {
        headers: { 'x-admin-password': PASSWORD },
        body: { action: 'delete-meeting-booking', bookingId: id },
      });
      if (error) throw error;
      toast.success('הפגישה נמחקה');
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  const exportCSV = () => {
    const headers = ['שם', 'אימייל', 'טלפון', 'תאריך', 'שעה', 'הערות', 'נוצר'];
    const rows = filteredBookings.map(b => [
      b.name, b.email, b.phone, b.meeting_date, b.meeting_time,
      b.notes || '', new Date(b.created_at).toLocaleString('he-IL')
    ]);
    const csv = [headers, ...rows].map(r =>
      r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `פגישות-יועץ-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isPast = (date: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return date < todayStr;
  };

  const isToday = (date: string) => date === new Date().toISOString().split('T')[0];

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative" dir="rtl">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-sage/25 blur-3xl" />
        </div>
        <Card className="w-full max-w-md p-8 space-y-6 bg-card border-2 border-foreground/10"
          style={{ boxShadow: '0 8px 0 0 hsl(var(--foreground) / 0.10)' }}>
          <div className="text-center space-y-2">
            <img src={owlLogo} alt="Sageify" className="w-20 h-20 mx-auto" />
            <h1 className="text-3xl font-serif">דשבורד יועץ תעסוקתי</h1>
            <p className="text-base text-muted-foreground">ניהול פגישות עם משתמשים</p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="סיסמת גישה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="text-center text-lg"
              style={{ minHeight: 56 }}
            />
            <button
              onClick={handleLogin}
              className="w-full px-8 py-4 bg-destructive text-destructive-foreground rounded-2xl text-lg font-bold border-2 border-foreground/15 transition-all hover:-translate-y-0.5 active:translate-y-1"
              style={{ minHeight: 56, boxShadow: '0 5px 0 0 hsl(var(--foreground) / 0.85)' }}
            >
              כניסה
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 relative" dir="rtl">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-sage/20 blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={owlLogo} alt="Sageify" className="w-14 h-14" />
            <div>
              <h1 className="text-3xl md:text-4xl font-serif">דשבורד יועץ תעסוקתי</h1>
              <p className="text-base text-muted-foreground">פגישות מתוזמנות</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ml-1 ${loading ? 'animate-spin' : ''}`} />
              רענון
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={!filteredBookings.length}>
              <Download className="w-4 h-4 ml-1" />
              ייצוא CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">סה״כ פגישות</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4 text-center bg-primary/5 border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">היום</p>
            <p className="text-2xl font-bold text-primary">{stats.today}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">עתידיות</p>
            <p className="text-2xl font-bold">{stats.upcoming}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם, אימייל או טלפון..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          <Select value={filter} onValueChange={(v: typeof filter) => setFilter(v)}>
            <SelectTrigger className="md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">עתידיות</SelectItem>
              <SelectItem value="today">היום</SelectItem>
              <SelectItem value="past">עברו</SelectItem>
              <SelectItem value="all">הכל</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {loading && (
          <div className="text-center py-12 text-muted-foreground">טוען פגישות...</div>
        )}

        {!loading && filteredBookings.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">אין פגישות להצגה</p>
          </Card>
        )}

        <div className="space-y-3">
          {filteredBookings.map(b => {
            const past = isPast(b.meeting_date);
            const today = isToday(b.meeting_date);
            return (
              <Card
                key={b.id}
                className={`p-4 md:p-5 transition-all hover:shadow-md ${
                  today ? 'border-primary/40 bg-primary/5' : past ? 'opacity-70' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Right side - main info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">{b.name}</h3>
                      {today && <Badge className="bg-primary">היום</Badge>}
                      {past && <Badge variant="secondary">עברה</Badge>}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{formatDate(b.meeting_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-primary">{b.meeting_time}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 hover:text-foreground" dir="ltr">
                        <Phone className="w-4 h-4" />
                        {b.phone}
                      </a>
                      <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                        <Mail className="w-4 h-4" />
                        {b.email}
                      </a>
                    </div>

                    {b.notes && (
                      <div className="bg-muted/50 rounded-lg p-3 text-sm flex gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="whitespace-pre-wrap">{b.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Left side - actions */}
                  <div className="flex md:flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://wa.me/${b.phone.replace(/^0/, '972')}`, '_blank')}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(b.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Counselor;
