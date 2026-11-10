// 事業データ。説明文・URLは事業主から提供された内容に基づく（事実の追加はしない）。
// 写真：photo＝TOPの事業内容カードと事業内容ページで共通（提供・生成のイメージ画像）。
export type Service = { name: string; kind?: string; since?: string; desc: string; url?: string };
export type Domain = { id: string; en: string; ja: string; lead: string; photo: string; photoPlaceholder: boolean; services: Service[] };

export const domains: Domain[] = [
  {
    id: 'education', en: 'Education', ja: '教育', lead: 'お金を学び、選択肢を広げる。',
    photo: '/images/biz-education.webp', photoPlaceholder: false, // 提供・生成のイメージ画像（TOPの事業内容カードと事業内容ページで共通）
    services: [
      { name: 'EMI academy', kind: '20歳以上に向けた総合金融教育コミュニティ', since: '2019年1月〜',
        desc: 'お金の悩みを、専用プログラムと会員限定の動画で学べる伴走型コミュニティ。',
        url: 'https://www.emi-academy.jp/free' },
      { name: '親子で学べるお金の学校', kind: '4歳から始める子供向けの金融教育オンラインサロン', since: '2019年1月〜',
        desc: '子どもにも分かりやすく、楽しく学べる金融教育のオンラインサロン。',
        url: 'https://community.camp-fire.jp/projects/view/509437' },
    ],
  },
  {
    id: 'hospitality', en: 'Hospitality', ja: '宿泊', lead: '笑顔が生まれる時間を、届ける。',
    photo: '/images/biz-hospitality.webp', photoPlaceholder: false, // 提供・生成のイメージ画像（TOPの事業内容カードと事業内容ページで共通）
    services: [
      { name: 'The Villa Lino', kind: 'ホテル事業｜沖縄県読谷村', since: '2025年2月開業',
        desc: '沖縄県読谷村の1日1組限定のヴィラ。広いリビングとシービューが魅力。',
        url: 'https://www.booking.com/hotel/jp/the-villa-lino.ja.html' },
    ],
  },
  {
    id: 'sustainability', en: 'Sustainability', ja: 'サステナビリティ', lead: '身近な環境を、丁寧に守る。',
    photo: '/images/biz-sustainability.webp', photoPlaceholder: false, // 提供・生成のイメージ画像（TOPの事業内容カードと事業内容ページで共通）
    services: [
      { name: 'K-shot 関東支部', kind: 'ゴルフボール回収事業', since: '2025年7月開業',
        desc: 'ゴルフ場の池や山林のボールを回収し、水質汚染や生態系の破壊を防ぎます。',
        url: 'https://k-shot1.com/' },
    ],
  },
  {
    id: 'technology', en: 'Technology', ja: 'IT・デジタル', lead: 'つながりを、テクノロジーで広げる。',
    photo: '/images/biz-technology.webp', photoPlaceholder: false, // 提供・生成のイメージ画像（TOPの事業内容カードと事業内容ページで共通）
    services: [
      { name: 'CROSS TALK', kind: 'ランダムビデオチャットサービス', since: '2026年10月開始',
        desc: '「日本のこと」を話題に、世界中の人とリモートで話せるサービス。',
        url: 'https://www.cross-talk.jp/' },
      { name: 'Web・システム関連', kind: 'HP・LP制作、Webシステム、Webアプリの開発、委託制作',
        desc: 'HP・LP制作、Webシステム・アプリの開発、委託制作。超短期納品が前提です。', },
    ],
  },
];

export type Partner = { name: string; kind: string; desc: string; url?: string };
// 提携事業：Rays link単独の事業ではない。「PARTNERSHIP BUSINESS」として独立表示する。
export const partners: Partner[] = [
  { name: 'ジブキャリ', kind: 'キャリアカウンセリング事業｜他企業との業務提携（人材提供）',
    desc: '就職・転職を、丁寧なヒアリングから面接対策まで、伴走して支えます。',
    url: 'https://jibuncareer.com/' },
  { name: 'エネルギー事業', kind: '他企業との業務提携（人材提供）',
    desc: '太陽光パネル、蓄電池、エコキュートの販売・サポート。東海〜北陸地区が対象です。',
    url: 'https://eikop.com/company/' },
];
