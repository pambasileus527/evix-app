# EVIX — EV中古車価格指数（ポートフォリオ用デモ）

国内EVの中古相場を「指数」にして公開し、EVオーナーが愛車の価値と売りどきを株価のようにチェックできるサービスのデモです。
売りたくなったときは、本人が選んだ業者（最大3社）とだけつながる買取マッチングを想定しています。

> **注意**：これはポートフォリオ用のデモです。相場データは実在の取引ではなく、プログラムで生成した架空のデータです。

## 使っている技術

- Next.js（App Router）＋ TypeScript
- グラフは外部ライブラリを使わず SVG で描画
- Supabase（PostgreSQL・認証、東京リージョン）
- ホスティング：Vercel
- ローカル実行：Node.js または Docker（`docker-compose.yml`）

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
    ev/[maker]/[model]/page.tsx 車種別の相場ページ
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
    SiteChrome.tsx              ヘッダー・フッター
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

## ドキュメント

詳細は `documents/` を参照してください。

- [開発段階](./documents/開発段階.md)
- [手元での動かし方](./documents/手元での動かし方.md)（Docker は [docker-起動方法](./documents/docker-起動方法.md)）
- [システム構造と環境変数](./documents/システム構造と環境変数.md)
- [指数の計算方法](./documents/指数の計算方法.md)
- [公開手順](./documents/公開手順.md)
- [トラブルシュート](./documents/トラブルシュート.md)
- [実運用に必要なこと](./documents/実運用に必要なこと.md)
