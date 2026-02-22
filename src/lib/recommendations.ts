// Personalized job & volunteering recommendations based on VIA + Schein profile

export interface Recommendation {
  title: string;
  description: string;
  type: 'job' | 'volunteer' | 'freelance';
  platform: string;
  platformUrl: string;
  icon: string;
}

type CategoryKey = string;

// Mapping of VIA+Schein combinations to tailored recommendations
const recommendationPool: Record<string, Recommendation[]> = {
  // אנושיות + שירות ומשימה
  'אנושיות|שירות ומשימה': [
    { title: 'מנטור לבני נוער בסיכון', description: 'שתפו את החוכמה והניסיון שלכם עם צעירים שזקוקים להכוונה ולדמות מבוגרת משמעותית', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🤝' },
    { title: 'יועץ קהילתי לגמלאים', description: 'סייעו לאנשים בגיל הזהב למצוא את דרכם לפעילות משמעותית ומספקת', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '💛' },
    { title: 'מרצה בנושא מנהיגות אנושית', description: 'העבירו סדנאות וקורסים מקוונים בנושאי אמפתיה, הקשבה ומנהיגות', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🎤' },
  ],
  // חוכמה + מומחיות מקצועית
  'חוכמה|מומחיות מקצועית': [
    { title: 'יועץ אסטרטגי בתעשייה', description: 'נצלו את הידע המקצועי העמוק שלכם כדי לייעץ לחברות וסטארטאפים', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '🧠' },
    { title: 'כותב תוכן מקצועי', description: 'כתבו מאמרים, ספרי הדרכה או בלוגים בתחום המומחיות שלכם', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '✍️' },
    { title: 'מתנדב בתוכנית חינוך למבוגרים', description: 'העבירו ידע מקצועי לקהילה דרך תוכניות השכלה לא פורמליות', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '📚' },
  ],
  // אומץ + אתגר
  'אומץ|אתגר': [
    { title: 'מנטור ליזמים מתחילים', description: 'עזרו ליזמים צעירים להתמודד עם אתגרי הצמיחה הראשונים', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '🚀' },
    { title: 'מנהל פרויקטים פרילנסר', description: 'נהלו פרויקטים מורכבים עבור חברות שמחפשות ניסיון וביטחון', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '⚡' },
    { title: 'מאמן אישי לפיתוח חוסן', description: 'לוו אנשים בתהליכי שינוי והתמודדות עם אתגרים', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '💪' },
  ],
  // צדק + ניהול כללי
  'צדק|ניהול כללי': [
    { title: 'חבר דירקטוריון בעמותה', description: 'השפיעו על קבלת החלטות בארגונים חברתיים שפועלים למען צדק', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '⚖️' },
    { title: 'יועץ ממשל תאגידי', description: 'סייעו לחברות לבנות מבנה ניהולי הוגן ושקוף', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '🏛️' },
    { title: 'מנחה קבוצות דיאלוג קהילתי', description: 'הובילו שיח בין קבוצות מגוונות בקהילה שלכם', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🌍' },
  ],
  // אושר והתעלות + אורח חיים
  'אושר והתעלות|אורח חיים': [
    { title: 'מנחה סדנאות מיינדפולנס', description: 'שתפו את החוכמה הרוחנית שלכם דרך הנחיית קבוצות מדיטציה ומודעות', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🧘' },
    { title: 'מתנדב בבית אבות', description: 'הביאו שמחה ותחושת משמעות לקשישים דרך פעילויות תרבות ושיח', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🌸' },
    { title: 'בלוגר/יוצר תוכן על חיים מספקים', description: 'שתפו את הפילוסופיה שלכם על חיים טובים ואיזון', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '✨' },
  ],
  // מתינות + ביטחון ויציבות
  'מתינות|ביטחון ויציבות': [
    { title: 'יועץ פיננסי לגמלאים', description: 'עזרו לאנשים לתכנן נכון את הפנסיה ואת השלב הבא', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '📊' },
    { title: 'מתנדב בקו סיוע רגשי', description: 'הקשיבו ותמכו באנשים שמתמודדים עם שינויים בחיים', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '📞' },
    { title: 'מפקח איכות פרילנסר', description: 'בדקו ושפרו תהליכים בארגונים שמחפשים יציבות ואמינות', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🔍' },
  ],
  // חוכמה + יזמות
  'חוכמה|יזמות': [
    { title: 'יועץ לסטארטאפים בשלב מוקדם', description: 'שלבו חשיבה אסטרטגית עם רוח יזמית כדי להנחות מיזמים חדשים', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '💡' },
    { title: 'שופט/מנטור בתחרות יזמות', description: 'תנו פידבק מקצועי ליזמים צעירים בתחרויות האקתון ופיץ׳', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🏆' },
    { title: 'מרצה על חדשנות וחשיבה יצירתית', description: 'העבירו ידע על יצירתיות ויזמות בפלטפורמות מקוונות', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🎯' },
  ],
  // אנושיות + עצמאות ואוטונומיה
  'אנושיות|עצמאות ואוטונומיה': [
    { title: 'קואצ׳ר אישי עצמאי', description: 'ליוו אנשים בתהליכי צמיחה אישית – בקצב ובסגנון שלכם', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🌱' },
    { title: 'מתנדב בתוכנית Big Brother/Sister', description: 'צרו קשר אישי ומשמעותי עם צעיר שזקוק לדמות מבוגרת', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '👥' },
    { title: 'כותב ביוגרפיות ותולדות חיים', description: 'עזרו לאנשים לספר את סיפורם האישי בכתב', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '📖' },
  ],
};

// Default/fallback recommendations
const defaultRecommendations: Recommendation[] = [
  { title: 'מנטור מקצועי מנוסה', description: 'שתפו את שנות הניסיון שלכם עם הדור הבא – ליוו אנשי מקצוע צעירים בתחילת דרכם', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🦉' },
  { title: 'יועץ פרילנסר בתחום המומחיות', description: 'הפכו את הידע שצברתם לפעילות מניבה – ייעוץ גמיש מהבית', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '💼' },
  { title: 'מתנדב בארגון חברתי', description: 'תרמו מזמנכם ומניסיונכם לקהילה – מציאת משמעות דרך נתינה', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '❤️' },
];

export function getRecommendations(
  viaScores: Record<string, number>,
  scheinScores: Record<string, number>
): Recommendation[] {
  // Get top VIA and Schein
  const topVIA = Object.entries(viaScores).sort(([, a], [, b]) => b - a)[0]?.[0];
  const topSchein = Object.entries(scheinScores).sort(([, a], [, b]) => b - a)[0]?.[0];

  if (!topVIA || !topSchein) return defaultRecommendations;

  const key = `${topVIA}|${topSchein}`;
  const recommendations = recommendationPool[key];

  if (recommendations) return recommendations;

  // Try partial matches - same VIA with any Schein
  for (const [k, recs] of Object.entries(recommendationPool)) {
    if (k.startsWith(topVIA + '|')) return recs;
  }
  // Try same Schein with any VIA
  for (const [k, recs] of Object.entries(recommendationPool)) {
    if (k.endsWith('|' + topSchein)) return recs;
  }

  return defaultRecommendations;
}
