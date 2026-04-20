import confetti from 'canvas-confetti';

// Brand color palette (sage, coral, sunny, sky, success) as HEX for canvas
const BRAND_COLORS = ['#8FA282', '#E87B5C', '#E9B842', '#5BB0D9', '#3FAA63'];

/** Small celebratory burst — for completing a single questionnaire section */
export const burstConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: BRAND_COLORS,
    scalar: 0.9,
    ticks: 180,
  });
};

/** Big celebration — completing all questionnaires / reaching results */
export const celebrationConfetti = () => {
  const duration = 1400;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.8 },
      colors: BRAND_COLORS,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.8 },
      colors: BRAND_COLORS,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

/** Tiny sparkle — for milestones inside a questionnaire (e.g. half-way) */
export const sparkleConfetti = () => {
  confetti({
    particleCount: 25,
    spread: 50,
    startVelocity: 22,
    origin: { y: 0.6 },
    colors: BRAND_COLORS,
    scalar: 0.7,
    ticks: 120,
  });
};
