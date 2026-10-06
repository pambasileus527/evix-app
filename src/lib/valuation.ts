// 車両の「基準価値」：年式・走行距離・バッテリー状態だけで決まる価値。
// 指数はこの基準価値に対する実際の価格の比率で計算し、車の条件の違いを取り除く（品質調整）。

/** 1年あたりの標準走行距離（km） */
export const STANDARD_KM_PER_YEAR = 8000;

/** 年数による価値の残り方 */
export function ageFactor(ageYears: number) {
  return 0.85 * Math.exp(-0.14 * Math.max(0, ageYears));
}

/** 標準より多く走っていれば下がり、少なければ上がる */
export function mileageFactor(km: number, ageYears: number) {
  const diff = km - Math.max(0, ageYears) * STANDARD_KM_PER_YEAR;
  return clamp(1 - 0.03 * (diff / 10000), 0.75, 1.1);
}

/** バッテリー健全性（SOH, %）による補正 */
export function sohFactor(soh: number) {
  return clamp(1 - (95 - soh) * 0.012, 0.6, 1.03);
}

/** 年式・走行距離・SOH から想定される SOH（入力がないときの既定値） */
export function expectedSoh(ageYears: number, km: number, degradation: number) {
  const loss = (ageYears * 1.6 + (km / 10000) * 0.5) * degradation;
  return clamp(99 - loss, 55, 100);
}

export function baselineValueManYen(params: {
  newPriceManYen: number;
  ageYears: number;
  km: number;
  soh: number;
}) {
  const { newPriceManYen, ageYears, km, soh } = params;
  return newPriceManYen * ageFactor(ageYears) * mileageFactor(km, ageYears) * sohFactor(soh);
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
