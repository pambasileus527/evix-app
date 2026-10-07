import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import IndexChart from "@/components/IndexChart";
import QuickEstimate from "@/components/QuickEstimate";
import { Change } from "@/components/SiteChrome";
import {
  getEstimatorTable,
  getMainIndex,
  getModelIndex,
  getModelStats,
  summarize,
  type PriceRow,
} from "@/lib/evix";
import { formatMonth } from "@/lib/format";
import { displayName, findModel, MODELS, modelPath } from "@/lib/models";
import { SITE_URL } from "@/lib/site";

type Params = { maker: string; model: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return MODELS.map((m) => ({ maker: m.makerSlug, model: m.modelSlug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { maker, model } = await params;
  const m = findModel(maker, model);
  if (!m) return {};
  const name = displayName(m);
  return {
    title: `${name}の中古車相場`,
    description: `${name}の中古車相場を年式・走行距離・バッテリー状態別に掲載。相場の推移を指数で確認できます（デモデータ）。`,
    alternates: { canonical: modelPath(m) },
  };
}

function PriceTable({ caption, rows, firstCol }: { caption: string; rows: PriceRow[]; firstCol: string }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{firstCol}</th>
            <th scope="col">安め（下位25%）</th>
            <th scope="col">中央値</th>
            <th scope="col">高め（上位25%）</th>
            <th scope="col">件数</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" style={{ fontWeight: 400 }}>
                {r.label}
              </th>
              <td className="num">{r.p25}万円</td>
              <td className="num" style={{ fontWeight: 600 }}>
                {r.median}万円
              </td>
              <td className="num">{r.p75}万円</td>
              <td className="num">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ModelPage({ params }: { params: Promise<Params> }) {
  const { maker, model } = await params;
  const m = findModel(maker, model);
  if (!m) notFound();

  const name = displayName(m);
  const series = getModelIndex(m.id);
  const s = summarize(series);
  const stats = getModelStats(m);
  const estimator = getEstimatorTable();
  const main = getMainIndex();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "車種別相場", item: `${SITE_URL}/ev` },
      { "@type": "ListItem", position: 3, name, item: `${SITE_URL}${modelPath(m)}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="page-head">
        <div className="container">
          <nav aria-label="パンくずリスト">
            <ol className="breadcrumb">
              <li>
                <Link href="/">トップ</Link>
              </li>
              <li>
                <Link href="/ev">車種別相場</Link>
              </li>
              <li aria-current="page">{name}</li>
            </ol>
          </nav>
          <h1>{name}の中古車相場</h1>
          <p>
            {m.note ? `${m.note}・` : ""}
            {m.yearFrom}〜{m.yearTo}年式　{formatMonth(s.latestMonth)}時点・直近3か月の取引{stats.count}件（デモデータ）
          </p>
        </div>
      </div>

      <div className="container section two-col">
        <div className="main" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section className="card" aria-labelledby="idx-h">
            <div className="index-head">
              <div>
                <h2 id="idx-h" className="index-label" style={{ color: "var(--muted)" }}>
                  {m.name}の指数（{formatMonth(series[0].month)}＝100）
                </h2>
                <p className="index-value num">{s.latest.toFixed(1)}</p>
                <p style={{ margin: 0 }}>
                  <Change pct={s.changeMoM} suffix="（前月比）" />
                  <span aria-hidden="true">　</span>
                  <Change pct={s.changeYoY} suffix="（前年同月比）" />
                </p>
              </div>
              <span className="badge">デモデータ</span>
            </div>
            <IndexChart
              series={series}
              seriesLabel={`${m.name}の指数`}
              compare={{ label: "EVIX（全体）", series: main }}
              ariaLabel={`${name}の指数とEVIX全体の推移`}
            />
          </section>

          <section className="card" aria-labelledby="year-h">
            <h2 id="year-h" style={{ fontSize: 20, marginBottom: 12 }}>
              年式別の相場
            </h2>
            <PriceTable caption={`${name}の年式別の相場`} rows={stats.byYear} firstCol="年式" />
          </section>

          <section className="card" aria-labelledby="km-h">
            <h2 id="km-h" style={{ fontSize: 20, marginBottom: 12 }}>
              走行距離別の相場
            </h2>
            <PriceTable caption={`${name}の走行距離別の相場`} rows={stats.byMileage} firstCol="走行距離" />
          </section>

          <section className="card" aria-labelledby="soh-h">
            <h2 id="soh-h" style={{ fontSize: 20, marginBottom: 4 }}>
              バッテリー状態による価格差
            </h2>
            <p className="fine" style={{ marginBottom: 12 }}>
              年式・走行距離の違いをそろえたうえで、いちばん状態の良い区分と比べた価格差です。
            </p>
            <div className="table-wrap">
              <table className="data">
                <caption className="visually-hidden">{name}のバッテリー状態による価格差</caption>
                <thead>
                  <tr>
                    <th scope="col">バッテリー状態</th>
                    <th scope="col">価格差</th>
                    <th scope="col">件数</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.bySoh.map((r) => (
                    <tr key={r.label}>
                      <th scope="row" style={{ fontWeight: 400 }}>
                        {r.label}
                      </th>
                      <td className="num">{r.diffPct === 0 ? "基準" : `${r.diffPct}%`}</td>
                      <td className="num">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="side">
          <div style={{ position: "relative" }}>
            <QuickEstimate models={estimator} latestMonth={s.latestMonth} defaultModelId={m.id} />
          </div>
          <div className="card" style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>ほかの車種</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {MODELS.filter((x) => x.id !== m.id).map((x) => (
                <li key={x.id}>
                  <Link href={modelPath(x)}>{displayName(x)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
