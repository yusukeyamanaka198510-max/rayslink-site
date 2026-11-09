// 事業データ。説明文・URLは事業主から提供された内容に基づく（事実の追加はしない）。
// 写真は提供後に photo のパスを差し替えるだけで反映される。
export type Service = { name: string; kind?: string; since?: string; desc: string; features: string[]; url?: string };
export type Domain = { id: string; en: string; ja: string; lead: string; photo: string; photoPlaceholder: boolean; services: Service[] };

export const domains: Domain[] = [
  {
    id: 'education', en: 'Education', ja: '教育', lead: 'お金を学び、選択肢を広げる。',
    photo: '/images/placeholder-education.svg', photoPlaceholder: true,
    services: [
      { name: 'EMI academy', kind: '20歳以上に向けた総合金融教育コミュニティ', since: '2019年1月〜',
        desc: '将来への不安、経済の勉強、投資の基礎から応用実践、就職や転職の疑問まで、お金にまつわる悩みを学べる伴走型コミュニティです。専用教育プログラムと会員限定の学習動画に加え、個人面談や集団学習、交流会を通じて、一人ひとりの「将来への希望と可能性」を広げます。',
        features: ['20歳以上', '伴走型コミュニティ', '会員限定の学習動画', '個人面談・交流会'],
        url: 'https://www.emi-academy.jp/free' },
      { name: '親子で学べるお金の学校', kind: '4歳から始める子供向けの金融教育オンラインサロン', since: '2019年1月〜',
        desc: 'こどもNISAや英国式学習など、近年重視される金融教育を、子どもにも分かりやすく、楽しく学べるオンラインサロンです。ご家族で学習の時間を共有できることも魅力のひとつです。',
        features: ['4歳から', 'オンラインサロン', '親子で学習'],
        url: 'https://community.camp-fire.jp/projects/view/509437' },
    ],
  },
  {
    id: 'hospitality', en: 'Hospitality', ja: '宿泊', lead: '笑顔が生まれる時間を、届ける。',
    photo: '/images/placeholder-hospitality.svg', photoPlaceholder: true,
    services: [
      { name: 'The Villa Lino', kind: 'ホテル事業｜沖縄県読谷村', since: '2025年2月開業',
        desc: '沖縄県読谷村にある、1日1組限定のヴィラです。お子様が騒いでも気兼ねなく過ごせ、広々としたリビング、充実したアメニティとキッチン設備、無料駐車場2台分、那覇から名護まで見渡せるシービューが魅力です。1階には飲食店が2店舗あり、近隣には居酒屋、コンビニ、スーパーも徒歩圏内にあります。',
        features: ['1日1組限定', '沖縄県読谷村', 'シービュー', '駐車場2台無料'],
        url: 'https://www.booking.com/hotel/jp/the-villa-lino.ja.html' },
    ],
  },
  {
    id: 'sustainability', en: 'Sustainability', ja: 'サステナビリティ', lead: '身近な環境を、丁寧に守る。',
    photo: '/images/placeholder-sustainability.svg', photoPlaceholder: true,
    services: [
      { name: 'K-shot 関東支部', kind: 'ゴルフボール回収事業', since: '2025年7月開業',
        desc: 'ゴルフ場の池や山林に放置されたゴルフボールを回収する事業です。日本最多級のロストボール数を抱えるK-shotの関東支部として、水質汚染や生態系の破壊を防ぐという社会的意義を大切に、丁寧に作業を行います。ゴルフ場のご利用客やコースへの影響にも最大限配慮しています。',
        features: ['ゴルフボール回収', '環境保護', '関東支部'],
        url: 'https://k-shot1.com/' },
    ],
  },
  {
    id: 'technology', en: 'Technology', ja: 'IT・デジタル', lead: 'つながりを、テクノロジーで広げる。',
    photo: '/images/placeholder-technology.svg', photoPlaceholder: true,
    services: [
      { name: 'CROSS TALK', kind: 'ランダムビデオチャットサービス', since: '2026年10月開始',
        desc: '「日本のこと」を共通の話題に、世界中の人とリモートで話せるサービスです。英語でのコミュニケーションを軸に、英語力の向上、お互いの情報交換、コミュニケーション能力の向上をめざし、世界の輪を広げます。',
        features: ['ビデオチャット', '英語でコミュニケーション', '2026年10月開始'],
        url: 'https://www.cross-talk.jp/' },
      { name: 'Web・システム関連', kind: 'HP・LP制作、Webシステム、Webアプリの開発、委託制作',
        desc: 'HP・LPの制作、Webシステム、Webアプリの開発や委託制作を行います。超短期納品を前提に、多岐にわたるご要望をしっかりとヒアリングし、お客様の「仕事の悩み」全体を網羅的にサポートします。',
        features: ['HP・LP制作', 'Webシステム・アプリ開発', '超短期納品'] },
    ],
  },
];

export type Partner = { name: string; kind: string; desc: string; url?: string };
// 提携事業：Rays link単独の事業ではない。「PARTNERSHIP BUSINESS」として独立表示する。
export const partners: Partner[] = [
  { name: 'ジブキャリ', kind: 'キャリアカウンセリング事業｜他企業との業務提携（人材提供）',
    desc: '就職・転職をサポートするキャリアカウンセリング事業です。丁寧なヒアリングで将来の方向性や職業選択の基準を明確にし、迅速なエントリーから面接対策まで伴走します。',
    url: 'https://jibuncareer.com/' },
  { name: 'エネルギー事業', kind: '他企業との業務提携（人材提供）',
    desc: '太陽光パネル、蓄電池、エコキュートの販売・サポートを行うエネルギー事業です。東海地区から北陸地区を対象に、丁寧な事前説明のもと、安心して導入いただけるようサポートします。',
    url: 'https://eikop.com/company/' },
];
