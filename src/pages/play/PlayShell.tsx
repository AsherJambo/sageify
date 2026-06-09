import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { ReactNode } from "react";

/**
 * PlayShell — Owl Forest playful shell for /play cinematic mode.
 * Cream canvas, forest ink, amber/coral progress.
 */
export default function PlayShell({
  children,
  title,
  step,
  total,
  bg = "bg-background",
  fg = "text-foreground",
}: {
  children: ReactNode;
  title: string;
  step?: number;
  total?: number;
  bg?: string;
  fg?: string;
}) {
  const nav = useNavigate();
  const pct = step != null && total ? Math.min(100, (step / total) * 100) : 0;
  return (
    <div dir="rtl" className={`min-h-screen ${bg} ${fg} flex flex-col relative`}>
      {/* Cozy ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-sage/25 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 backdrop-blur-md bg-background/75 border-b-2 border-foreground/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => nav("/play")}
            className="p-2.5 rounded-2xl bg-card border-2 border-foreground/15 transition hover:-translate-y-0.5 active:translate-y-0.5"
            style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.18)', minHeight: 44, minWidth: 44 }}
            aria-label="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="text-[11px] tracking-[0.25em] font-bold text-foreground/55">PLAY</div>
            <div className="text-base font-serif truncate">{title}</div>
          </div>
          {step != null && total ? (
            <span
              className="text-sm font-bold tabular-nums px-3 py-1 rounded-full bg-accent text-foreground border-2 border-foreground/15"
              style={{ boxShadow: '0 2px 0 0 hsl(var(--foreground) / 0.20)' }}
            >
              {step}/{total}
            </span>
          ) : null}
        </div>
        {step != null && total ? (
          <div className="h-2 bg-secondary border-t border-foreground/5">
            <div
              className="h-full bg-gradient-to-l from-[hsl(var(--accent))] to-[hsl(var(--destructive))] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : null}
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

export function DoneScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
      <div className="text-6xl mb-4">🦉</div>
      <h2 className="text-4xl md:text-5xl font-serif mb-3">{title}</h2>
      {subtitle && <p className="text-lg text-foreground/70 max-w-sm">{subtitle}</p>}
      {children}
      <Link
        to="/play"
        className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-destructive text-destructive-foreground font-bold text-lg border-2 border-foreground/15 transition hover:-translate-y-0.5 active:translate-y-1"
        style={{ boxShadow: '0 5px 0 0 hsl(var(--foreground) / 0.85)', minHeight: 56 }}
      >
        חזרה ללוח המשחקים
        <ArrowRight className="w-5 h-5 rotate-180" />
      </Link>
    </div>
  );
}
