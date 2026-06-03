import MotivationMixer from '@/components/MotivationMixer';

const PreviewMotivation = () => {
  return (
    <MotivationMixer
      onComplete={(m, i) => {
        // eslint-disable-next-line no-console
        console.log('Motivation preview complete', { motivation: m, intentions: i });
      }}
      onBackToHub={() => window.history.back()}
    />
  );
};

export default PreviewMotivation;
