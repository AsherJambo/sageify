import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsiderationsTagCloud from '@/components/ConsiderationsTagCloud';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';

const PreviewConsiderations = () => {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  if (done) return <PreviewDoneScreen title="ענן השיקולים נשקל" emoji="⚖" summary="100 הנקודות חולקו לפי החשיבות שלך." />;
  return <ConsiderationsTagCloud onComplete={() => setDone(true)} onBackToHub={() => navigate('/preview')} />;
};

export default PreviewConsiderations;
