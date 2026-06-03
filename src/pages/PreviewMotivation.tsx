import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MotivationMixer from '@/components/MotivationMixer';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';

const PreviewMotivation = () => {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  if (done) {
    return <PreviewDoneScreen title="מיקסר המוטיבציה הושלם" emoji="🌱" summary="הצנצנות מלאות והגינה שלך פרחה." />;
  }

  return (
    <MotivationMixer
      onComplete={() => setDone(true)}
      onBackToHub={() => navigate('/preview')}
    />
  );
};

export default PreviewMotivation;
