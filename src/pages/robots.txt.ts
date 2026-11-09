import type { APIRoute } from 'astro';
// robots.txt の Sitemap は絶対URLが必要なため、site 設定から生成する
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${new URL('/sitemap-index.xml', site).toString()}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
