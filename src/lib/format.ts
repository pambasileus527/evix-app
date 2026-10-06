export function formatChange(pct: number) {
  if (pct > 0) return { text: `▲ +${pct.toFixed(1)}%`, tone: "up" as const };
  if (pct < 0) return { text: `▼ −${Math.abs(pct).toFixed(1)}%`, tone: "down" as const };
  return { text: "― 0.0%", tone: "flat" as const };
}

/** "2026-09" → "2026年9月" */
export function formatMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return `${y}年${m}月`;
}

/** 万円 → "¥2,880,000" */
export function formatYen(manYen: number) {
  return `¥${(Math.round(manYen) * 10000).toLocaleString("ja-JP")}`;
}

export function formatManYen(manYen: number) {
  return `${Math.round(manYen).toLocaleString("ja-JP")}万円`;
}
