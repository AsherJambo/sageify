import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cloudClient } from '@/lib/cloudClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Copy, Plus, Trash2, Upload, X, Image } from 'lucide-react';

interface Org {
  id: string;
  org_name: string;
  logo_url: string | null;
  admin_email: string;
  admin_password: string;
  custom_welcome_message: string;
  created_at: string;
}

const AdminOrganizations = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoMode, setLogoMode] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newOrg, setNewOrg] = useState({
    org_name: '',
    admin_email: '',
    admin_password: '',
    logo_url: '',
    custom_welcome_message: '',
  });

  const loadOrgs = async () => {
    setLoading(true);
    const { data } = await cloudClient.from('organizations').select('*').order('created_at', { ascending: false });
    if (data) setOrgs(data as unknown as Org[]);
    setLoading(false);
  };

  useEffect(() => { loadOrgs(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('יש לבחור קובץ תמונה בלבד');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('גודל הקובץ חייב להיות עד 2MB');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadLogo = async (orgId: string): Promise<string | null> => {
    if (!logoFile) return newOrg.logo_url.trim() || null;
    
    setUploading(true);
    const ext = logoFile.name.split('.').pop() || 'png';
    const filePath = `${orgId}.${ext}`;

    const { error } = await supabase.storage
      .from('org-logos')
      .upload(filePath, logoFile, { upsert: true });

    setUploading(false);

    if (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הלוגו');
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('org-logos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const createOrg = async () => {
    if (!newOrg.org_name.trim() || !newOrg.admin_email.trim() || !newOrg.admin_password.trim()) {
      toast.error('שם, אימייל וסיסמה הם שדות חובה');
      return;
    }

    // First create org without logo to get the ID
    const { data: inserted, error } = await cloudClient.from('organizations').insert({
      org_name: newOrg.org_name.trim(),
      admin_email: newOrg.admin_email.trim(),
      admin_password: newOrg.admin_password.trim(),
      logo_url: logoMode === 'url' ? (newOrg.logo_url.trim() || null) : null,
      custom_welcome_message: newOrg.custom_welcome_message.trim(),
    }).select('id').single();

    if (error || !inserted) {
      toast.error('שגיאה ביצירת ארגון');
      return;
    }

    // If file mode, upload and update
    if (logoMode === 'file' && logoFile) {
      const logoUrl = await uploadLogo((inserted as any).id);
      if (logoUrl) {
        await cloudClient.from('organizations').update({ logo_url: logoUrl }).eq('id', (inserted as any).id);
      }
    }

    toast.success('ארגון נוצר בהצלחה!');
    setNewOrg({ org_name: '', admin_email: '', admin_password: '', logo_url: '', custom_welcome_message: '' });
    clearFile();
    setShowCreate(false);
    loadOrgs();
  };

  const deleteOrg = async (id: string) => {
    if (!confirm('למחוק את הארגון? פעולה זו לא ניתנת לביטול.')) return;
    const { error } = await cloudClient.from('organizations').delete().eq('id', id);
    if (error) toast.error('שגיאה במחיקה');
    else {
      toast.success('הארגון נמחק');
      loadOrgs();
    }
  };

  const copyEmployerLink = (orgId: string) => {
    const origin = window.location.origin.includes('preview')
      ? 'https://sageify.lovable.app'
      : window.location.origin;
    navigator.clipboard.writeText(`${origin}/#/employer-admin`);
    toast.success('קישור פורטל מעסיק הועתק!');
  };

  const copyPartnerPrefix = (orgId: string) => {
    const origin = window.location.origin.includes('preview')
      ? 'https://sageify.lovable.app'
      : window.location.origin;
    navigator.clipboard.writeText(`${origin}/#/partner/${orgId}/q/`);
    toast.success('קידומת קישור שותף הועתקה! הוסיפו Token בסוף.');
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">טוען ארגונים...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            ניהול ארגונים (B2B)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">צרו ונהלו ארגונים שותפים עם פורטלים ייעודיים</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="w-4 h-4" />
          ארגון חדש
        </Button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">יצירת ארגון חדש</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">שם הארגון *</label>
              <Input placeholder="חברה בע&quot;מ" value={newOrg.org_name} onChange={e => setNewOrg(p => ({ ...p, org_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">אימייל מנהל HR *</label>
              <Input type="email" placeholder="hr@company.com" value={newOrg.admin_email} onChange={e => setNewOrg(p => ({ ...p, admin_email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">סיסמת כניסה לפורטל *</label>
              <Input placeholder="סיסמה לפורטל מעסיק" value={newOrg.admin_password} onChange={e => setNewOrg(p => ({ ...p, admin_password: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">לוגו</label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  size="sm"
                  variant={logoMode === 'file' ? 'default' : 'outline'}
                  onClick={() => setLogoMode('file')}
                  className="gap-1 text-xs"
                >
                  <Upload className="w-3 h-3" />
                  העלאת קובץ
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={logoMode === 'url' ? 'default' : 'outline'}
                  onClick={() => setLogoMode('url')}
                  className="gap-1 text-xs"
                >
                  <Image className="w-3 h-3" />
                  קישור URL
                </Button>
              </div>

              {logoMode === 'url' ? (
                <Input placeholder="https://..." value={newOrg.logo_url} onChange={e => setNewOrg(p => ({ ...p, logo_url: e.target.value }))} />
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {logoPreview ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <img src={logoPreview} alt="תצוגה מקדימה" className="w-12 h-12 rounded object-contain bg-background" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{logoFile?.name}</p>
                        <p className="text-xs text-muted-foreground">{logoFile ? (logoFile.size / 1024).toFixed(0) + ' KB' : ''}</p>
                      </div>
                      <Button type="button" size="sm" variant="ghost" onClick={clearFile}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">לחצו לבחירת לוגו (עד 2MB)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">הודעת ברוכים הבאים מותאמת</label>
            <Input placeholder="ברוכים הבאים, עובדי [שם הארגון]. בואו נגלה יחד את הפרק הבא שלכם." value={newOrg.custom_welcome_message} onChange={e => setNewOrg(p => ({ ...p, custom_welcome_message: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <Button onClick={createOrg} disabled={uploading}>
              {uploading ? 'מעלה לוגו...' : 'צור ארגון'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>ביטול</Button>
          </div>
        </div>
      )}

      {/* Organizations list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right font-semibold">ארגון</th>
              <th className="p-3 text-right font-semibold">אימייל מנהל</th>
              <th className="p-3 text-right font-semibold">סיסמה</th>
              <th className="p-3 text-right font-semibold">נוצר</th>
              <th className="p-3 text-right font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map(org => (
              <tr key={org.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    {org.logo_url && <img src={org.logo_url} alt="" className="w-6 h-6 rounded object-contain" />}
                    {org.org_name}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{org.admin_email}</td>
                <td className="p-3 text-muted-foreground font-mono text-xs">{org.admin_password}</td>
                <td className="p-3 text-muted-foreground">{new Date(org.created_at).toLocaleDateString('he-IL')}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => copyEmployerLink(org.id)} title="העתק קישור פורטל">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => copyPartnerPrefix(org.id)} title="העתק קידומת שותף">
                      🔗
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteOrg(org.id)} className="text-destructive" title="מחק">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">אין ארגונים עדיין. צרו את הראשון!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrganizations;
