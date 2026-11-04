import type { Metadata } from "next";
import Link from "next/link";
import { STEPS } from "@/lib/steps";

export const metadata: Metadata = {
  title: "売却の流れ",
  description: "売りたくなったら、業者は自分で選ぶ。売却申込から商談までの流れ（デモ）。",
  alternates: { canonical: "/flow" },
};

export default function FlowPage() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav aria-label="パンくずリスト">
            <ol className="breadcrumb">
              <li>
                <Link href="/">トップ</Link>
              </li>
              <li aria-current="page">売却の流れ</li>
            </ol>
          </nav>
          <h1>売却の流れ</h1>
          <p>一括査定のように、申し込んだ直後に電話が鳴り続けることはありません。</p>
        </div>
      </div>

      <div className="container section">
        <ol className="steps">
          {STEPS.map((st, i) => (
            <li key={st.title} className={st.key ? "key" : undefined}>
              <span className="step-no num">STEP {i + 1}</span>
              <span className="step-title">{st.title}</span>
              <span className="step-body">{st.body}</span>
            </li>
          ))}
        </ol>
        <p className="fine" style={{ marginTop: 24 }}>
          売却の申込・業者とのやり取りは第3段階で公開予定です。まずは <Link href="/mycar">マイカー</Link> に愛車を登録して、推定価値を確認できます。
        </p>
      </div>
    </>
  );
}
