import { useState, useEffect } from 'react';
import { cloudClient } from '@/lib/cloudClient';
import { Mail, Clock, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface Props {
  adminPassword: string;
}

const AdminContactSubmissions = ({ adminPassword }: Props) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await cloudClient.functions.invoke('admin', {
        headers: { 'x-admin-password': adminPassword },
        body: { action: 'list-contact-submissions' },
      });
      if (error) throw error;
      setSubmissions((data?.submissions || []) as Submission[]);
    } catch {
      toast({ title: 'שגיאה בטעינת הפניות', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">פניות יצירת קשר</h2>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ml-1 ${loading ? 'animate-spin' : ''}`} />
          רענון
        </Button>
      </div>

      {submissions.length === 0 && !loading && (
        <p className="text-muted-foreground text-sm text-center py-8">אין פניות עדיין</p>
      )}

      <div className="space-y-3">
        {submissions.map((s) => (
          <div key={s.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-sm">{s.name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(s.created_at).toLocaleDateString('he-IL')} {new Date(s.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${s.email}`} className="hover:underline">{s.email}</a>
            </div>
            <p className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">{s.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminContactSubmissions;
