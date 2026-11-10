# 株式会社Rays link 公式サイト（Astro + TypeScript）
公開URL：https://rayslink-site.vercel.app （Vercel。`master` へのマージで本番に自動デプロイ）

```bash
npm install && npm run dev   # 開発
npm run build                # ビルド（@astrojs/vercel。/api/contact はサーバーレス関数）
```
環境変数は `.env.example` を参照（本番は Vercel の Settings → Environment Variables）。

## 設定待ち・残課題
1. **お問い合わせメール**：Vercel（Production）に `SMTP_USER` / `SMTP_PASS`（Gmailアプリパスワード）/ `CONTACT_TO`（rayslink.costmer@gmail.com）を設定済み。**実送信テストは未実施**（本番で送信→管理者通知と自動返信の到着を確認する）。独自ドメイン取得後は Resend（`RESEND_API_KEY` / `CONTACT_FROM`）へ切り替え可能。
2. **ロゴ**：組み込み済み（原本は `design-assets/logos-original/`）。「横・白」は、送付ファイルの透過情報が失われ形が残っていなかったため、横・黒と同じ形から色だけ白にした `public/logos/logo-horizontal-white.png` を使用（現デザインでは未使用）。ブラウザのタブ等のアイコン（`public/icon-*.png`・`favicon.ico`・`apple-touch-icon.png`）は、公式ロゴ（縦・ネイビー／縦・白）の円のマーク部分のみを切り出したもの（描き直しなし）。
3. **写真素材**（TOPのファーストビュー右側には、公式ロゴのマークを薄いエンボスで重ねている。型紙は `public/images/mark-mask.webp`＝公式ロゴ（縦・白）のマーク部分を滑らかに拡大したもの。描き直しなし）：TOPのファーストビュー背景（夕日と雲海）は提供写真（`public/images/hero.webp`、1795×876）を使用。下端のネイビーはサイトのネイビーと同色で、下の曲線と連続する（差し替える場合は同じ仕様で）。TOPの企業理念セクションの写真（青空を見上げる若い男女。生成画像）は `public/images/philosophy.webp`（`images.philosophy`）。ほかは**仮イラスト**のまま：企業理念ページ上部は `images.philosophyPage`（`public/images/philosophy-sunrise.svg`）、事業4領域：TOPの事業内容カードは提供のイメージ画像（`public/images/biz-*.webp`、`topPhoto`）、事業内容ページは仮イラストのまま（`photo` / `photoPlaceholder` を差し替える）。実在しない施設・看板の写真は使わない。
4. **事業説明文・URL**：事業主提供の内容を反映済み（`src/data/business.ts`）。Elcami・BRUMMELL は「不要」との指示で掲載しない。Web・システム関連は公式URLなし。K-shotの「日本最多級」（最上級に近い表現のため根拠は事業主が保持）、The Villa LinoのURL（Booking.comの計測パラメータを除去）は公開前に要確認。ニュース欄は作らない。
5. **プライバシーポリシー**：2026年11月10日制定（`src/pages/privacy.astro`）。確定原稿をもとに、第1・4・6・8条は実際のサイト運用（取得情報、利用する外部サービス＝Vercel／Gmail／Google Fonts、保存先＝メールのみ、Cookie・解析ツールなし）に合わせて記載。運用を変えた場合（解析ツール導入、フォーム送信先・メールサービス変更、データベース保存の追加など）は、必ず本ページも更新する。
6. **ドメイン**：現在は無料の `rayslink-site.vercel.app`。独自ドメイン取得後は Vercel の Domains に追加し、`SITE_URL` を設定。
7. **OGP画像**：仮SVG（SNSによってはPNG/JPGが必要）。
8. レート制限は単一インスタンスのメモリ内。多重化時は外部ストアへ。

## デザインの比率（黄金比）
全ページ共通で、黄金比（φ=1.618）を取り込んでいる（`src/styles/global.css` 末尾の「黄金比」ブロック、`src/components/Curve.astro`）。
- 文字：√φ（1.272）刻みの段階。HEROは見出しを基準に、一笑懸命＝÷φ²、キャッチコピー＝÷φ³、説明文＝÷φ⁴。
- 余白：フィボナッチ数（8・13・21・34・55・89・144px）。
- レイアウト：2列は 1.618:1。事業内容カードは幅1:高さ1.618（タブレット・スマホは1:1.272／1.272:1）。写真は 1.618:1。
- 曲線：ベジェの制御点を幅の38.2%・61.8%、端点の高さを23.6／38.2／61.8／76.4%に配置。
