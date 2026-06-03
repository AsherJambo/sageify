import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PREVIEWS = [
  { path: '/preview/holland', title: 'Holland — תחומי עניין', desc: 'שאלון מעורבב ללא כותרות קטגוריה', emoji: '🧭', tone: 'from-sky/15 to-sky/5' },
  { path: '/preview/via', title: 'VIA — חוזקות אופי', desc: 'חוזקות במבט אישי', emoji: '✨', tone: 'from-sunny/15 to-sunny/5' },
  { path: '/preview/schein', title: 'Schein — עוגנים תעסוקתיים', desc: 'Linear Journey — שאלה אחת בכל פעם', emoji: '⚓', tone: 'from-secondary/15 to-secondary/5' },
  { path: '/preview/motivation', title: 'Motivation & Intentions', desc: 'Mixer Garden — צנצנות וזרעים', emoji: '🌱', tone: 'from-success/15 to-success/5' },
  { path: '/preview/thinking', title: 'Thinking Skills', desc: 'כרטיסים מתפצחים — מטריצות', emoji: '🧩', tone: 'from-coral/15 to-coral/5' },
];

const PreviewHub = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <p className="text-sm font-medium text-secondary tracking-widest uppercase mb-3">Preview Lab</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            מרכז התצוגה המקדימה
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            כל הסגנונות החדשים של השאלונים — לחץ על כל כרטיס כדי להתנסות
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PREVIEWS.map((p, i) => (
            <motion.div
              key={p.path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <Link
                to={p.path}
                className={`group block h-full p-6 rounded-2xl bg-gradient-to-br ${p.tone} border border-border/60 hover:border-secondary/40 hover:shadow-xl transition-all duration-300`}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{p.emoji}</div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">{p.title}</h2>
                <p className="text-base text-muted-foreground leading-relaxed">{p.desc}</p>
                <div className="mt-5 text-sm font-medium text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  פתח תצוגה ←
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            ← חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PreviewHub;
