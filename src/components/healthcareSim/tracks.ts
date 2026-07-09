import type { TrackConfig } from "@/components/healthcareSim/TrackGame";

export const PT_TRACK: TrackConfig = {
  slug: "pt",
  name: "Physical Therapy · פיזיותרפיה",
  emoji: "🏃",
  hero: "כאב זז. אתה מזיז אותו.",
  tagline: "כל מטופל נכנס עם כאב תפקודי. תפקידך: לזהות מקור, לחמם, לחזק, ולהחזיר לתפקוד.",
  gradient: ["hsl(199 89% 55%)", "hsl(174 72% 56%)"],
  patientEmojis: ["🧑", "👨", "👩", "🧔", "👱‍♀️", "🧓"],
  patience: 18,
  shiftSeconds: 90,
  blocks: [
    { id: "warmup",  label: "חימום",           icon: "🔥", tint: "bg-[hsl(24_95%_58%)] text-white" },
    { id: "assess", label: "הערכת תנועה",     icon: "📐", tint: "bg-[hsl(199_89%_55%)] text-white" },
    { id: "core",    label: "חיזוק ליבה",       icon: "💪", tint: "bg-[hsl(262_70%_60%)] text-white" },
    { id: "stretch", label: "מתיחה ממוקדת",   icon: "🧘", tint: "bg-[hsl(174_72%_45%)] text-white" },
    { id: "ergo",    label: "הדרכת ארגונומיה", icon: "🪑", tint: "bg-[hsl(48_96%_55%)] text-[#0a0f1a]" },
    { id: "manual",  label: "טיפול ידני",       icon: "🖐️", tint: "bg-[hsl(346_77%_55%)] text-white" },
  ],
  complaints: [
    { text: "כאבי גב תחתון מישיבה ממושכת", emoji: "🪑", sequence: ["assess", "warmup", "core", "ergo"] },
    { text: "כתף קפואה אחרי פציעת ספורט",   emoji: "🏋️", sequence: ["assess", "warmup", "stretch", "manual"] },
    { text: "כאב ברך אחרי ריצה",           emoji: "🏃", sequence: ["assess", "warmup", "stretch", "core"] },
    { text: "צוואר תפוס מעבודה מול מסך",   emoji: "💻", sequence: ["assess", "stretch", "manual", "ergo"] },
    { text: "שיקום קרסול לאחר נקע",         emoji: "🦶", sequence: ["assess", "warmup", "manual", "core"] },
  ],
  paths: [
    { title: "פיזיותרפיה B.PT", text: "4 שנים · תנועה, שיקום, כאב" },
    { title: "קינזיולוגיה", text: "מתמחה בביומכניקה של ספורטאים" },
    { title: "ריפוי בעיסוק B.OT", text: "4 שנים · תפקוד יומיומי" },
    { title: "רפואת ספורט", text: "התמחות מתקדמת · פוסט-בוגר" },
  ],
};

export const NUTRITION_TRACK: TrackConfig = {
  slug: "nutrition",
  name: "Clinical Nutrition · תזונה קלינית",
  emoji: "🥗",
  hero: "מזון הוא תרופה. אתה הרוקח.",
  tagline: "המטופלים באים עם צריכה לא מאוזנת, סוכר גבוה או חסרים תזונתיים. תפקידך לבנות תוכנית שעובדת.",
  gradient: ["hsl(142 71% 45%)", "hsl(48 96% 55%)"],
  patientEmojis: ["🧑", "👨", "👩", "🧔", "👵", "🧑‍🍳"],
  patience: 20,
  shiftSeconds: 90,
  blocks: [
    { id: "bmi",     label: "הערכת BMI",       icon: "⚖️", tint: "bg-[hsl(199_89%_55%)] text-white" },
    { id: "sugar",   label: "הפחתת סוכר",       icon: "🍬", tint: "bg-[hsl(346_77%_55%)] text-white" },
    { id: "protein", label: "העלאת חלבון",     icon: "🍗", tint: "bg-[hsl(24_95%_58%)] text-white" },
    { id: "fiber",   label: "תוספת סיבים",     icon: "🥦", tint: "bg-[hsl(142_71%_45%)] text-white" },
    { id: "water",   label: "העלאת נוזלים",     icon: "💧", tint: "bg-[hsl(199_89%_65%)] text-[#0a0f1a]" },
    { id: "plan",    label: "תוכנית תפריט",     icon: "📋", tint: "bg-[hsl(48_96%_55%)] text-[#0a0f1a]" },
  ],
  complaints: [
    { text: "סוכרת סוג 2 חדשה — עודף משקל",   emoji: "🩸", sequence: ["bmi", "sugar", "fiber", "plan"] },
    { text: "עייפות כרונית, תזונה לא מאוזנת", emoji: "😪", sequence: ["bmi", "protein", "water", "plan"] },
    { text: "ספורטאי שרוצה לעלות מסת שריר",   emoji: "💪", sequence: ["bmi", "protein", "water", "plan"] },
    { text: "עצירות ובעיות עיכול",             emoji: "🌀", sequence: ["fiber", "water", "plan"] },
    { text: "כולסטרול גבוה בבדיקות דם",         emoji: "🫀", sequence: ["bmi", "sugar", "fiber", "plan"] },
  ],
  paths: [
    { title: "תזונה קלינית B.Sc", text: "4 שנים · דיאטנ/ית קליני/ת" },
    { title: "מדעי התזונה", text: "מחקר, תעשייה ומזון פונקציונלי" },
    { title: "בריאות הציבור", text: "M.PH · מדיניות תזונה" },
    { title: "ספורט ותזונה", text: "התמחות · ליווי ספורטאים" },
  ],
};
