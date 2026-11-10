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
3. **写真素材**：すべて提供の画像（生成画像・イメージ画像）。TOPのヒーロー背景＝`public/images/hero.webp`、企業理念ページ最上部＝`philosophy.webp`、事業4領域（TOPのカードと事業内容ページで共通）＝`biz-*.webp`（`src/data/business.ts` の `photo`）。ヒーロー右側のロゴマークのエンボスの型紙は `mark-mask.webp`＝公式ロゴ（縦・白）のマークを滑らかに拡大したもの（描き直しなし）。実在しない施設・作業風景として説明しない（代替テキストは「イメージ画像」）。
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

## ページ構成メモ
TOPは「ヒーロー → 事業内容 → お問い合わせ」。会社概要・沿革は `/about/` のみ（TOPには載せない）。事業内容ページ（`/business/`）は廃止し、`astro.config.mjs` のリダイレクトでTOPの事業内容（`/#business`）へ転送。事業内容の本体は `src/components/BusinessSections.astro`（4領域の写真・説明・提携事業）。文章・写真・URLは `src/data/business.ts` を直す。
企業理念（MISSION／VISION／VALUE・価値観）は企業理念ページに集約し、写真はその最上部に使用。

## 事業内容セクションの作り
企業サイト（ソニー）の構成を参考に、ネイビー一面・大きな英語見出し＋小さな日本語・領域ごとの横いっぱいの行（`<details>`でクリック開閉、最初の「教育」だけ開いた状態）。行の左に事業の説明（1事業あたり約30〜35字）。写真は、開いた行の上端から下端まで一杯・画面の右端まで敷き、左端と上下端をネイビーへ透けるグラデーションでなじませる（`.seg-photo`のmask。スマホは説明の下に全幅で、上下をぼかす）。提携事業は別見出し「Partnership Business」で同形式（写真なし）。
文章・URL・写真は `src/data/business.ts`、部品は `src/components/BusinessSections.astro`、`#education` 等のリンクで閉じた行も自動で開く（`src/scripts/main.ts`）。

## ヒーロー写真の下端
`public/images/hero.webp` は下端（約87%より下）にネイビーの丘が描かれた写真。サイトでは丘を使わないため、写真を118%に拡大して上揃えで表示し、丘の部分を枠の外へ逃がしている（`.hero-bg img`）。写真を差し替える場合は、この拡大指定も見直す。

## 事業内容の幅（案A／案B）
`src/components/BusinessSections.astro` の `<section class="biz biz--bleed ...">` の **`biz--bleed` を付けると案A**（横線を画面の左端〜右端、写真を画面の右端まで伸ばし、文字も画面の左端側から始める）、**外すと案B**（線も写真も文章と同じ幅の中に収まり、写真の右端が線の右端にそろう）。CSSは `global.css` 末尾の「案A」ブロック。現在は案A。

## 最初の画面とメニューバーの幅
PCでは、最初の画面の文字を画面の左端側（左右の余白 `--gutter` だけ残す）から始め、メニューバー（全ページ共通）も同じ余白まで広げている（`global.css` 末尾）。元に戻すには、そのブロックを削除する。

## 宿泊（Hospitality）の写真
`public/images/biz-hospitality.webp` は事業主提供の客室リビングの写真（横長 1400×1050）。実際の施設の写真の場合は、`BusinessSections.astro` の代替テキスト（現在は「宿泊のイメージ画像」）を、実際の施設名に合わせて直す。

## 企業理念ページの配色
上（最初のブロック）はネイビー、下（Mission〜Keywords）はベージュ。下のセクションは `biz--light` クラス（ベージュ面用の文字・線の色）。ネイビーに戻すには、`philosophy.astro` の該当セクションの `biz--light bg-beige` を `bg-navy` に、最初のブロックの `bg-navy` を外す。
