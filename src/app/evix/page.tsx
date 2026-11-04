import type { Metadata } from "next";
import Link from "next/link";
import IndexChart from "@/components/IndexChart";
import { Change } from "@/components/SiteChrome";
import { getMainIndex, getSubIndexes, summarize } from "@/lib/evix";
import { formatMonth } from "@/lib/format";

export const metadata: Metadata = {
  title: "EVIX指数",
  description: "国内EVの中古相場を指数にしたEVIX（デモ）。メーカー別・地域別の値動きと計算方法を掲載。",
  alternates: { canonical: "/evix" },
};

export default function EvixPage() {
  const main = getMainIndex();
  const s = summarize(main);
  const subs = getSubIndexes();

  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav aria-label="パンくずリスト">
            <ol className="breadcrumb">
              <li>
                <Link href="/">トップ</Link>
              </li>
              <li aria-current="page">EVIX指数</li>
            </ol>
          </nav>
          <h1>EVIX指数</h1>
          <p>国内EVの中古相場を、年式・走行距離・バッテリー状態の違いをそろえて指数にしたものです。</p>
        </div>
      </div>

      <div className="container section" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section className="card-ink on-ink index-panel" aria-labelledby="evix-h">
          <div className="index-head">
            <div>
              <h2 id="evix-h" className="index-label" style={{ color: "inherit" }}>
                EVIX（{formatMonth(main[0].month)}＝100）
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
          <IndexChart series={main} seriesLabel="EVIX" variant="ink" ariaLabel="EVIX（EV中古車価格指数）の推移" />
        </section>

        <section aria-labelledby="sub-h">
          <div className="section-head">
            <h2 id="sub-h">メーカー別・地域別の指数</h2>
            <span className="fine">直近3か月の取引をもとに算出（デモデータ）</span>
          </div>
          <div className="grid grid-tiles">
            {[...subs.makers, ...subs.regions].map((x) => (
              <div key={x.key} className="tile">
                <span className="tile-name">{x.name}</span>
                <span className="tile-value num">{x.latest.toFixed(1)}</span>
                <Change pct={x.changeMoM} suffix="（前月比）" />
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20 }}>
            <Link href="/ev">車種別の相場を見る →</Link>
          </p>
        </section>

        <section className="card" aria-labelledby="how-h">
          <h2 id="how-h" style={{ fontSize: 20, marginBottom: 12 }}>
            計算方法
          </h2>
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>取引ごとに、年式・走行距離・バッテリー状態（SOH）だけで決まる「基準価値」を計算します。</li>
            <li>「実際の価格 ÷ 基準価値」を月ごとに中央値で集計します。</li>
            <li>基準月（{formatMonth(main[0].month)}）の値を 100 として指数にします。</li>
          </ol>
          <p className="fine" style={{ marginTop: 12 }}>
            車の条件の違いを取り除くので、その月にどんな車が売れたかの偏りではなく、市場全体の値動きが残ります。
            メーカー別・地域別は件数が少ないため、直近3か月分をまとめて集計し、件数が8件未満の月は公開しません。
          </p>
        </section>
      </div>
    </>
  );
}
