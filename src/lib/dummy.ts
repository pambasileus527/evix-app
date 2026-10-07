// ダミーの取引データ生成（ポートフォリオ用デモ）。
// 実在の相場データは使っていない。乱数の種を固定しているので、毎回同じデータになる。

import { MODELS, REGIONS, type CarModel, type RegionId } from "./models";
import { baselineValueManYen, clamp, expectedSoh, STANDARD_KM_PER_YEAR } from "./valuation";

export type Transaction = {
  month: string; // "2026-09"
  modelId: string;
  makerSlug: string;
  region: RegionId;
  year: number;
  grade: string;
  km: number;
  soh: number;
  priceManYen: number;
  /** 条件だけで決まる基準価値（指数計算用） */
  baselineManYen: number;
};

export const START_MONTH = "2021-10";
export const END_MONTH = "2026-09";

export function monthRange(from = START_MONTH, to = END_MONTH) {
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

export const MONTHS = monthRange();

/** 市場全体の動き（デモ用の形：2022年に高騰 → 2023〜24年に下落 → 2025年以降に持ち直し） */
const MARKET_KEYS: [number, number][] = [
  [0, 1.0],
  [9, 1.12],
  [21, 0.88],
  [33, 0.7],
  [44, 0.71],
  [59, 0.82],
];

function marketLevel(t: number) {
  for (let i = 1; i < MARKET_KEYS.length; i++) {
    const [t0, v0] = MARKET_KEYS[i - 1];
    const [t1, v1] = MARKET_KEYS[i];
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
  }
  return MARKET_KEYS[MARKET_KEYS.length - 1][1];
}

/** メーカーごとの値動きの大きさ（1より大きいほど振れ幅が大きい） */
const MAKER_SENSITIVITY: Record<string, number> = {
  tesla: 1.4,
  nissan: 0.85,
  mitsubishi: 0.8,
};

function makerMarket(makerSlug: string, t: number) {
  const s = MAKER_SENSITIVITY[makerSlug] ?? 1;
  return 1 + (marketLevel(t) - 1) * s;
}

// 決まった種から同じ乱数列を作る（mulberry32）
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pick<T>(rand: () => number, items: readonly T[]) {
  return items[Math.floor(rand() * items.length)];
}

function generateFor(model: CarModel, rand: () => number) {
  const txs: Transaction[] = [];
  MONTHS.forEach((month, t) => {
    const [cy, cm] = month.split("-").map(Number);
    const years: number[] = [];
    for (let y = model.yearFrom; y <= Math.min(model.yearTo, cy); y++) years.push(y);
    if (years.length === 0) return;
    const count = Math.max(1, Math.round(model.monthlyVolume * (0.8 + rand() * 0.4)));
    for (let i = 0; i < count; i++) {
      const year = pick(rand, years);
      const ageYears = Math.max(0.1, cy + (cm - 1) / 12 - (year + 0.5));
      const grade = pick(rand, model.grades);
      const km = Math.round(
        clamp(ageYears * STANDARD_KM_PER_YEAR * Math.exp(normal(rand) * 0.35), 300, 250000) / 100,
      ) * 100;
      const soh = Math.round(
        clamp(expectedSoh(ageYears, km, model.degradation) + normal(rand) * 2, 50, 100),
      );
      const region = pick(rand, REGIONS);
      const baseline = baselineValueManYen({
        newPriceManYen: grade.newPriceManYen,
        ageYears,
        km,
        soh,
      });
      const price =
        baseline * makerMarket(model.makerSlug, t) * region.demand * Math.exp(normal(rand) * 0.05);
      txs.push({
        month,
        modelId: model.id,
        makerSlug: model.makerSlug,
        region: region.id,
        year,
        grade: grade.name,
        km,
        soh,
        priceManYen: Math.round(price * 10) / 10,
        baselineManYen: baseline,
      });
    }
  });
  return txs;
}

let cache: Transaction[] | null = null;

export function getTransactions() {
  if (!cache) {
    cache = MODELS.flatMap((m, i) => generateFor(m, rng(20261003 + i * 7919)));
  }
  return cache;
}
