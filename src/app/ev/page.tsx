import type { Metadata } from "next";
import Link from "next/link";
import { Change } from "@/components/SiteChrome";
import { getModelIndex, getModelStats, summarize } from "@/lib/evix";
import { MAKERS, MODELS, modelPath } from "@/lib/models";

export const metadata: Metadata = {
  title: "車種別の中古EV相場",
  description: "日産サクラ、リーフ、アリア、テスラ Model 3 / Model Y など、車種別の中古EV相場と指数（デモ）。",
};

export default function EvListPage() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav aria-label="パンくずリスト">
            <ol className="breadcrumb">
              <li>
                <Link href="/">トップ</Link>
              </li>
              <li aria-current="page">車種別相場</li>
            </ol>
          </nav>
          <h1>車種別の中古EV相場</h1>
          <p>年式・走行距離・バッテリー状態ごとの価格の目安と、車種ごとの指数を見られます。</p>
        </div>
      </div>

      <div className="container section">
        {MAKERS.map((maker) => (
          <section key={maker.slug} style={{ marginBottom: 36 }} aria-labelledby={`maker-${maker.slug}`}>
            <h2 id={`maker-${maker.slug}`} style={{ fontSize: 22, marginBottom: 14 }}>
              {maker.name}
            </h2>
            <div className="grid grid-tiles">
              {MODELS.filter((m) => m.makerSlug === maker.slug).map((m) => {
                const s = summarize(getModelIndex(m.id));
                const stats = getModelStats(m);
                const median = stats.byYear[Math.min(2, stats.byYear.length - 1)];
                return (
                  <Link key={m.id} href={modelPath(m)} className="tile">
                    <span className="tile-name">
                      {m.name}
                      {m.note ? `（${m.note}）` : ""}
                    </span>
                    <span className="tile-value num">{s.latest.toFixed(1)}</span>
                    <Change pct={s.changeMoM} suffix="（前月比）" />
                    {median && (
                      <span className="fine">
                        {median.label}の中央値 {median.median}万円
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
        <p className="fine">指数は車種ごとに、データのある最初の月を100としています（デモデータ）。</p>
      </div>
    </>
  );
}
