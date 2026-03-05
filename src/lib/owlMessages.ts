// Sageify encouragement messages — professional yet warm for senior professionals

export const sageEmojis = ['🌿', '🪶', '✨', '💫', '🌟'];

/** Progress milestone messages for VIA questionnaire */
export function getVIAEncouragement(answered: number, total: number): string | null {
  const pct = Math.round((answered / total) * 100);
  if (answered === 1) return '🌿 מתחילים! סגי כבר רושם הערות...';
  if (pct === 25) return '🪶 רבע מהדרך מאחוריכם – החוכמה כבר מתגבשת';
  if (pct === 50) return '🌿 חצי מהמסע עבר! סגי מרגיש שמתחילים להתגלות דברים מרתקים';
  if (pct === 75) return '✨ כמעט שם – עוד קצת והתמונה המלאה תיחשף';
  if (answered === total) return '🌟 מדהים! סיימתם את החלק הראשון. סגי מתרשם!';
  return null;
}

/** Progress milestone messages for Schein questionnaire */
export function getScheinEncouragement(answered: number, total: number): string | null {
  const pct = Math.round((answered / total) * 100);
  if (answered === 1) return '🧭 יוצאים למסע גילוי העוגנים התעסוקתיים...';
  if (pct === 25) return '🌿 סגי מזהה כיוונים ראשוניים – המשיכו!';
  if (pct === 50) return '🪶 חצי מהדרך! תובנות מעניינות מתחילות להצטייר';
  if (pct === 75) return '✨ כמעט סיימתם – הפרופיל שלכם מקבל צורה';
  if (answered === total) return '🌟 נפלא! סגי מוכן לחשוף את התובנות שלכם';
  return null;
}

/** Random wisdom tips shown between pages */
export const owlWisdomTips = [
  '💡 טיפ מסגי: אין תשובות נכונות או לא נכונות – רק מה שנכון עבורכם',
  '🌿 סגי מזכיר: קחו את הזמן, אין צורך למהר',
  '🪶 חוכמת סגי: הכירו בערך הניסיון שצברתם לאורך השנים',
  '✨ סגי לוחש: התשובה הראשונה שעולה לכם היא בדרך כלל הכי מדויקת',
  '💫 תזכרו: החוכמה שלכם היא המצפן הכי טוב',
];

export function getRandomWisdomTip(): string {
  return owlWisdomTips[Math.floor(Math.random() * owlWisdomTips.length)];
}

/** Results celebration messages */
export const owlCelebrations = {
  profileReady: '🌿 סגי סיים לנתח – הנה הפרופיל הייחודי שלכם!',
  topStrength: '🌟 זו החוזקה שמגדירה אתכם – היא הכוח העל שלכם',
  topAnchor: '🧭 העוגן שמנחה אתכם – כאן טמון מה שחשוב לכם באמת',
  narrative: '🪶 סגי מסכם: ',
};

/** Welcome screen speech */
export const owlWelcome = {
  greeting: 'שלום! אני סגי, היועץ של Sageify',
  intro: 'הגעתם למקום הנכון. עם הניסיון והחוכמה שצברתם, הגיע הזמן לגלות מה באמת מניע אתכם – ולמצוא את הפרק הבא שמתאים בדיוק לכם.',
  cta: 'מוכנים? בואו נצא לדרך יחד',
};
