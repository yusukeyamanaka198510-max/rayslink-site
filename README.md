# 株式会社Rays link 公式サイト（Astro + TypeScript）
公開URL：https://rayslink-site.vercel.app （Vercel。`master` へのマージで本番に自動デプロイ）

```bash
npm install && npm run dev   # 開発
npm run build                # ビルド（@astrojs/vercel。/api/contact はサーバーレス関数）
```
環境変数は `.env.example` を参照（本番は Vercel の Settings → Environment Variables）。

## 設定待ち・残課題
1. **お問い合わせメール**：`RESEND_API_KEY` / `CONTACT_FROM` / `CONTACT_TO` が未設定の間、フォームは送信不可（成功は表示されない）。通知先は rayslink.costmer@gmail.com の予定。送信元には認証済みドメインが必要（Vercel の無料ドメインや Gmail は不可の見込み）。設定後、公開前に実送信テスト必須。
2. **ロゴ**：組み込み済み（原本は `design-assets/logos-original/`）。「横・白」は原本が全面白で形が無かったため、`public/logos/logo-horizontal-white.png` は横・黒から色替えした**暫定**。正しい原本が来たら差し替える（現在サイトでは未使用）。
3. **事業写真**：`public/images/placeholder-*.svg` は仮。`src/data/business.ts` の `photo` / `photoPlaceholder` を更新。
4. **事業説明文**：確定情報のみを根拠にした暫定文。Elcami・Web/システム・BRUMMELL・The Villa Lino等は詳細未確認のため「準備中」表記。公式URL未設定。公開前に事実確認。
5. **プライバシーポリシー**：仮ドラフト（noindex）。法務確認が必要。
6. **ドメイン**：現在は無料の `rayslink-site.vercel.app`。独自ドメイン取得後は Vercel の Domains に追加し、`SITE_URL` を設定。
7. **OGP画像**：仮SVG（SNSによってはPNG/JPGが必要）。
8. レート制限は単一インスタンスのメモリ内。多重化時は外部ストアへ。
