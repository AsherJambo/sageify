import { useState } from "react";
import { motion } from "framer-motion";
import PlayShell, { DoneScreen } from "./PlayShell";
import { setComplete } from "./playStorage";
import { Minus, Plus } from "lucide-react";

const FACTORS = [
  { id: "salary", label: "שכר", color: "from-amber-400 to-orange-500" },
  { id: "remote", label: "גמישות מרחוק", color: "from-sky-400 to-cyan-500" },
  { id: "proximity", label: "קרבה לבית", color: "from-emerald-400 to-teal-500" },
  { id: "meaning", label: "עבודה משמעותית", color: "from-violet-400 to-fuchsia-500" },
  { id: "growth", label: "צמיחה אישית", color: "from-rose-400 to-pink-500" },
  { id: "team", label: "צוות וקהילה", color: "from-indigo-400 to-blue-500" },
];

const TOTAL = 100;

export default function PlayConsiderations() {
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(FACTORS.map((f) => [f.id, 0])),
  );
  const [done, setDone] = useState(false);

  const spent = Object.values(vals).reduce((a, b) => a + b, 0);
  const remaining = TOTAL - spent;

  const adjust = (id: string, delta: number) => {
    setVals((v) => {
      const next = Math.max(0, Math.min(TOTAL, (v[id] ?? 0) + delta));
      const others = Object.entries(v).reduce(
        (sum, [k, val]) => (k === id ? sum : sum + val),
        0,
      );
      const capped = Math.min(next, TOTAL - others);
      return { ...v, [id]: capped };
    });
  };

  const finish = () => {
    setComplete("considerations", vals);
    setDone(true);
  };

  return (
    <PlayShell
      title="Energy Balancer"
      bg="bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#020617]"
    >
      {done ? (
        <DoneScreen title="האנרגיה שלך חולקה." subtitle="זה מפת המשקלים האישית שלך.">
          <div className="mt-6 w-full max-w-sm space-y-2">
            {FACTORS.map((f) => (
              <div key={f.id} className="flex items-center gap-3 text-sm">
                <div className="w-24 text-right opacity-80">{f.label}</div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-l ${f.color}`}
                    style={{ width: `${vals[f.id]}%` }}
                  />
                </div>
                <div className="w-10 tabular-nums text-left">{vals[f.id]}</div>
              </div>
            ))}
          </div>
        </DoneScreen>
      ) : (
        <div className="flex-1 flex flex-col px-5 py-6">
          {/* Energy counter */}
          <div className="sticky top-0 z-10 -mx-5 px-5 pb-4">
            <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-4 flex items-center justify-between">
              <div>
                <div className="text-xs opacity-60">אנרגיה שנותרה</div>
                <div className="text-3xl font-bold tabular-nums">
                  {remaining}
                  <span className="text-sm opacity-50 mr-1">/ {TOTAL}</span>
                </div>
              </div>
              <div className="relative w-16 h-16 rounded-full bg-white/5 overflow-hidden border border-white/10">
                <motion.div
                  animate={{ height: `${(spent / TOTAL) * 100}%` }}
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-fuchsia-500 to-violet-400"
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {spent}%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {FACTORS.map((f) => {
              const v = vals[f.id];
              return (
                <div
                  key={f.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{f.label}</span>
                    <span className="tabular-nums text-sm opacity-80">{v}</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-white/10 overflow-hidden mb-3">
                    <motion.div
                      animate={{ width: `${v}%` }}
                      transition={{ duration: 0.25 }}
                      className={`h-full bg-gradient-to-l ${f.color}`}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => adjust(f.id, -5)}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={TOTAL}
                      value={v}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        const others = spent - v;
                        const capped = Math.min(next, TOTAL - others);
                        setVals((vs) => ({ ...vs, [f.id]: capped }));
                      }}
                      className="flex-1 accent-fuchsia-400"
                    />
                    <button
                      onClick={() => adjust(f.id, +5)}
                      disabled={remaining <= 0}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={finish}
            disabled={spent < TOTAL}
            className="mt-4 sticky bottom-4 w-full py-4 rounded-2xl bg-white text-slate-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition"
          >
            {spent < TOTAL ? `הקצה עוד ${remaining} נקודות` : "סיים והצג מפה"}
          </button>
        </div>
      )}
    </PlayShell>
  );
}
