// 確定情報（仕様書 §4）。未確認の事実はここに追加しない。
export const company = {
  name: '株式会社Rays link',
  nameEn: 'Rays link Inc.',
  founded: '2019年1月11日',
  ceo: '山中 雄介',
  zip: '〒151-0053',
  address: '東京都渋谷区代々木1丁目10-5 代々木伊藤ローヤルコーポ505',
  capital: '300万円',
  tel: '03-6300-9116',
  corpNo: '6011201021084',
};

export const nav = [
  { href: '/', label: 'トップ', en: 'TOP' },
  { href: '/philosophy/', label: '企業理念', en: 'PHILOSOPHY' },
  { href: '/business/', label: '事業内容', en: 'BUSINESS' },
  { href: '/about/', label: '会社概要', en: 'ABOUT' },
];

export const history = [
  { date: '2019年1月11日', year: '2019', items: ['創業', '成人向け金融教育「EMI academy」開始', '子ども向け金融教育オンラインサロン「親子で学べるお金の学校」開始'] },
  { date: '2024年', year: '2024', items: ['エネルギー事業との業務提携（人材提供）開始'] },
  { date: '2025年2月', year: '2025.02', items: ['宿泊施設「The Villa Lino」開業'] },
  { date: '2025年7月', year: '2025.07', items: ['ロストボール回収「K-shot 関東支部」開業'] },
  { date: '2026年1月', year: '2026.01', items: ['キャリアカウンセリング事業「ジブキャリ」と業務提携（人材提供）開始'] },
  { date: '2026年10月', year: '2026.10', items: ['ランダムビデオチャットサービス「CROSS TALK」開始'] },
];

// 公式ロゴのパス（ここだけ書き換えれば全体に反映）。
export const logos = {
  horizontal: '/logos/logo-horizontal-black.png', // 明るい背景用の横組み（ヘッダー・フッター）
  horizontalWhite: '/logos/logo-horizontal-white.png', // 暗い背景用（暫定生成。README参照）
  verticalNavy: '/logos/logo-vertical-navy.png',
};

// 写真素材（提供されたら差し替える）。現在は仮イラスト。
export const images = {
  hero: '/images/hero.webp',               // 夕日と雲海（提供写真。下端のネイビーはサイトのネイビーと同色）
  philosophy: '/images/philosophy.webp', // 企業理念ページ最上部：青空を見上げる若い男女（提供・生成画像）
};
