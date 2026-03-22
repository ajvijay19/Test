export const RANKING_STORAGE_KEY = "claudetest:ranking-submissions";

export type RankingSubmission = {
  id: string;
  rank: number;
  submittedAt: string;
};

function isValidSubmission(x: unknown): x is RankingSubmission {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.rank === "number" &&
    o.rank >= 1 &&
    o.rank <= 10 &&
    typeof o.submittedAt === "string"
  );
}

export function loadSubmissions(): RankingSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RANKING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidSubmission);
  } catch {
    return [];
  }
}

export function appendSubmission(rank: number): RankingSubmission[] {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  const entry: RankingSubmission = {
    id,
    rank,
    submittedAt: new Date().toISOString(),
  };

  const prev = loadSubmissions();
  const next = [entry, ...prev];
  localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(next));
  return next;
}
