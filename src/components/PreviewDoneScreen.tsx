import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  emoji?: string;
  summary?: string;
  children?: React.ReactNode;
}

const PreviewDoneScreen = ({ title, emoji = '✨', summary, children }: Props) => (
  <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-xl w-full text-center bg-card rounded-3xl shadow-xl p-10 border border-border/60"
    >
      <div className="text-6xl mb-5">{emoji}</div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-3">{title}</h1>
      {summary && <p className="text-lg text-muted-foreground mb-6">{summary}</p>}
      {children && <div className="mb-6">{children}</div>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/preview"
          className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition shadow-md"
        >
          חזרה למרכז התצוגה
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-full border border-border bg-card text-foreground hover:bg-muted transition"
        >
          לדף הבית
        </Link>
      </div>
    </motion.div>
  </div>
);

export default PreviewDoneScreen;
