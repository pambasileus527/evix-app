import Link from "next/link";
import AuthNav from "@/components/AuthNav";
import { formatChange } from "@/lib/format";

export function DemoBanner() {
  return (
    <div className="demo-banner" role="note">
      これはポートフォリオ用のデモです。表示される相場・指数・業者はすべて架空のデータです。
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand" aria-label="EVIX トップページ">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            stroke="#7FB0FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 21 L10 13 L15 17 L25 6" />
            <path d="M19 6 H25 V12" />
          </svg>
          <span>
            <span className="brand-name">EVIX</span>
            <br />
            <span className="brand-sub">EV中古車価格指数</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="メインメニュー">
          <Link href="/evix">EVIX指数</Link>
          <Link href="/ev">車種別相場</Link>
          <Link href="/flow">売却の流れ</Link>
          <Link href="/dealers">業者の方へ</Link>
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container inner">
        <p>推定価格・指数は参考値です。実際の買取額は現車確認により決まります。</p>
        <p>自動車は金融商品ではありません。将来の値上がりを保証するものではありません。</p>
        <p>
          本サイトはポートフォリオ用のデモです。相場データは実在の取引ではなく、プログラムで生成した架空のデータです。
        </p>
        <p>© EVIX（仮称）</p>
      </div>
    </footer>
  );
}

export function Change({ pct, suffix }: { pct: number; suffix?: string }) {
  const c = formatChange(pct);
  return (
    <span className={`change num ${c.tone === "flat" ? "" : c.tone}`}>
      {c.text}
      {suffix}
    </span>
  );
}
