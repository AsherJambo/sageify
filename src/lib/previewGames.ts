// Unified playful "game language" for all questionnaire previews.
// Keep this single source of truth so every screen speaks the same vibe.

export interface PreviewGame {
  id: string;
  path: string;
  emoji: string;
  /** Short product name */
  title: string;
  /** The "game style" — one line, playful */
  style: string;
  /** Game tagline shown on hub */
  tagline: string;
  /** Intro screen tagline — "what we're going to play" */
  pitch: string;
  /** 3 short rule chips shown on intro */
  rules: string[];
  /** Minutes badge */
  minutes: string;
  /** Tailwind gradient classes for card tint */
  tone: string;
  /** Accent color token used on intro CTA & badge */
  accent: 'sky' | 'sunny' | 'secondary' | 'success' | 'coral' | 'primary';
  /** Done-screen line */
  doneLine: string;
}

export const PREVIEW_GAMES: PreviewGame[] = [
  {
    id: 'holland',
    path: '/preview/holland',
    emoji: '🧭',
    title: 'Holland',
    style: 'מצפן תחומי עניין',
    tagline: 'שאלון מעורבב — בלי כותרות, רק תחושה',
    pitch: 'נכוון את המצפן הפנימי שלך — שאלה אחר שאלה, בלי קופסאות.',
    rules: ['ענה לפי תחושה ראשונה', 'אין תשובה נכונה', 'הקטגוריות מוסתרות בכוונה'],
    minutes: '5 דק׳',
    tone: 'from-sky/15 to-sky/5',
    accent: 'sky',
    doneLine: 'המצפן כויל. הכיוונים שלך מתחילים להתבהר.',
  },
  {
    id: 'via',
    path: '/preview/via',
    emoji: '✨',
    title: 'VIA',
    style: 'מסע חוזקות אופי',
    tagline: 'מצא את ה־5 חוזקות שמדליקות אותך',
    pitch: 'נצוד יחד את חוזקות האופי שמהווות את הכוח־על האישי שלך.',
    rules: ['דרג כל חוזקה', 'התשובה הראשונה הכי מדויקת', 'בסוף — 5 חוזקות־על שלך'],
    minutes: '7 דק׳',
    tone: 'from-sunny/15 to-sunny/5',
    accent: 'sunny',
    doneLine: 'חמש החוזקות שלך זוהו וזורחות.',
  },
  {
    id: 'schein',
    path: '/preview/schein',
    emoji: '⚓',
    title: 'Schein',
    style: 'מסע לעוגנים תעסוקתיים',
    tagline: 'שאלה אחת בכל פעם — Linear Journey',
    pitch: 'מסע נינוח לאורך 8 עוגנים — מה באמת מעגן אותך בעבודה?',
    rules: ['שאלה אחת בכל מסך', 'דרג עד כמה זה אתה', 'הדירוג שומר את עצמו'],
    minutes: '6 דק׳',
    tone: 'from-secondary/15 to-secondary/5',
    accent: 'secondary',
    doneLine: 'העוגנים נמצאו — הם מה שמחזיק אותך יציב.',
  },
  {
    id: 'motivation',
    path: '/preview/motivation',
    emoji: '🌱',
    title: 'Motivation',
    style: 'Mixer Garden — צנצנות וזרעים',
    tagline: 'נמלא את הצנצנות שמגדירות את הפרק הבא',
    pitch: 'גינה אישית: לכל מוטיבציה צנצנת, לכל זרע משמעות.',
    rules: ['גרור זרעים לצנצנות', 'הקצה לפי חשיבות', 'הגינה פורחת איתך'],
    minutes: '4 דק׳',
    tone: 'from-success/15 to-success/5',
    accent: 'success',
    doneLine: 'הצנצנות מלאות. הגינה שלך פורחת.',
  },
  {
    id: 'thinking',
    path: '/preview/thinking',
    emoji: '🧩',
    title: 'Thinking',
    style: 'כרטיסים מתפצחים — מטריצות',
    tagline: 'פצח דפוסים — כרטיס אחר כרטיס',
    pitch: 'אתגר חשיבה משחקי: כל כרטיס הוא חידה קטנה שמחכה להיפתח.',
    rules: ['בחר את התשובה הנכונה', 'הכרטיס מתפצח על המסך', 'בלי לחץ זמן'],
    minutes: '6 דק׳',
    tone: 'from-coral/15 to-coral/5',
    accent: 'coral',
    doneLine: 'הכרטיסים פוצחו — חוזקות החשיבה התגלו.',
  },
  {
    id: 'skills',
    path: '/preview/skills',
    emoji: '🏆',
    title: 'Skills',
    style: 'ארבע עמודות גרירה',
    tagline: 'מיין כישורים: זוכים · שורפים · שואפים · לא רלוונטי',
    pitch: 'ארגז כלים אישי: נמיין יחד מה זוכה, מה שורף, ולמה תשאף.',
    rules: ['גרור כישורים לעמודות', 'שים 5–7 כישורים בזוכים', 'אפשר לשנות בכל רגע'],
    minutes: '5 דק׳',
    tone: 'from-success/15 to-success/5',
    accent: 'success',
    doneLine: 'ארגז הכלים מסודר — הזוכים זורחים למעלה.',
  },
  {
    id: 'considerations',
    path: '/preview/considerations',
    emoji: '⚖',
    title: 'Considerations',
    style: 'ענן תגיות אינטראקטיבי',
    tagline: 'בחר ושקלל — 100 נקודות, ענן אחד',
    pitch: 'איזה שיקול שווה לך יותר? נחלק 100 נקודות בין מה שחשוב באמת.',
    rules: ['בחר עד 6 שיקולים', 'חלק 100 נקודות בסליידרים', 'הענן מתעצב סביבך'],
    minutes: '4 דק׳',
    tone: 'from-primary/15 to-primary/5',
    accent: 'primary',
    doneLine: '100 הנקודות חולקו — סדר העדיפויות שלך ברור.',
  },
  {
    id: 'preferences',
    path: '/preview/preferences',
    emoji: '🌊',
    title: 'Preferences',
    style: 'סליידרים זורמים + שאלות פתוחות',
    tagline: 'הזרם האישי שלך — בין קצוות, ערכים וחלום',
    pitch: 'מפגש זורם של סליידרים, ערכים, וחלום־מגירה אחד שלך.',
    rules: ['הזז סליידרים בין קצוות', 'בחר 2–3 ערכי ליבה', 'ספר את חלום־המגירה'],
    minutes: '6 דק׳',
    tone: 'from-sky/15 to-sky/5',
    accent: 'sky',
    doneLine: 'הזרם נלכד — מסליידרים ועד חלום־המגירה.',
  },
];

export const getGame = (id: string) =>
  PREVIEW_GAMES.find((g) => g.id === id) ?? PREVIEW_GAMES[0];

export const getNextGame = (id: string) => {
  const i = PREVIEW_GAMES.findIndex((g) => g.id === id);
  if (i < 0 || i === PREVIEW_GAMES.length - 1) return null;
  return PREVIEW_GAMES[i + 1];
};
