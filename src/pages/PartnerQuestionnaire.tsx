import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { cloudClient } from '@/lib/cloudClient';
import QuestionnaireByToken from './QuestionnaireByToken';

/**
 * Wrapper for partner-branded questionnaire flow.
 * URL: /partner/:partnerId/q/:token
 * Loads org branding and passes it down via context.
 */
const PartnerQuestionnaire = () => {
  const { partnerId, token } = useParams<{ partnerId: string; token: string }>();
  const [org, setOrg] = useState<{ org_name: string; logo_url: string | null; custom_welcome_message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) { setLoading(false); return; }

    (async () => {
      const { data } = await cloudClient
        .from('organizations')
        .select('org_name, logo_url, custom_welcome_message')
        .eq('id', partnerId)
        .single();
      if (data) setOrg(data as unknown as typeof org);
      setLoading(false);
    })();
  }, [partnerId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  // Pass org branding through URL state - QuestionnaireByToken will pick it up
  return <QuestionnaireByToken partnerOrg={org || undefined} />;
};

export default PartnerQuestionnaire;
