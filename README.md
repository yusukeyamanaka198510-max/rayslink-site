# 株式会社Rays link 公式サイト（Astro + TypeScript）
```bash
npm install && npm run dev      # 開発
npm run build                  # Vercel にデプロイ（@astrojs/vercel。/api/contact はサーバーレス関数）
```
環境変数は `.env.example` を参照。

## 設定待ち・残課題
1. **公式ロゴ**：`public/logos/` は仮SVG。提供ロゴ5点を配置し `src/data/site.ts` の `logos` を更新（変形不可）。
2. **事業写真**：`public/images/placeholder-*.svg` は仮。`src/data/business.ts` の `photo` / `photoPlaceholder` を更新。
3. **フォーム送信**：`RESEND_API_KEY` / `CONTACT_FROM` / `CONTACT_TO` 未設定の間は送信不可（成功は表示されない）。ドメイン認証後に実送信テスト必須。
4. **ドメイン**：未取得。`SITE_URL` 設定（canonical/OGP/sitemap に反映）。
5. **プライバシーポリシー**：仮ドラフト（noindex）。法務確認が必要。
6. **事業説明文**：確定情報のみを根拠にした暫定文。Elcami・Web/システム・BRUMMELL・The Villa Lino等は詳細未確認のため「準備中」表記。公式URLは未設定。
7. **OGP画像**：仮SVG（SNSによってはPNG/JPGが必要）。
8. レート制限は単一プロセスのメモリ内。複数インスタンス運用時は外部ストアへ。
