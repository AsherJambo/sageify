export type PlayGameId = "via" | "schein" | "thinking" | "skills" | "considerations";

const KEY = "play_progress_v1";

export type PlayProgress = Record<PlayGameId, { completed: boolean; result?: any }>;

const empty: PlayProgress = {
  via: { completed: false },
  schein: { completed: false },
  thinking: { completed: false },
  skills: { completed: false },
  considerations: { completed: false },
};

export function getProgress(): PlayProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

export function setComplete(id: PlayGameId, result?: any) {
  const p = getProgress();
  p[id] = { completed: true, result };
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function resetProgress() {
  localStorage.removeItem(KEY);
}
