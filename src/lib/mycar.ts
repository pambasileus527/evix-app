import type { EstimatorModel } from "@/lib/evix";
import { baselineValueManYen, expectedSoh } from "@/lib/valuation";

export type CarRow = {
  id: string;
  model_id: string;
  grade_index: number;
  year: number;
  km: number;
  soh: number | null;
};

export type AlertRow = {
  id: string;
  car_id: string;
  direction: "above" | "below";
  threshold_man_yen: number;
};

/** 登録した車の推定価値（万円）。簡易査定と同じ計算。 */
export function estimateCar(model: EstimatorModel, car: CarRow, latestMonth: string) {
  const [latestYear, latestMon] = latestMonth.split("-").map(Number);
  const ageYears = Math.max(0.1, latestYear + (latestMon - 1) / 12 - (car.year + 0.5));
  const grade = model.grades[car.grade_index] ?? model.grades[0];
  const soh = car.soh ?? expectedSoh(ageYears, car.km, model.degradation);
  const center =
    baselineValueManYen({ newPriceManYen: grade.newPriceManYen, ageYears, km: car.km, soh }) *
    model.marketRatio;
  return { center, low: center * 0.93, high: center * 1.07, soh: Math.round(soh), gradeName: grade.name };
}
