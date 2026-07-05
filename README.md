# LINE bot + AI自動応答ツール

Next.js (App Router) + TypeScript + Tailwind CSS。LINE Messaging APIとClaude APIを使い、頻出質問へのAI自動応答と、オーナー向けのスマホ管理画面を提供する。

オーナー様向けの使い方は [`docs/オーナー向けマニュアル.md`](./docs/オーナー向けマニュアル.md) を参照。

## 開発環境

```bash
npm install
npm run dev
```

`http://localhost:3000/admin` で管理画面にアクセスできる（`/` は `/admin` にリダイレクトされる）。

## 環境変数

`.env.example` を `.env.local` にコピーして値を設定する。

```bash
cp .env.example .env.local
```

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: Supabaseプロジェクトの設定から取得
- `ADMIN_ID` / `ADMIN_PASSWORD_HASH`: 管理画面ログイン用。パスワードはbcryptハッシュで保存する
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('設定したいパスワード', 10))"
  ```
- `SESSION_SECRET`: `openssl rand -base64 32` などで生成
- `APP_URL`: デプロイ後の本番URL

LINEチャネルシークレット／アクセストークン、Claude APIキーは環境変数ではなく、ログイン後の `/admin/settings` 画面からデータベース（`app_settings`テーブル）に保存する。オーナーがVercelにアクセスできなくても、トークン再発行時に管理画面から更新できるようにするための設計。

## データベース

`supabase/migrations/0001_init.sql` をSupabaseのSQL Editorで実行する。テーブルはRLSを有効化しポリシーを追加していない（サーバー側の`service_role`キーのみがアクセスする設計のため）。

## デプロイ

1. Supabaseプロジェクトを作成し、マイグレーションSQLを実行
2. GitHubにpushし、Vercelにインポート（環境変数を設定）
3. デプロイ後、LINE Developersコンソールで Webhook URL (`https://<domain>/api/line/webhook`) を設定・有効化
4. `/admin/settings` にログインし、LINE認証情報とClaude APIキーを入力
5. オーナー登録用コードを発行し、オーナー自身のLINEから送信してオーナーID登録を完了させる

詳細な手順は [`docs/オーナー向けマニュアル.md`](./docs/オーナー向けマニュアル.md) を参照。

## 主要な技術構成

- `app/api/line/webhook/route.ts`: LINE Webhook受信（署名検証・AI応答・エスカレーション）
- `lib/ai/responder.ts`: Claude APIによるFAQ回答ロジック（forced tool-use）
- `lib/auth/`: 管理画面のセッション認証（`jose`によるCookieセッション）
- `proxy.ts`: `/admin/*` の楽観的な認証チェック（Next.js 16の`middleware.ts`の後継）
- `app/admin/(authenticated)/`: 管理画面本体（ダッシュボード・FAQ管理・配信・設定）
