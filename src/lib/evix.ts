// EVIX（EV中古車価格指数）の計算。
// 方法：各取引の「実際の価格 ÷ 基準価値」（品質調整済みの比率）を月ごとに中央値で集計し、
// 基準月（START_MONTH）の値を 100 として指数化する。
// 年式・走行距離・バッテリー状態の違いは基準価値で取り除かれるので、
// 「どの車が売れたか」の偏りではなく、市場全体の値動きだけが残る。

import { getTransactions, MONTHS, type Transaction } from "./dummy";
import { MODELS, REGIONS, type CarModel } from "./models";
import { sohFactor } from "./valuation";

export type Point = { month: string; value: number };

/** 公開する最低件数（要件定義書 6.3：サンプル数が少ない月は非公開） */
export const MIN_SAMPLES = 8;

export function quantile(sorted: number[], q: number) {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function median(values: number[]) {
  return quantile([...values].sort((a, b) => a - b), 0.5);
}

function ratio(tx: Transaction) {
  return tx.priceManYen / tx.baselineManYen;
}

/**
 * @param window 何か月分の取引をまとめて集計するか。件数の少ない内訳指数は 3 か月でならす
 */
function buildIndex(filter: (tx: Transaction) => boolean, window = 1): Point[] {
  const byMonth = new Map<string, number[]>();
  for (const tx of getTransactions()) {
    if (!filter(tx)) continue;
    const list = byMonth.get(tx.month) ?? [];
    list.push(ratio(tx));
    byMonth.set(tx.month, list);
  }
  const raw = MONTHS.map((month, i) => {
    const list = MONTHS.slice(Math.max(0, i - window + 1), i + 1).flatMap(
      (m) => byMonth.get(m) ?? [],
    );
    return { month, med: list.length >= MIN_SAMPLES ? median(list) : NaN };
  });
  const base = raw.find((r) => !Number.isNaN(r.med));
  if (!base) return [];
  return raw
    .filter((r) => !Number.isNaN(r.med))
    .map((r) => ({ month: r.month, value: Math.round((r.med / base.med) * 1000) / 10 }));
}

const memo = new Map<string, Point[]>();
function cached(key: string, f: () => Point[]) {
  if (!memo.has(key)) memo.set(key, f());
  return memo.get(key)!;
}

export const getMainIndex = () => cached("all", () => buildIndex(() => true));

export const getMakerIndex = (makerSlug: string) =>
  cached(`maker:${makerSlug}`, () => buildIndex((tx) => tx.makerSlug === makerSlug, 3));

export const getRegionIndex = (regionId: string) =>
  cached(`region:${regionId}`, () => buildIndex((tx) => tx.region === regionId, 3));

export const getModelIndex = (modelId: string) =>
  cached(`model:${modelId}`, () => buildIndex((tx) => tx.modelId === modelId, 3));

export type IndexSummary = {
  latest: number;
  latestMonth: string;
  changeMoM: number; // 前月比（%）
  changeYoY: number; // 前年同月比（%）
};

export function summarize(series: Point[]): IndexSummary {
  const last = series[series.length - 1];
  const prev = series[series.length - 2] ?? last;
  const yearAgo = series[series.length - 13] ?? series[0];
  const pct = (a: number, b: number) => Math.round(((a - b) / b) * 1000) / 10;
  return {
    latest: last.value,
    latestMonth: last.month,
    changeMoM: pct(last.value, prev.value),
    changeYoY: pct(last.value, yearAgo.value),
  };
}

export function getSubIndexes() {
  const makers = Array.from(new Set(MODELS.map((m) => m.makerSlug))).map((slug) => {
    const name = MODELS.find((m) => m.makerSlug === slug)!.makerName;
    return { key: `maker-${slug}`, name: `${name}指数`, ...summarize(getMakerIndex(slug)) };
  });
  const regions = REGIONS.map((r) => ({
    key: `region-${r.id}`,
    name: `${r.name}指数`,
    ...summarize(getRegionIndex(r.id)),
  }));
  return { makers, regions };
}

/** 直近3か月の取引 */
function recentTransactions(modelId: string) {
  const recent = new Set(MONTHS.slice(-3));
  return getTransactions().filter((tx) => tx.modelId === modelId && recent.has(tx.month));
}

export type PriceRow = { label: string; count: number; p25: number; median: number; p75: number };

function priceRow(label: string, txs: Transaction[]): PriceRow | null {
  if (txs.length < 3) return null;
  const prices = txs.map((t) => t.priceManYen).sort((a, b) => a - b);
  return {
    label,
    count: txs.length,
    p25: Math.round(quantile(prices, 0.25)),
    median: Math.round(quantile(prices, 0.5)),
    p75: Math.round(quantile(prices, 0.75)),
  };
}

export function getModelStats(model: CarModel) {
  const txs = recentTransactions(model.id);
  const years: number[] = [];
  for (let y = model.yearTo; y >= model.yearFrom; y--) years.push(y);
  const byYear = years
    .map((y) => priceRow(`${y}年式`, txs.filter((t) => t.year === y)))
    .filter((r): r is PriceRow => r !== null);

  const kmBands: [string, number, number][] = [
    ["3万km未満", 0, 30000],
    ["3万〜6万km", 30000, 60000],
    ["6万〜10万km", 60000, 100000],
    ["10万km以上", 100000, Infinity],
  ];
  const byMileage = kmBands
    .map(([label, lo, hi]) => priceRow(label, txs.filter((t) => t.km >= lo && t.km < hi)))
    .filter((r): r is PriceRow => r !== null);

  // バッテリー状態による価格差：年式・走行距離の違いを取り除くため、
  // 「SOH補正を除いた基準価値」に対する比率を比べ、SOH 90%以上の車との差（%）で表す
  const ratioWithoutSoh = (t: Transaction) => t.priceManYen / (t.baselineManYen / sohFactor(t.soh));
  const sohBands: [string, number, number][] = [
    ["SOH 90%以上", 90, 101],
    ["SOH 80〜89%", 80, 90],
    ["SOH 70〜79%", 70, 80],
    ["SOH 70%未満", 0, 70],
  ];
  const sohMedians = sohBands.map(([label, lo, hi]) => {
    const list = txs.filter((t) => t.soh >= lo && t.soh < hi);
    return { label, count: list.length, med: list.length >= 3 ? median(list.map(ratioWithoutSoh)) : NaN };
  });
  const top = sohMedians.find((r) => !Number.isNaN(r.med));
  const bySoh = sohMedians
    .filter((r) => !Number.isNaN(r.med) && top)
    .map((r) => ({
      label: r.label,
      count: r.count,
      diffPct: Math.round(((r.med - top!.med) / top!.med) * 100),
    }));

  return { count: txs.length, byYear, byMileage, bySoh };
}

/** 簡易査定用：車種ごとの直近の市場水準（基準価値に対する比率の中央値） */
export function getEstimatorTable() {
  return MODELS.map((m) => {
    const txs = recentTransactions(m.id);
    return {
      id: m.id,
      label: `${m.makerName} ${m.name}`,
      yearFrom: m.yearFrom,
      yearTo: m.yearTo,
      grades: m.grades,
      degradation: m.degradation,
      marketRatio: median(txs.map((t) => t.priceManYen / t.baselineManYen)),
    };
  });
}

export type EstimatorModel = ReturnType<typeof getEstimatorTable>[number];
