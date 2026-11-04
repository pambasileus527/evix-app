# Docker での起動方法（EVIX）

開発用に `docker compose` で Next.js の開発サーバーを起動する手順です。
Node.js を Mac に入れていなくても動かせます（入れてある場合は `npm run dev` のほうが速いです）。

## 前提

- Docker Desktop がインストール済みで、起動していること（メニューバーにクジラのアイコンが出ていればOK）
- プロジェクトのルートに `.env.local` があること（Supabase の接続情報。`.env.example` を参考に作成）

## 起動

```bash
cd /Users/traveler/Desktop/works/evix-app
docker compose up
```

- 初回は `npm install` が走るので数分かかります。
- ターミナルに `Ready` と表示されたら、ブラウザで http://localhost:3000 を開きます。

バックグラウンドで起動したい場合：

```bash
docker compose up -d
docker compose logs -f web   # ログを見る
```

## 停止

```bash
docker compose down          # 停止（Ctrl+C でも可）
```

`node_modules` 用のボリュームごと消してやり直したいとき：

```bash
docker compose down -v
```

## 構成のメモ

- イメージ：`node:22-alpine`（`docker-compose.yml` の `web` サービス）
- ポート：`3000:3000`
- プロジェクトのフォルダをコンテナの `/app` にマウントしているため、コードを編集するとすぐ反映されます
- `WATCHPACK_POLLING=true` で、Mac の Docker でもファイル変更を検知できるようにしています
- `node_modules` は Docker のボリュームに分けてあり、Mac 側のフォルダとは別です

## うまくいかないとき

| 症状 | 対処 |
| --- | --- |
| `Cannot connect to the Docker daemon` | Docker Desktop を起動してから再実行 |
| `port is already allocated`（3000番が使用中） | `npm run dev` など他のサーバーを止める |
| 依存関係がおかしい | `docker compose down -v` のあと `docker compose up` |
| Supabase 関連のエラー | `.env.local` の値を確認 |
