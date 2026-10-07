"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import type { EstimatorModel } from "@/lib/evix";
import { formatYen } from "@/lib/format";
import { baselineValueManYen, expectedSoh } from "@/lib/valuation";

type Props = {
  models: EstimatorModel[];
  latestMonth: string;
  defaultModelId?: string;
};

type Result = { low: number; high: number; soh: number; sohGiven: boolean };

export default function QuickEstimate({ models, latestMonth, defaultModelId }: Props) {
  const uid = useId();
  const [latestYear, latestMon] = latestMonth.split("-").map(Number);
  const [modelId, setModelId] = useState(defaultModelId ?? models[0].id);
  const model = models.find((m) => m.id === modelId) ?? models[0];
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = Math.min(model.yearTo, latestYear); y >= model.yearFrom; y--) list.push(y);
    return list;
  }, [model, latestYear]);
  const [gradeIndex, setGradeIndex] = useState(0);
  const [year, setYear] = useState(years[Math.min(2, years.length - 1)]);
  const [km, setKm] = useState("");
  const [soh, setSoh] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  function changeModel(id: string) {
    setModelId(id);
    const next = models.find((m) => m.id === id) ?? models[0];
    const top = Math.min(next.yearTo, latestYear);
    setYear(Math.max(next.yearFrom, top - 2));
    setGradeIndex(0);
    setResult(null);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const kmNum = Number(km.replace(/[,，\s]/g, ""));
    if (!km || !Number.isFinite(kmNum) || kmNum < 0 || kmNum > 500000) {
      setError("走行距離を 0〜500,000 の数字で入力してください");
      setResult(null);
      return;
    }
    const sohNum = soh ? Number(soh) : NaN;
    if (soh && (!Number.isFinite(sohNum) || sohNum < 30 || sohNum > 100)) {
      setError("バッテリー状態（SOH）は 30〜100 の数字で入力してください");
      setResult(null);
      return;
    }
    setError("");
    const ageYears = Math.max(0.1, latestYear + (latestMon - 1) / 12 - (year + 0.5));
    const grade = model.grades[gradeIndex] ?? model.grades[0];
    const usedSoh = soh ? sohNum : expectedSoh(ageYears, kmNum, model.degradation);
    const center =
      baselineValueManYen({ newPriceManYen: grade.newPriceManYen, ageYears, km: kmNum, soh: usedSoh }) *
      model.marketRatio;
    setResult({ low: center * 0.93, high: center * 1.07, soh: Math.round(usedSoh), sohGiven: !!soh });
  }

  return (
    <form className="estimator" onSubmit={submit} aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} style={{ fontSize: 18, fontFamily: "inherit" }}>
        愛車の価値をチェック
      </h2>
      <div className="field">
        <label htmlFor={`${uid}-model`}>車種</label>
        <select id={`${uid}-model`} value={modelId} onChange={(e) => changeModel(e.target.value)}>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor={`${uid}-grade`}>グレード</label>
          <select
            id={`${uid}-grade`}
            value={gradeIndex}
            onChange={(e) => {
              setGradeIndex(Number(e.target.value));
              setResult(null);
            }}
          >
            {model.grades.map((g, i) => (
              <option key={g.name} value={i}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${uid}-year`}>年式</label>
          <select
            id={`${uid}-year`}
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setResult(null);
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor={`${uid}-km`}>走行距離（km）</label>
          <input
            id={`${uid}-km`}
            inputMode="numeric"
            placeholder="例：35000"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            aria-describedby={error ? `${uid}-error` : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor={`${uid}-soh`}>バッテリー状態 SOH（%）</label>
          <input
            id={`${uid}-soh`}
            inputMode="numeric"
            placeholder="任意。例：90"
            value={soh}
            onChange={(e) => setSoh(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <p id={`${uid}-error`} role="alert" className="fine" style={{ color: "var(--down)" }}>
          {error}
        </p>
      )}
      <button type="submit" className="btn">
        愛車の価値を見る
      </button>
      <div aria-live="polite">
        {result && (
          <div className="estimate-result">
            <p className="fine">推定価値（参考値・デモデータ）</p>
            <p className="amount num">
              {formatYen(result.low)} 〜 {formatYen(result.high)}
            </p>
            <p className="fine">
              {result.sohGiven
                ? `SOH ${result.soh}% として計算しました。`
                : `SOH は年式と走行距離から ${result.soh}% と仮定しました。入力するとより正確になります。`}
            </p>
          </div>
        )}
      </div>
      <p className="fine" style={{ textAlign: "center" }}>
        登録不要・業者から電話はかかってきません
      </p>
    </form>
  );
}
