import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Palette,
  Music,
  BookOpen,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Home,
  Loader2,
  Trash2,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Track = "home" | "art" | "music" | "memoir" | "gallery";

interface Creation {
  id: string;
  type: "art" | "music" | "memoir";
  title: string;
  content: string; // image data url, music description, or story
  meta?: string; // mood/genre or prompt summary
  createdAt: number;
}

const STORAGE_KEY = "goldencanvas-creations-v1";

const loadCreations = (): Creation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCreations = (list: Creation[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

const MEMOIR_PROMPTS = [
  "ספר/י לי על יום מיוחד מילדותך שאתה זוכר עד היום.",
  "מי היה המורה או המנטור שהשפיע עליך יותר מכל? מה הוא לימד אותך?",
  "תאר/י את הבית בו גדלת – הריחות, הצלילים, האנשים.",
  "מה היה הרגע הכי מאושר בחייך המקצועיים?",
  "ספר/י על חבר ילדות יקר – מה עשיתם יחד?",
  "תאר/י את היום שבו פגשת את אהבת חייך.",
  "מה היה הטיול הבלתי נשכח שעשית?",
  "ספר/י על דבר שלמדת בקושי – ושינה את חייך.",
];

const MUSIC_GENRES = [
  { id: "jazz", label: "ג׳אז קלאסי", emoji: "🎷" },
  { id: "piano", label: "פסנתר נוסטלגי", emoji: "🎹" },
  { id: "classical", label: "מוזיקה קלאסית", emoji: "🎻" },
  { id: "folk", label: "פולק רגוע", emoji: "🪕" },
  { id: "israeli", label: "שירי ארץ ישראל", emoji: "🕊️" },
  { id: "bossa", label: "בוסה נובה חמה", emoji: "🌴" },
];

const MUSIC_MOODS = [
  { id: "nostalgic", label: "נוסטלגי", emoji: "🌅" },
  { id: "joyful", label: "שמח", emoji: "☀️" },
  { id: "peaceful", label: "רגוע", emoji: "🌿" },
  { id: "romantic", label: "רומנטי", emoji: "💝" },
  { id: "reflective", label: "מהורהר", emoji: "🌙" },
  { id: "hopeful", label: "מלא תקווה", emoji: "🌻" },
];

// ---- Help dialog ----
const HelpButton = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="עזרה"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-amber-500 text-white text-lg font-semibold shadow-xl hover:bg-amber-600 active:scale-95 transition-all"
      >
        <HelpCircle className="w-6 h-6" />
        <span>עזרה</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-right">איך זה עובד?</DialogTitle>
            <DialogDescription className="text-lg leading-relaxed text-right text-foreground/80 pt-3">
              {text}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

const BigButton = ({
  onClick,
  children,
  variant = "primary",
  disabled,
  className = "",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  className?: string;
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-xl font-semibold min-h-[64px] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
      variant === "primary"
        ? "bg-amber-600 text-white hover:bg-amber-700 shadow-lg"
        : "bg-white text-amber-900 border-2 border-amber-300 hover:bg-amber-50"
    } ${className}`}
  >
    {children}
  </motion.button>
);

// =================================================================
// HOME
// =================================================================
const HomeScreen = ({ go, count }: { go: (t: Track) => void; count: number }) => (
  <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-base mb-4">
        <Sparkles className="w-5 h-5" />
        <span>גלריית היצירה הזהובה</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-display font-bold text-amber-950 mb-4 leading-tight">
        ברוכים הבאים ל-<span className="text-amber-700">GoldenCanvas</span>
      </h1>
      <p className="text-xl md:text-2xl text-amber-900/80 leading-relaxed max-w-2xl mx-auto">
        מקום חמים לגלות את האמן, המוזיקאי והסופר שבתוכך 💛
      </p>
    </motion.div>

    <div className="grid gap-5 md:grid-cols-3">
      {[
        { id: "art" as Track, icon: Palette, title: "ציור מתוך זיכרון", desc: "תארו זיכרון או חלום – ונהפוך אותו לציור שמן יפהפה", color: "from-rose-100 to-orange-100", iconColor: "text-rose-600" },
        { id: "music" as Track, icon: Music, title: "מורשת מוזיקלית", desc: "בחרו סגנון ומצב רוח – ונייצר עבורכם קטע מוזיקלי", color: "from-sky-100 to-indigo-100", iconColor: "text-sky-600" },
        { id: "memoir" as Track, icon: BookOpen, title: "כתיבת זיכרונות", desc: "ענו על שאלה אחת – ונהפוך את התשובה לסיפור מעוצב", color: "from-emerald-100 to-teal-100", iconColor: "text-emerald-600" },
      ].map((card, i) => (
        <motion.button
          key={card.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => go(card.id)}
          className={`text-right p-6 md:p-8 rounded-3xl bg-gradient-to-br ${card.color} shadow-md hover:shadow-2xl transition-all border-2 border-white min-h-[220px] flex flex-col`}
        >
          <card.icon className={`w-12 h-12 ${card.iconColor} mb-4`} />
          <h3 className="text-2xl font-display font-bold text-amber-950 mb-2">{card.title}</h3>
          <p className="text-lg text-amber-900/80 leading-relaxed flex-1">{card.desc}</p>
          <div className="flex items-center gap-2 mt-4 text-amber-800 font-semibold text-lg">
            <span>בואו נתחיל</span>
            <ArrowLeft className="w-5 h-5" />
          </div>
        </motion.button>
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="mt-10 text-center"
    >
      <BigButton variant="ghost" onClick={() => go("gallery")}>
        <ImageIcon className="w-6 h-6" />
        <span>הגלריה שלי</span>
        {count > 0 && (
          <span className="bg-amber-600 text-white text-base rounded-full px-3 py-0.5">{count}</span>
        )}
      </BigButton>
    </motion.div>

    <HelpButton text="ב-GoldenCanvas יש 3 דרכים פשוטות ליצור: ציור, מוזיקה וסיפור. בחרו אחת מהכפתורים הגדולים, ועקבו אחר ההוראות. כל יצירה נשמרת אוטומטית בגלריה האישית שלכם." />
  </div>
);

// =================================================================
// VISUAL ARTS
// =================================================================
const ArtScreen = ({ go, addCreation }: { go: (t: Track) => void; addCreation: (c: Creation) => void }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleListen = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("הדפדפן לא תומך בהקלטה. אנא הקלידו במקום זאת.");
      return;
    }
    const rec = new SR();
    rec.lang = "he-IL";
    rec.onresult = (e: any) => setPrompt(prompt + " " + e.results[0][0].transcript);
    rec.onerror = () => toast.error("לא הצלחנו לשמוע. נסו שוב.");
    rec.start();
    toast.info("מקשיב... דברו עכשיו");
  };

  const generate = async () => {
    if (prompt.trim().length < 5) {
      toast.error("בבקשה כתבו עוד קצת על הזיכרון או החלום");
      return;
    }
    setLoading(true);
    setImageUrl("");
    try {
      const { data, error } = await supabase.functions.invoke("golden-canvas", {
        body: { mode: "image", prompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("לא התקבלה תמונה");
      setImageUrl(data.imageUrl);
      addCreation({
        id: `${Date.now()}`,
        type: "art",
        title: prompt.slice(0, 50),
        content: data.imageUrl,
        meta: prompt,
        createdAt: Date.now(),
      });
      toast.success("הציור שלכם מוכן! 🎨");
    } catch (e: any) {
      toast.error(e?.message || "אירעה שגיאה. נסו שוב בעוד רגע.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-amber-950 mb-2 flex items-center gap-3">
        <Palette className="w-9 h-9 text-rose-600" />
        ציור מתוך זיכרון
      </h2>
      <p className="text-xl text-amber-900/80 mb-8 leading-relaxed">
        תארו במילים שלכם זיכרון, חלום, או נוף שאתם אוהבים. נהפוך את זה לציור שמן יפה.
      </p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="לדוגמה: שדה חמניות בקיץ, השמש שוקעת, וילדה קטנה עם כובע קש רצה ביניהן..."
        className="w-full min-h-[180px] p-5 rounded-2xl border-2 border-amber-200 bg-white text-xl leading-relaxed focus:outline-none focus:border-amber-500 placeholder:text-amber-700/40"
      />

      <div className="flex flex-wrap gap-3 mt-4">
        <BigButton variant="ghost" onClick={handleListen} className="!text-lg !px-6 !py-4 !min-h-[56px]">
          🎤 דברו במקום להקליד
        </BigButton>
        <BigButton onClick={generate} disabled={loading} className="flex-1 min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              מצייר...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              צרו לי ציור
            </>
          )}
        </BigButton>
      </div>

      <AnimatePresence>
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mt-8 p-4 bg-white rounded-3xl shadow-2xl border-4 border-amber-200"
          >
            <img src={imageUrl} alt="הציור שלך" className="w-full rounded-2xl" />
            <a
              href={imageUrl}
              download="goldencanvas-art.png"
              className="mt-4 inline-flex items-center gap-2 text-lg text-amber-700 hover:text-amber-900 font-semibold"
            >
              <Download className="w-5 h-5" />
              שמרו במחשב
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar onBack={() => go("home")} />
      <HelpButton text="כתבו או דברו על משהו שאתם רואים בעיני רוחכם – זיכרון מהילדות, נוף אהוב, או רגע מיוחד. ככל שתוסיפו יותר פרטים (צבעים, אנשים, רגש) – הציור יהיה יפה יותר. לחצו על 'צרו לי ציור' וחכו כמה שניות." />
    </div>
  );
};

// =================================================================
// MUSIC
// =================================================================
const MusicScreen = ({ go, addCreation }: { go: (t: Track) => void; addCreation: (c: Creation) => void }) => {
  const [genre, setGenre] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const generate = async () => {
    if (!genre || !mood) {
      toast.error("בבקשה בחרו גם סגנון וגם מצב רוח");
      return;
    }
    setLoading(true);
    setDescription("");
    try {
      const genreLabel = MUSIC_GENRES.find((g) => g.id === genre)?.label || genre;
      const moodLabel = MUSIC_MOODS.find((m) => m.id === mood)?.label || mood;
      const { data, error } = await supabase.functions.invoke("golden-canvas", {
        body: { mode: "music", genre: genreLabel, mood: moodLabel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDescription(data.description);
      addCreation({
        id: `${Date.now()}`,
        type: "music",
        title: `${genreLabel} – ${moodLabel}`,
        content: data.description,
        meta: `${genreLabel} • ${moodLabel}`,
        createdAt: Date.now(),
      });
      toast.success("הקטע המוזיקלי שלכם מוכן! 🎵");
    } catch (e: any) {
      toast.error(e?.message || "אירעה שגיאה. נסו שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-amber-950 mb-2 flex items-center gap-3">
        <Music className="w-9 h-9 text-sky-600" />
        מורשת מוזיקלית
      </h2>
      <p className="text-xl text-amber-900/80 mb-8 leading-relaxed">
        בחרו סגנון מוזיקלי ומצב רוח – ונכין עבורכם תיאור חי של קטע מוזיקלי קצר.
      </p>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-amber-900 mb-3">1. איזה סגנון אהוב עליכם?</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MUSIC_GENRES.map((g) => (
            <motion.button
              key={g.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGenre(g.id)}
              className={`p-4 rounded-2xl border-2 text-lg font-semibold min-h-[80px] transition-all ${
                genre === g.id
                  ? "bg-sky-500 text-white border-sky-600 shadow-lg"
                  : "bg-white text-amber-900 border-amber-200 hover:border-sky-300"
              }`}
            >
              <div className="text-3xl mb-1">{g.emoji}</div>
              <div>{g.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-amber-900 mb-3">2. איזה מצב רוח?</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MUSIC_MOODS.map((m) => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(m.id)}
              className={`p-4 rounded-2xl border-2 text-lg font-semibold min-h-[80px] transition-all ${
                mood === m.id
                  ? "bg-indigo-500 text-white border-indigo-600 shadow-lg"
                  : "bg-white text-amber-900 border-amber-200 hover:border-indigo-300"
              }`}
            >
              <div className="text-3xl mb-1">{m.emoji}</div>
              <div>{m.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <BigButton onClick={generate} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            מלחין עבורכם...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            צרו לי קטע מוזיקלי
          </>
        )}
      </BigButton>

      <AnimatePresence>
        {description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 md:p-8 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-3xl border-2 border-sky-200 shadow-lg"
          >
            <div className="text-5xl mb-4 text-center">🎼</div>
            <p className="text-xl leading-loose text-amber-950 whitespace-pre-wrap">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar onBack={() => go("home")} />
      <HelpButton text="קטע מוזיקלי בנוי משני דברים: סגנון (כמו ג'אז או פסנתר) ומצב רוח (כמו רגוע או שמח). בחרו אחד מכל קבוצה – פשוט לחצו על הריבוע שאתם הכי אוהבים – ואז על 'צרו לי קטע מוזיקלי'." />
    </div>
  );
};

// =================================================================
// MEMOIR
// =================================================================
const MemoirScreen = ({ go, addCreation }: { go: (t: Track) => void; addCreation: (c: Creation) => void }) => {
  const [promptIdx, setPromptIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState("");

  useEffect(() => {
    // Daily prompt – stable per day
    const day = Math.floor(Date.now() / 86400000);
    setPromptIdx(day % MEMOIR_PROMPTS.length);
  }, []);

  const newPrompt = () => {
    setPromptIdx((p) => (p + 1) % MEMOIR_PROMPTS.length);
    setAnswer("");
    setStory("");
  };

  const generate = async () => {
    if (answer.trim().length < 20) {
      toast.error("בבקשה כתבו עוד קצת – לפחות כמה משפטים");
      return;
    }
    setLoading(true);
    setStory("");
    try {
      const fullPrompt = `שאלה: ${MEMOIR_PROMPTS[promptIdx]}\n\nתשובת המשתמש: ${answer}`;
      const { data, error } = await supabase.functions.invoke("golden-canvas", {
        body: { mode: "story", prompt: fullPrompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStory(data.story);
      const lines = data.story.split("\n").filter((l: string) => l.trim());
      const title = lines[0] || answer.slice(0, 40);
      addCreation({
        id: `${Date.now()}`,
        type: "memoir",
        title,
        content: data.story,
        meta: MEMOIR_PROMPTS[promptIdx],
        createdAt: Date.now(),
      });
      toast.success("הסיפור שלכם מוכן! 📖");
    } catch (e: any) {
      toast.error(e?.message || "אירעה שגיאה. נסו שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-amber-950 mb-2 flex items-center gap-3">
        <BookOpen className="w-9 h-9 text-emerald-600" />
        כתיבת זיכרונות
      </h2>
      <p className="text-xl text-amber-900/80 mb-6 leading-relaxed">
        ענו על שאלה אחת – נהפוך את התשובה שלכם לסיפור קצר ומעוצב.
      </p>

      <div className="p-5 md:p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-200 mb-6">
        <div className="text-sm font-semibold text-emerald-700 mb-2">השאלה של היום:</div>
        <p className="text-2xl font-display text-emerald-950 leading-relaxed">
          {MEMOIR_PROMPTS[promptIdx]}
        </p>
        <button
          onClick={newPrompt}
          className="mt-3 text-base text-emerald-700 hover:text-emerald-900 font-semibold underline"
        >
          ↻ שאלה אחרת
        </button>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="כתבו כאן את התשובה שלכם – בכמה משפטים או יותר. אל תדאגו מהדקדוק, אנחנו נסדר הכל."
        className="w-full min-h-[200px] p-5 rounded-2xl border-2 border-amber-200 bg-white text-xl leading-relaxed focus:outline-none focus:border-emerald-500 placeholder:text-amber-700/40"
      />

      <BigButton onClick={generate} disabled={loading} className="w-full mt-4">
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            כותב את הסיפור שלכם...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            הפכו לסיפור
          </>
        )}
      </BigButton>

      <AnimatePresence>
        {story && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 md:p-10 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-3xl border-2 border-emerald-200 shadow-xl"
          >
            <p className="text-xl md:text-2xl leading-loose text-amber-950 whitespace-pre-wrap font-display">
              {story}
            </p>
          </motion.article>
        )}
      </AnimatePresence>

      <NavBar onBack={() => go("home")} />
      <HelpButton text="קראו את השאלה למעלה ⬆️ אם אתם רוצים שאלה אחרת – לחצו על '↻ שאלה אחרת'. אחר כך כתבו את התשובה שלכם בלשון פשוטה. לחצו על 'הפכו לסיפור' ונהפוך את התשובה שלכם לסיפור יפה ומעוצב." />
    </div>
  );
};

// =================================================================
// GALLERY
// =================================================================
const GalleryScreen = ({
  go,
  creations,
  remove,
}: {
  go: (t: Track) => void;
  creations: Creation[];
  remove: (id: string) => void;
}) => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <h2 className="text-3xl md:text-4xl font-display font-bold text-amber-950 mb-2 flex items-center gap-3">
      <ImageIcon className="w-9 h-9 text-amber-600" />
      הגלריה שלי
    </h2>
    <p className="text-xl text-amber-900/80 mb-8 leading-relaxed">
      כל היצירות שלכם שמורות כאן. זוהי מפת הפרישה היצירתית שלכם 💛
    </p>

    {creations.length === 0 ? (
      <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-amber-300">
        <p className="text-2xl text-amber-900/60 mb-6">עדיין אין יצירות בגלריה</p>
        <BigButton onClick={() => go("home")}>
          <Sparkles className="w-6 h-6" />
          בואו ניצור את הראשונה
        </BigButton>
      </div>
    ) : (
      <div className="grid gap-5 md:grid-cols-2">
        {creations.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-amber-100"
          >
            {c.type === "art" && (
              <img src={c.content} alt={c.title} className="w-full aspect-square object-cover" />
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 text-sm text-amber-700 mb-2">
                {c.type === "art" && <Palette className="w-4 h-4" />}
                {c.type === "music" && <Music className="w-4 h-4" />}
                {c.type === "memoir" && <BookOpen className="w-4 h-4" />}
                <span className="font-semibold">
                  {c.type === "art" ? "ציור" : c.type === "music" ? "מוזיקה" : "סיפור"}
                </span>
                <span>•</span>
                <span>{new Date(c.createdAt).toLocaleDateString("he-IL")}</span>
              </div>
              <h4 className="text-xl font-display font-bold text-amber-950 mb-2">{c.title}</h4>
              {c.type !== "art" && (
                <p className="text-base text-amber-900/80 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              )}
              <button
                onClick={() => remove(c.id)}
                className="mt-3 inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800"
              >
                <Trash2 className="w-4 h-4" />
                מחק
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )}

    <NavBar onBack={() => go("home")} />
    <HelpButton text="כאן תמצאו את כל היצירות שיצרתם – ציורים, מוזיקה וסיפורים. כל יצירה נשמרת אוטומטית. אם אתם רוצים למחוק יצירה, לחצו על 'מחק' מתחתיה." />
  </div>
);

// =================================================================
// NAV BAR
// =================================================================
const NavBar = ({ onBack }: { onBack: () => void }) => (
  <div className="mt-10 flex items-center justify-between gap-3 pb-24">
    <BigButton variant="ghost" onClick={onBack}>
      <ArrowRight className="w-6 h-6" />
      חזרה
    </BigButton>
  </div>
);

// =================================================================
// MAIN PAGE
// =================================================================
const GoldenCanvas = () => {
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track>("home");
  const [creations, setCreations] = useState<Creation[]>([]);

  useEffect(() => {
    setCreations(loadCreations());
    document.title = "GoldenCanvas – יצירה לפרישה הזהובה";
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [track]);

  const addCreation = (c: Creation) => {
    setCreations((prev) => {
      const next = [c, ...prev].slice(0, 100);
      saveCreations(next);
      return next;
    });
  };

  const removeCreation = (id: string) => {
    setCreations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCreations(next);
      return next;
    });
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"
      style={{ fontSize: "18px" }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-amber-50/80 backdrop-blur border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setTrack("home")}
            className="flex items-center gap-2 text-xl font-display font-bold text-amber-900 hover:text-amber-700"
          >
            <Sparkles className="w-6 h-6 text-amber-600" />
            GoldenCanvas
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-200 text-base text-amber-900 hover:bg-amber-100"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">לדף הבית</span>
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={track}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
        >
          {track === "home" && <HomeScreen go={setTrack} count={creations.length} />}
          {track === "art" && <ArtScreen go={setTrack} addCreation={addCreation} />}
          {track === "music" && <MusicScreen go={setTrack} addCreation={addCreation} />}
          {track === "memoir" && <MemoirScreen go={setTrack} addCreation={addCreation} />}
          {track === "gallery" && (
            <GalleryScreen go={setTrack} creations={creations} remove={removeCreation} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GoldenCanvas;
