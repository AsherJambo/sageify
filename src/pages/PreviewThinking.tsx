import ThinkingCrackingCards from '@/components/ThinkingCrackingCards';

const PreviewThinking = () => (
  <ThinkingCrackingCards
    onComplete={(r) => console.log('Thinking preview complete', r)}
    onBackToHub={() => window.history.back()}
  />
);

export default PreviewThinking;
