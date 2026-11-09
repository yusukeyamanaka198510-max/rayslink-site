# 株式会社Rays link 公式サイト（Astro + TypeScript）
公開URL：https://rayslink-site.vercel.app （Vercel。`master` へのマージで本番に自動デプロイ）

```bash
npm install && npm run dev   # 開発
npm run build                # ビルド（@astrojs/vercel。/api/contact はサーバーレス関数）
```
環境変数は `.env.example` を参照（本番は Vercel の Settings → Environment Variables）。

## 設定待ち・残課題
1. **お問い合わせメール**：Vercel（Production）に `SMTP_USER` / `SMTP_PASS`（Gmailアプリパスワード）/ `CONTACT_TO`（rayslink.costmer@gmail.com）を設定済み。**実送信テストは未実施**（本番で送信→管理者通知と自動返信の到着を確認する）。独自ドメイン取得後は Resend（`RESEND_API_KEY` / `CONTACT_FROM`）へ切り替え可能。
2. **ロゴ**：組み込み済み（原本は `design-assets/logos-original/`）。「横・白」は、送付ファイルの透過情報が失われ形が残っていなかったため、横・黒と同じ形から色だけ白にした `public/logos/logo-horizontal-white.png` を使用（現デザインでは未使用）。
3. **写真素材**：現デザイン（v2：ベージュ×ネイビー）の写真はすべて**仮イラスト**。TOPの「夕日と雲海」「未来へ向かう人」は `src/data/site.ts` の `images`（`public/images/hero-sunset.svg` / `philosophy-sunrise.svg`）、事業4領域は `src/data/business.ts` の `photo` / `photoPlaceholder` を、提供写真に差し替える。実在しない施設・看板の写真は使わない。
4. **事業説明文**：確定情報のみを根拠にした暫定文。Elcami・Web/システム・BRUMMELL・The Villa Lino等は詳細未確認のため「準備中」表記。公式URL未設定。公開前に事実確認。
5. **プライバシーポリシー**：仮ドラフト（noindex）。法務確認が必要。
6. **ドメイン**：現在は無料の `rayslink-site.vercel.app`。独自ドメイン取得後は Vercel の Domains に追加し、`SITE_URL` を設定。
7. **OGP画像**：仮SVG（SNSによってはPNG/JPGが必要）。
8. レート制限は単一インスタンスのメモリ内。多重化時は外部ストアへ。
