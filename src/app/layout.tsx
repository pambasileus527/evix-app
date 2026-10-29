import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_JP, Zen_Kaku_Gothic_New } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const body = IBM_Plex_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-body",
  display: "swap",
});

const display = Zen_Kaku_Gothic_New({
  weight: ["700", "900"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EVIX — EV中古車価格指数（デモ）",
    template: "%s | EVIX（デモ）",
  },
  description:
    "国内EVの中古相場を指数にして公開。愛車の価値と売りどきを株価のようにチェックできるサービスのポートフォリオ用デモです。",
  // デモのため検索エンジンに登録させない（要件定義書 12章）
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
