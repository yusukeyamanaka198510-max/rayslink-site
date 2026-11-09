import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// ドメイン未取得のため仮URL。取得後は環境変数 SITE_URL で差し替え。
const site = process.env.SITE_URL || 'https://rays-link.example';

export default defineConfig({
  site,
  output: 'static', // 各ページは静的生成。API(/api/contact)のみサーバー実行
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap({ filter: (p) => !p.includes('/api/') })],
  build: { inlineStylesheets: 'auto' },
});
