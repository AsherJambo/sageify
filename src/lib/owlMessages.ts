// Sageify encouragement messages — warm, empathetic "Sagei" persona for senior professionals

export const sageEmojis = ['🌿', '🪶', '✨', '💫', '🌟'];

/** Progress milestone messages for VIA questionnaire */
export function getVIAEncouragement(answered: number, total: number): string | null {
  const pct = Math.round((answered / total) * 100);
  if (answered === 1) return '🌿 מתחילים יחד! סגי כבר רושם הערות...';
  if (pct === 25) return '🪶 רבע מהדרך מאחוריכם – סגי מזהה חוזקות מרתקות';
  if (pct === 50) return '🌿 חצי מהשיחה עברה! מתחילים להתגלות דברים מרתקים';
  if (pct === 75) return '✨ כמעט שם – עוד קצת והתמונה המלאה תיחשף';
  if (answered === total) return '🌟 מדהים! סיימתם את השאלון. סגי מתרשם מאד!';
  return null;
}

/** Progress milestone messages for Schein questionnaire */
export function getScheinEncouragement(answered: number, total: number): string | null {
  const pct = Math.round((answered / total) * 100);
  if (answered === 1) return '🧭 יוצאים לגלות מה באמת חשוב לכם בעיסוק...';
  if (pct === 25) return '🌿 סגי מזהה כיוונים ראשוניים – ממשיכים יחד!';
  if (pct === 50) return '🪶 חצי מהדרך! רקע מרשים כמו שלכם ראוי לניתוח מעמיק';
  if (pct === 75) return '✨ כמעט סיימתם – הפרופיל שלכם מקבל צורה יפה';
  if (answered === total) return '🌟 נפלא! סגי מוכן לשתף את מה שגילה';
  return null;
}

/** Random wisdom tips shown between pages */
export const owlWisdomTips = [
  '💡 סגי מזכיר: אין תשובות נכונות או לא נכונות – רק מה שנכון עבורכם',
  '🌿 קחו את הזמן, בשיחה הזו אין צורך למהר',
  '🪶 הניסיון והחוכמה שצברתם לאורך השנים הם הנכס הגדול ביותר',
  '✨ התשובה הראשונה שעולה לכם היא בדרך כלל הכי מדויקת',
  '💫 כל תקופה בחיים הכינה אתכם לפרק הבא',
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

/** Welcome screen speech — warm Sagei persona */
export const owlWelcome = {
  greeting: 'שלום, אני סגי 🌿',
  intro: 'אני כאן כדי לעזור לכם לתרגם את שנות הניסיון והחוכמה שלכם לפרק הבא – המרגש ביותר. בואו נגלה יחד מה באמת מניע אתכם, ונמצא את הכיוון שמתאים בדיוק לכם.',
  cta: 'מוכנים? בואו נתחיל את השיחה',
};

/** Contextual feedback messages shown between steps */
export const contextualFeedback: Record<string, string> = {
  skills: '🌿 רקע מרשים! בואו נראה איך אפשר למנף את הניסיון הזה לכיוון חדש',
  schein: '✨ התשובות שלכם מגלות דפוסים מעניינים – ממשיכים לחקור',
  considerations: '🪶 הבחירות שלכם מספרות סיפור ברור – סגי כבר רואה כיוונים',
  holland: '💫 המיומנויות שלכם מצביעות על אפשרויות מרתקות',
  via: '🌟 החוזקות שלכם יוצאות דופן – ממש מתרגש לראות את התמונה המלאה',
  personality: '🌿 הפרופיל שלכם מתגבש יפה – עוד שלב אחרון וסגי מוכן לשתף',
};