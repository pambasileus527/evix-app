import type { Metadata } from "next";
import Link from "next/link";
import CarForm from "@/components/CarForm";
import { Change } from "@/components/SiteChrome";
import { getEstimatorTable, getMainIndex, getModelIndex, summarize } from "@/lib/evix";
import { formatManYen, formatMonth } from "@/lib/format";
import { MODELS, displayName, modelPath } from "@/lib/models";
import { estimateCar, type AlertRow, type CarRow } from "@/lib/mycar";
import { createClient } from "@/lib/supabase/server";
import { addAlert, addCar, deleteAlert, deleteCar } from "./actions";

export const metadata: Metadata = { title: "マイカー" };
export const dynamic = "force-dynamic";

export default async function MyCarPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: carsData }, { data: alertsData }] = await Promise.all([
    supabase.from("cars").select("id, model_id, grade_index, year, km, soh").order("created_at"),
    supabase.from("alerts").select("id, car_id, direction, threshold_man_yen").order("created_at"),
  ]);
  const cars = (carsData ?? []) as CarRow[];
  const alerts = (alertsData ?? []) as AlertRow[];

  const table = getEstimatorTable();
  const latestMonth = summarize(getMainIndex()).latestMonth;
  const latestYear = Number(latestMonth.slice(0, 4));

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>マイカー</h1>
          <p>{formatMonth(latestMonth)}時点の推定価値（デモデータ）　{user?.email}</p>
        </div>
      </div>
      <div className="container section" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}

        {cars.length === 0 && (
          <p className="card">まだ車が登録されていません。下のフォームから愛車を登録すると、推定価値と相場の動きが見られます。</p>
        )}

        {cars.map((car) => {
          const model = MODELS.find((m) => m.id === car.model_id);
          const est = table.find((t) => t.id === car.model_id);
          if (!model || !est) return null;
          const r = estimateCar(est, car, latestMonth);
          const s = summarize(getModelIndex(model.id));
          const carAlerts = alerts.filter((a) => a.car_id === car.id);
          return (
            <section key={car.id} className="card" aria-label={displayName(model)}>
              <div className="index-head">
                <div>
                  <h2 style={{ fontSize: 20 }}>
                    <Link href={modelPath(model)}>{displayName(model)}</Link>
                  </h2>
                  <p className="fine">
                    {r.gradeName}・{car.year}年式・{car.km.toLocaleString("ja-JP")}km・SOH {r.soh}%
                    {car.soh === null ? "（推定）" : ""}
                  </p>
                  <p className="index-value num" style={{ margin: "8px 0 0" }}>
                    {formatManYen(r.low)}〜{formatManYen(r.high)}
                  </p>
                  <p style={{ margin: 0 }}>
                    <span className="fine">この車種の相場　</span>
                    <Change pct={s.changeMoM} suffix="（前月比）" />
                    <span aria-hidden="true">　</span>
                    <Change pct={s.changeYoY} suffix="（前年同月比）" />
                  </p>
                </div>
                <form action={deleteCar}>
                  <input type="hidden" name="car_id" value={car.id} />
                  <button className="btn-link" type="submit">
                    この車を削除
                  </button>
                </form>
              </div>

              <h3 style={{ fontSize: 16, margin: "20px 0 8px" }}>売りどきアラート</h3>
              {carAlerts.length === 0 ? (
                <p className="fine">条件を決めておくと、推定価値がその金額を超えた（下回った）ときに知らせます。</p>
              ) : (
                <ul className="alert-list">
                  {carAlerts.map((a) => {
                    const hit = a.direction === "above" ? r.center >= a.threshold_man_yen : r.center <= a.threshold_man_yen;
                    return (
                      <li key={a.id}>
                        <span>
                          推定価値が {a.threshold_man_yen.toLocaleString("ja-JP")}万円{" "}
                          {a.direction === "above" ? "以上" : "以下"}になったら
                          {hit && <strong className="alert-hit"> ← 今の条件に当てはまっています</strong>}
                        </span>
                        <form action={deleteAlert}>
                          <input type="hidden" name="alert_id" value={a.id} />
                          <button className="btn-link" type="submit">
                            削除
                          </button>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              )}
              <form action={addAlert} className="field-row alert-form">
                <input type="hidden" name="car_id" value={car.id} />
                <div className="field">
                  <label htmlFor={`d-${car.id}`}>条件</label>
                  <select id={`d-${car.id}`} name="direction" defaultValue="above">
                    <option value="above">以上になったら</option>
                    <option value="below">以下になったら</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor={`t-${car.id}`}>推定価値（万円）</label>
                  <input
                    id={`t-${car.id}`}
                    name="threshold"
                    inputMode="numeric"
                    required
                    defaultValue={Math.round(r.center)}
                  />
                </div>
                <button className="btn" type="submit" style={{ alignSelf: "flex-end" }}>
                  追加
                </button>
              </form>
            </section>
          );
        })}

        <CarForm action={addCar} latestYear={latestYear} />

        <p className="fine">
          アラートの通知メールは、デモでは送りません。条件に当てはまると、この画面に表示されます。
        </p>
      </div>
    </>
  );
}
