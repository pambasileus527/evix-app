import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "業者の方へ",
  description: "買取店・販売店の方へ。バッテリー情報つきの車両データで概算入札できる仕組み（デモ）。",
  alternates: { canonical: "/dealers" },
};

export default function DealersPage() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav aria-label="パンくずリスト">
            <ol className="breadcrumb">
              <li>
                <Link href="/">トップ</Link>
              </li>
              <li aria-current="page">業者の方へ</li>
            </ol>
          </nav>
          <h1>業者の方へ</h1>
          <p>売る気の高いEVオーナーと出会えます。</p>
        </div>
      </div>

      <div className="container section" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section className="card" aria-labelledby="d-h">
          <h2 id="d-h" style={{ fontSize: 20, marginBottom: 12 }}>
            できること
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>バッテリー状態（SOH）や写真つきの車両データを見て、概算額を入札できます。</li>
            <li>オーナーに選ばれた案件だけ、連絡先が開示されて商談できます。</li>
            <li>成約したときだけ、送客料をいただきます。</li>
          </ul>
          <p className="fine" style={{ marginTop: 12 }}>
            参加には古物商許可が必要です。業者向けの機能は第3段階で公開予定です。
          </p>
        </section>
        <p>
          <Link href="/flow">売却の流れを見る →</Link>
        </p>
      </div>
    </>
  );
}
