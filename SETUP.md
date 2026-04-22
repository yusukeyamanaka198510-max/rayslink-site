# Our Wedding Project V2 — セットアップ手順

## 1. Supabase プロジェクト作成

1. https://supabase.com でプロジェクトを作成
2. Settings → API から以下を取得:
   - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY

## 2. データベース初期化

Supabase Dashboard → SQL Editor で `supabase/schema.sql` の内容を実行

## 3. 環境変数設定

`.env.local` を作成:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

## 4. 起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス

## 機能一覧

| ページ | URL | 機能 |
|--------|-----|------|
| ダッシュボード | / | 全体サマリー、期日近いタスク |
| タスク | /tasks | タスク作成・編集・ステータス管理 |
| 個人タスク | /tasks/山中 | メンバー別タスク一覧 |
| 議事録 | /minutes | 議事録作成、決定事項→タスク変換 |
| 予算 | /budget | 収支管理スプレッドシート |
| コンテンツ | /contents | パーティーコンテンツ管理 |
| タイムテーブル | /timetable | 時系列スケジュール |
| 台本 | /script | 司会台本自動生成 |
