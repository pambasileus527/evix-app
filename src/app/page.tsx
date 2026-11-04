import Link from "next/link";
import IndexChart from "@/components/IndexChart";
import QuickEstimate from "@/components/QuickEstimate";
import { Change } from "@/components/SiteChrome";
import { getEstimatorTable, getMainIndex, getSubIndexes, summarize } from "@/lib/evix";
import { formatMonth } from "@/lib/format";
import { STEPS } from "@/lib/steps";

export default function HomePage() {
  const main = getMainIndex();
  const s = summarize(main);
  const subs = getSubIndexes();
  const estimator = getEstimatorTable();

  return (
    <>
      <section className="hero">
        <div className="container inner">
          <div className="hero-copy">
            <p className="eyebrow">EVオーナーのための相場アプリ</p>
            <h1>
              愛車のEV、
              <br />
              今いくら？
            </h1>
            <p className="hero-lead">
              国内EVの中古相場を指数にして公開。愛車の価値と売りどきを、株価のようにチェックできます。
            </p>
            <QuickEstimate models={estimator} latestMonth={s.latestMonth} />
          </div>

          <div id="index" className="index-panel card-ink on-ink">
            <div className="index-head">
              <div>
                <p className="index-label">EVIX　EV中古車価格指数（{formatMonth(main[0].month)}＝100）</p>
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
              series={main}
              seriesLabel="EVIX"
              variant="ink"
              ariaLabel="EVIX（EV中古車価格指数）の推移"
            />
            <p className="chart-note">
              年式・走行距離・バッテリー状態の違いをそろえて比べた、中古EV価格の値動きです（{formatMonth(s.latestMonth)}時点）。
            </p>
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container">
          <div className="section-head">
            <h2>メーカー別・地域別の指数</h2>
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
        </div>
      </section>

      <section className="section reveal">
        <div className="container">
          <h2 style={{ marginBottom: 20 }}>売らなくても、毎月見たくなる</h2>
          <div className="grid grid-3">
            <div className="card feature">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#1F5BD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 28 L13 18 L19 23 L31 9" />
                <path d="M5 32 H31" />
              </svg>
              <h3>EVIX指数</h3>
              <p>国内EVの中古相場を指数化。メーカー別・車種別・地域別の値動きを、登録なしで誰でも見られます。</p>
            </div>
            <div className="card feature">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#1F5BD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="9" width="26" height="20" rx="3" />
                <path d="M5 15 H31" />
                <path d="M11 22 H19" />
              </svg>
              <h3>マイカー・ポートフォリオ</h3>
              <p>愛車を登録すると、推定価値・購入時からの増減・指数との比較が一目でわかります（第2段階で公開予定）。</p>
            </div>
            <div className="card feature">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#1F5BD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 25 V16 a8 8 0 0 1 16 0 V25 l3 3 H7 Z" />
                <path d="M15 31 a3 3 0 0 0 6 0" />
              </svg>
              <h3>売りどきアラート</h3>
              <p>目標額に届いたとき、相場が大きく動いたとき、車検の3か月前にお知らせします（第2段階で公開予定）。</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="section section-white reveal">
        <div className="container">
          <h2>売りたくなったら、業者は自分で選ぶ</h2>
          <p className="fine" style={{ margin: "8px 0 24px", fontSize: 16 }}>
            一括査定のように、申し込んだ直後に電話が鳴り続けることはありません。
          </p>
          <ol className="steps">
            {STEPS.map((st, i) => (
              <li key={st.title} className={st.key ? "key" : undefined}>
                <span className="step-no num">STEP {i + 1}</span>
                <span className="step-title">{st.title}</span>
                <span className="step-body">{st.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="dealer" className="section reveal">
        <div className="container">
          <div className="cta">
            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              <p className="eyebrow">買取店・販売店の方へ</p>
              <h2 style={{ fontSize: 26, marginBottom: 8 }}>売る気の高いEVオーナーと出会えます</h2>
              <p>
                バッテリー情報つきの車両データで概算入札。選ばれた案件だけ商談できます。参加には古物商許可が必要です。
              </p>
            </div>
            <span className="btn btn-light" aria-disabled="true">
              業者向け機能は第3段階で公開予定
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
