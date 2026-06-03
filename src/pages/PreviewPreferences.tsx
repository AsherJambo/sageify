import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferencesFlowingSliders from '@/components/PreferencesFlowingSliders';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';

const PreviewPreferences = () => {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  if (done) return <PreviewDoneScreen title="ההעדפות נשמרו" emoji="🌊" summary="הזרם האישי שלך נלכד — מסליידרים ועד חלום המגירה." />;
  return <PreferencesFlowingSliders onComplete={() => setDone(true)} onBackToHub={() => navigate('/preview')} />;
};

export default PreviewPreferences;
