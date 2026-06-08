import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { ReactNode } from "react";

export default function PlayShell({
  children,
  title,
  step,
  total,
  bg = "bg-slate-950",
  fg = "text-white",
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
    <div dir="rtl" className={`min-h-screen ${bg} ${fg} flex flex-col`}>
      <header className="sticky top-0 z-20 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => nav("/play")}
            className="p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] tracking-[0.25em] opacity-60">PLAY</div>
            <div className="text-sm font-semibold truncate">{title}</div>
          </div>
          {step != null && total ? (
            <div className="text-xs opacity-70 tabular-nums">{step}/{total}</div>
          ) : null}
        </div>
        {step != null && total ? (
          <div className="h-0.5 bg-white/5">
            <div
              className="h-full bg-gradient-to-l from-fuchsia-400 to-violet-500 transition-all duration-500"
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
      <div className="text-6xl mb-4">✨</div>
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      {subtitle && <p className="opacity-70 max-w-sm">{subtitle}</p>}
      {children}
      <Link
        to="/play"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 font-semibold hover:scale-[1.02] transition"
      >
        חזרה ללוח המשחקים
        <ArrowRight className="w-4 h-4 rotate-180" />
      </Link>
    </div>
  );
}
