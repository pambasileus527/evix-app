"use client";

import { useId, useMemo, useState } from "react";
import { MODELS } from "@/lib/models";

export default function CarForm({
  action,
  latestYear,
}: {
  action: (formData: FormData) => void | Promise<void>;
  latestYear: number;
}) {
  const uid = useId();
  const [modelId, setModelId] = useState(MODELS[0].id);
  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = Math.min(model.yearTo, latestYear); y >= model.yearFrom; y--) list.push(y);
    return list;
  }, [model, latestYear]);

  return (
    <form action={action} className="card car-form" aria-labelledby={`${uid}-t`}>
      <h2 id={`${uid}-t`} style={{ fontSize: 20 }}>
        愛車を登録
      </h2>
      <div className="field">
        <label htmlFor={`${uid}-m`}>車種</label>
        <select id={`${uid}-m`} name="model_id" value={modelId} onChange={(e) => setModelId(e.target.value)}>
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.makerName} {m.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor={`${uid}-g`}>グレード</label>
          <select id={`${uid}-g`} name="grade_index" key={model.id} defaultValue="0">
            {model.grades.map((g, i) => (
              <option key={g.name} value={i}>
                {g.name}（{g.batteryKwh}kWh）
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${uid}-y`}>年式</label>
          <select id={`${uid}-y`} name="year" key={`y-${model.id}`} defaultValue={years[Math.min(2, years.length - 1)]}>
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
          <label htmlFor={`${uid}-k`}>走行距離（km）</label>
          <input id={`${uid}-k`} name="km" inputMode="numeric" required placeholder="例：32000" />
        </div>
        <div className="field">
          <label htmlFor={`${uid}-s`}>バッテリー状態 SOH（％）</label>
          <input id={`${uid}-s`} name="soh" inputMode="numeric" placeholder="わかれば入力" />
          <span className="hint">空欄なら年式・走行距離から推定します</span>
        </div>
      </div>
      <button className="btn" type="submit">
        登録する
      </button>
    </form>
  );
}
