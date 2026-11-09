// 事業データ。写真は提供後に photo のパスを差し替えるだけで反映される。
// 説明文は仕様書の確定情報のみを根拠にした暫定文。公開前に事実確認すること。
export type Service = { name: string; kind?: string; since?: string; desc: string; features: string[]; url?: string };
export type Domain = { id: string; en: string; ja: string; lead: string; photo: string; photoPlaceholder: boolean; services: Service[] };

export const domains: Domain[] = [
  {
    id: 'education', en: 'Education', ja: '教育', lead: 'お金を学び、選択肢を広げる。',
    photo: '/images/placeholder-education.svg', photoPlaceholder: true,
    services: [
      { name: 'EMI academy', kind: '成人向け金融教育', since: '2019年1月〜',
        desc: '大人のための金融教育プログラム。お金の仕組みや考え方を学び、将来に向けて自分で判断できる力を身につけることを目指します。創業以来続く、Rays linkの原点となる事業です。',
        features: ['成人向け', '金融リテラシー', '創業時から継続'] },
      { name: '親子で学べるお金の学校', kind: '子ども向け金融教育オンラインサロン', since: '2019年1月〜',
        desc: '子どもと保護者が一緒にお金について学べるオンラインサロン。家庭の中でお金の話をするきっかけをつくり、次の世代の選択肢を広げます。',
        features: ['親子で参加', 'オンライン', '子ども向け'] },
    ],
  },
  {
    id: 'hospitality', en: 'Hospitality', ja: '宿泊・体験', lead: '笑顔が生まれる時間を、届ける。',
    photo: '/images/placeholder-hospitality.svg', photoPlaceholder: true,
    services: [
      { name: 'The Villa Lino', kind: '宿泊施設', since: '2025年2月開業',
        desc: '2025年2月に開業した宿泊施設。訪れる人が日常を離れ、大切な人と笑顔で過ごせる場所を目指しています。施設の詳細は公式ページで案内する予定です。',
        features: ['宿泊施設', '2025年2月開業'] },
      { name: 'K-shot 関東支部', kind: 'ロストボール回収', since: '2025年7月開業',
        desc: 'ロストボールの回収事業。関東エリアで活動しています。遊び心と本気を併せ持つ、Rays linkらしい新しいかたちの事業です。',
        features: ['ロストボール回収', '関東エリア', '2025年7月開業'] },
    ],
  },
  {
    id: 'sustainability', en: 'Sustainability', ja: 'サステナビリティ', lead: '未来につながる、循環をつくる。',
    photo: '/images/placeholder-sustainability.svg', photoPlaceholder: true,
    services: [
      { name: 'ロストボール回収（K-shot 関東支部）', kind: '回収事業', since: '2025年7月〜',
        desc: '置き去りにされたボールを回収する事業。身近な場所から環境に配慮した取り組みを広げていくことを目指しています。※具体的な活動内容は確認が整い次第、追記します。',
        features: ['回収事業', '関東エリア'] },
      { name: 'エコライフへの人材提供', kind: 'エネルギー事業との連携', since: '2024年〜',
        desc: 'エネルギー事業「エコライフ」に人材を提供しています。人の力で、エネルギー分野の事業を支えています。※提携事業として下記PARTNERSHIP BUSINESSでも紹介しています。',
        features: ['人材提供', 'エネルギー事業'] },
    ],
  },
  {
    id: 'technology', en: 'Technology', ja: 'IT・デジタル', lead: 'つながりを、テクノロジーで広げる。',
    photo: '/images/placeholder-technology.svg', photoPlaceholder: true,
    services: [
      { name: 'CROSS TALK', kind: 'ランダムビデオチャットサービス', since: '2026年10月開始',
        desc: '偶然の出会いを楽しめるランダムビデオチャットサービス。2026年10月に開始しました。人と人との新しいつながりを生み出します。',
        features: ['ビデオチャット', '2026年10月開始'] },
      { name: 'Elcami', kind: 'IT・デジタル', desc: 'Rays linkが手がけるIT・デジタル領域のサービス。サービス詳細は準備でき次第、順次掲載します。', features: ['詳細準備中'] },
      { name: 'Web・システム関連', kind: 'IT・デジタル', desc: 'Webサイトやシステムに関する取り組み。事例や内容は確認が整い次第、掲載します。', features: ['詳細準備中'] },
    ],
  },
];

export type Partner = { name: string; kind: string; desc: string; url?: string };
export const partners: Partner[] = [
  { name: 'BRUMMELL', kind: '提携事業', desc: '提携先として協業している事業です。詳細は確認が整い次第、掲載します。' },
  { name: 'キャリア・人材育成（ジブキャリ 等）', kind: '共同開業', desc: 'キャリアカウンセリング事業「ジブキャリ」を2026年1月に共同開業しました。一人ひとりのキャリアに寄り添い、人材育成を支援します。' },
  { name: 'エコライフ', kind: '人材提供', desc: 'エネルギー事業「エコライフ」に対して、2024年より人材を提供しています。' },
];
