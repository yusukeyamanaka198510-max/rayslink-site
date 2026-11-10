import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// 公開URL。独自ドメインを取得したら Vercel の環境変数 SITE_URL を設定して差し替える。
// 未設定なら Vercel が本番ビルドで提供する本番ドメインを使用（ローカルは仮URL）。
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://rays-link.example');

export default defineConfig({
  site,
  redirects: { '/business': '/#business', '/business/': '/#business' }, // 事業内容ページは廃止（TOPの事業内容へ）
  output: 'static', // 各ページは静的生成。API(/api/contact)のみサーバー実行
  adapter: vercel(),
  integrations: [sitemap({ filter: (p) => !p.includes('/api/') })],
  build: { inlineStylesheets: 'auto' },
});
