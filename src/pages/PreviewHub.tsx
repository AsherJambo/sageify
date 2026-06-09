import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PREVIEW_GAMES } from '@/lib/previewGames';

const PreviewHub = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold tracking-widest text-secondary uppercase mb-3 px-3 py-1 rounded-full bg-secondary/10">
            🎮 Preview Lab
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            מרכז המשחקים
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            משחק קצר אחד לטעימה — חושף פיסה מהפרופיל שלך.
            <br className="hidden sm:block" />
            לחצו והתחילו לשחק.
          </p>
        </motion.header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PREVIEW_GAMES.map((p, i) => (
            <motion.div
              key={p.path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                to={p.path}
                className={`group block h-full p-6 rounded-2xl bg-gradient-to-br ${p.tone} border border-border/60 hover:border-secondary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    {p.emoji}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/70 text-muted-foreground">
                      ⏱ {p.minutes}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                  {p.style}
                </p>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">{p.title}</h2>
                <p className="text-base text-muted-foreground leading-relaxed">{p.tagline}</p>
                <div className="mt-5 text-sm font-bold text-secondary opacity-70 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                  שחק עכשיו <span aria-hidden>←</span>
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
