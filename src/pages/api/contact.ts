import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
export const prerender = false;

const TYPES = ['事業・サービス', '提携・協業', '取材・メディア', 'その他'];
const hits = new Map<string, number[]>(); // 簡易レート制限（単一プロセス）。多重化する場合は外部ストアへ。
const LIMIT = 5, WINDOW = 60 * 60 * 1000;
const env = (k: string) => process.env[k] || (import.meta.env as Record<string, string | undefined>)[k] || '';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (s: unknown, max: number) => String(s ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ');

type Mail = { to: string; replyTo?: string; subject: string; text: string };
type Sender = (m: Mail) => Promise<void>;

// 送信手段の選択: Gmail(SMTP) → Resend の順。どちらも未設定なら null（送信不可）。
function getSender(): Sender | null {
  const smtpUser = env('SMTP_USER'), smtpPass = env('SMTP_PASS');
  if (smtpUser && smtpPass) {
    const from = env('CONTACT_FROM') || `株式会社Rays link <${smtpUser}>`;
    const tr = nodemailer.createTransport({ host: env('SMTP_HOST') || 'smtp.gmail.com', port: Number(env('SMTP_PORT') || 465), secure: (Number(env('SMTP_PORT') || 465)) === 465, auth: { user: smtpUser, pass: smtpPass } });
    return async (m) => { await tr.sendMail({ from, to: m.to, replyTo: m.replyTo, subject: m.subject, text: m.text }); };
  }
  const key = env('RESEND_API_KEY'), from = env('CONTACT_FROM');
  if (key && from) {
    return async (m) => {
      const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify({ from, to: [m.to], reply_to: m.replyTo, subject: m.subject, text: m.text }) });
      if (!r.ok) throw new Error(`mail ${r.status}`);
    };
  }
  return null;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let d: Record<string, unknown>;
  try { d = await request.json(); } catch { return json({ error: 'invalid' }, 400); }

  // スパム対策: ハニーポット＋送信までの最短時間
  if (d.website) return json({ ok: true }); // bot には成功を装うがメールは送らない
  const t = Number(d.t);
  if (!t || Date.now() - t < 3000) return json({ error: 'too_fast' }, 400);

  // レート制限
  const ip = clientAddress || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((x) => now - x < WINDOW);
  if (recent.length >= LIMIT) return json({ error: 'rate_limited' }, 429);

  // サーバー側バリデーション
  const v = { type: clean(d.type, 40), name: clean(d.name, 100), email: clean(d.email, 254), message: clean(d.message, 4000), company: clean(d.company, 100), tel: clean(d.tel, 30) };
  const errors: Record<string, string> = {};
  if (!TYPES.includes(v.type)) errors.type = 'お問い合わせ種別を選択してください。';
  if (!v.name) errors.name = 'お名前を入力してください。';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'メールアドレスの形式が正しくありません。';
  if (v.message.length < 5) errors.message = 'お問い合わせ内容を入力してください（5文字以上）。';
  if (v.tel && !/^[0-9+\-()\s]{6,30}$/.test(v.tel)) errors.tel = '電話番号の形式が正しくありません。';
  if (d.agree !== true) errors.agree = 'プライバシーポリシーへの同意が必要です。';
  if (Object.keys(errors).length) return json({ error: 'validation', errors }, 422);

  // 未設定なら成功を表示しない
  const send = getSender();
  const to = env('CONTACT_TO') || env('SMTP_USER');
  if (!send || !to) return json({ error: 'not_configured' }, 503);

  try {
    await send({ to, replyTo: v.email, subject: `【Rays link HP】${oneLine(v.type)}：${oneLine(v.name)}様`,
      text: `種別: ${v.type}\nお名前: ${v.name}\n会社・団体: ${v.company || '-'}\nメール: ${v.email}\n電話: ${v.tel || '-'}\n\n${v.message}\n\nIP: ${ip}` });
    await send({ to: v.email, subject: '【株式会社Rays link】お問い合わせを受け付けました',
      text: `${v.name} 様\n\nこの度はお問い合わせありがとうございます。以下の内容で受け付けました。\n担当者より順次ご連絡いたしますので、しばらくお待ちください。\n\n―――――――――\n種別: ${v.type}\n${v.message}\n―――――――――\n\n※本メールは自動送信です。\n株式会社Rays link` });
  } catch {
    return json({ error: 'send_failed' }, 502);
  }
  hits.set(ip, [...recent, now]);
  return json({ ok: true });
};
