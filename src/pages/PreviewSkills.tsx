import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillsDragColumns from '@/components/SkillsDragColumns';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';

const PreviewSkills = () => {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  if (done) return <PreviewDoneScreen title="הכישורים מוינו" emoji="🏆" summary="ארגז הכלים שלך מוכן." />;
  return <SkillsDragColumns onComplete={() => setDone(true)} onBackToHub={() => navigate('/preview')} />;
};

export default PreviewSkills;
