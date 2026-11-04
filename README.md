# EVIX — EV中古車価格指数（ポートフォリオ用デモ）

国内EVの中古相場を「指数」にして公開し、EVオーナーが愛車の価値と売りどきを株価のようにチェックできるサービスのデモです。
売りたくなったときは、本人が選んだ業者（最大3社）とだけつながる買取マッチングを想定しています。

> **注意**：これはポートフォリオ用のデモです。相場データは実在の取引ではなく、プログラムで生成した架空のデータです。
> 検索エンジンに載らないよう、全ページに `noindex` を付けています。

## 開発段階

| 段階 | 内容 | 状態 |
| --- | --- | --- |
| ① | EVIX指数・車種別相場ページ・簡易査定 | このリポジトリで実装 |
| ② | 会員登録・マイカー・売りどきアラート（Supabase） | 実装済み（SQL の実行が必要。`supabase/migrations/`） |
| ③ | 売却申込・業者画面・チャット・送客料の請求（Stripe テストモード） | 予定 |

## 使っている技術

- Next.js（App Router）＋ TypeScript
- グラフは外部ライブラリを使わず SVG で描画
- ホスティング：Vercel
- ②以降：Supabase（PostgreSQL・認証、東京リージョン）
- ローカル実行：Node.js または Docker（`docker-compose.yml`）

## 手元で動かす

```bash
npm install
npm run dev
```

http://localhost:3000 を開きます。本番と同じ形で確認するときは `npm run build && npm start`。

## 構成

```
ブラウザ ──▶ Vercel（Next.js：画面）
   └──────▶ Supabase（認証・データベース・RLS）
```

## ディレクトリ構成

```
src/
  app/
    page.tsx                    トップ（EVIX指数・簡易査定・内訳指数）
    evix/page.tsx               EVIX指数（チャート・内訳・計算方法）
    ev/page.tsx                 車種一覧
    ev/[maker]/[model]/page.tsx 車種別の相場ページ（年式別・走行距離別・バッテリー状態別）
    flow/page.tsx               売却の流れ
    dealers/page.tsx            業者の方へ
    login/ signup/              ログイン・無料登録
    mycar/                      マイカー・売りどきアラート（要ログイン）
    sitemap.ts / robots.ts      サイトマップ・robots.txt
  components/
    IndexChart.tsx              指数チャート（1年・3年・5年の切り替え）
    QuickEstimate.tsx           簡易査定フォーム
    AuthForm.tsx / AuthNav.tsx  登録・ログインのフォーム／ヘッダーのログイン状態
    CarForm.tsx                 愛車の登録フォーム
    SiteChrome.tsx              デモ帯・ヘッダー・フッター
  lib/
    models.ts                   車種マスタ（優先度Aの7車種）
    valuation.ts                基準価値（年式・走行距離・SOH による価値）
    dummy.ts                    ダミー取引データの生成（乱数の種を固定）
    evix.ts                     指数・相場の集計
    mycar.ts                    マイカーの推定価値
    steps.ts                    売却の流れの文面
    supabase/                   Supabase への接続（ブラウザ用・サーバー用）
  middleware.ts                 ログイン状態の更新と、未ログイン時の /login への振り分け
supabase/migrations/            データベースの表と RLS（SQL）
documents/                      README 以外のドキュメント
docker-compose.yml              Docker での起動設定
```

## 指数の計算方法

1. 取引ごとに、年式・走行距離・バッテリー状態（SOH）だけで決まる「基準価値」を計算する（`valuation.ts`）
2. 「実際の価格 ÷ 基準価値」を月ごとに中央値で集計する
3. 基準月（2021年10月）の値を 100 として指数にする

車の条件の違いを基準価値で取り除くので、「その月にどんな車が売れたか」の偏りではなく、市場全体の値動きが残ります（品質調整）。
メーカー別・地域別・車種別の指数は件数が少ないため、直近3か月分をまとめて集計しています。件数が 8 件未満の月は公開しません。

## Vercel への公開

1. Vercel に GitHub アカウントでログインし、このリポジトリをインポートする
2. 設定はそのままで Deploy（Framework は Next.js が自動で選ばれる）
3. 公開URLが `evix-app.vercel.app` 以外になった場合は、環境変数 `NEXT_PUBLIC_SITE_URL` にそのURLを設定する（サイトマップ等に使用）

## 実運用する場合に必要なこと

要件定義書の8章（法令・コンプライアンス）と12章（ポートフォリオ版の前提条件）を参照。
実データの契約、弁護士の確認、個人情報の取り扱いの整備が必要です。

## ドキュメント

詳細は `documents/` を参照してください。

- [開発段階](./documents/開発段階.md)
- [手元での動かし方](./documents/手元での動かし方.md)（Docker は [docker-起動方法](./documents/docker-起動方法.md)）
- [システム構造と環境変数](./documents/システム構造と環境変数.md)
- [指数の計算方法](./documents/指数の計算方法.md)
- [公開手順](./documents/公開手順.md)
- [トラブルシュート](./documents/トラブルシュート.md)
- [実運用に必要なこと](./documents/実運用に必要なこと.md)
