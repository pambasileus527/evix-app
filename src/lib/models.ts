// 車種マスタ（要件定義書 11.1 の優先度A）
// 注意：新車価格・バッテリー容量はデモ用の目安値。実運用前にメーカー公式情報で確認・更新すること。

export type Grade = {
  /** グレード名（表示用） */
  name: string;
  /** バッテリー容量（kWh） */
  batteryKwh: number;
  /** 新車価格の目安（万円） */
  newPriceManYen: number;
};

export type CarModel = {
  /** 社内ID */
  id: string;
  /** URL用のメーカー名 */
  makerSlug: string;
  makerName: string;
  /** URL用の車種名 */
  modelSlug: string;
  name: string;
  /** 世代などの補足 */
  note?: string;
  /** 対象年式の範囲 */
  yearFrom: number;
  yearTo: number;
  grades: Grade[];
  /** バッテリー劣化の速さ（1 = 標準） */
  degradation: number;
  /** ダミーデータの月間取引件数の目安 */
  monthlyVolume: number;
};

export const MODELS: CarModel[] = [
  {
    id: "nissan-sakura",
    makerSlug: "nissan",
    makerName: "日産",
    modelSlug: "sakura",
    name: "サクラ",
    note: "軽EV",
    yearFrom: 2022,
    yearTo: 2026,
    grades: [
      { name: "X", batteryKwh: 20, newPriceManYen: 255 },
      { name: "G", batteryKwh: 20, newPriceManYen: 300 },
    ],
    degradation: 1,
    monthlyVolume: 40,
  },
  {
    id: "mitsubishi-ek-x-ev",
    makerSlug: "mitsubishi",
    makerName: "三菱",
    modelSlug: "ek-x-ev",
    name: "eKクロス EV",
    note: "軽EV（サクラの兄弟車）",
    yearFrom: 2022,
    yearTo: 2026,
    grades: [
      { name: "G", batteryKwh: 20, newPriceManYen: 255 },
      { name: "P", batteryKwh: 20, newPriceManYen: 295 },
    ],
    degradation: 1,
    monthlyVolume: 15,
  },
  {
    id: "nissan-leaf-ze0",
    makerSlug: "nissan",
    makerName: "日産",
    modelSlug: "leaf-ze0",
    name: "リーフ（初代）",
    note: "2010〜2017年",
    yearFrom: 2010,
    yearTo: 2017,
    grades: [
      { name: "24kWh", batteryKwh: 24, newPriceManYen: 360 },
      { name: "30kWh", batteryKwh: 30, newPriceManYen: 400 },
    ],
    degradation: 1.3,
    monthlyVolume: 30,
  },
  {
    id: "nissan-leaf-ze1",
    makerSlug: "nissan",
    makerName: "日産",
    modelSlug: "leaf-ze1",
    name: "リーフ（2代目）",
    note: "2017〜2025年",
    yearFrom: 2017,
    yearTo: 2025,
    grades: [
      { name: "40kWh", batteryKwh: 40, newPriceManYen: 400 },
      { name: "e+ 62kWh", batteryKwh: 62, newPriceManYen: 500 },
    ],
    degradation: 1.2,
    monthlyVolume: 50,
  },
  {
    id: "nissan-ariya",
    makerSlug: "nissan",
    makerName: "日産",
    modelSlug: "ariya",
    name: "アリア",
    yearFrom: 2022,
    yearTo: 2026,
    grades: [
      { name: "B6", batteryKwh: 66, newPriceManYen: 560 },
      { name: "B9", batteryKwh: 91, newPriceManYen: 680 },
    ],
    degradation: 0.9,
    monthlyVolume: 15,
  },
  {
    id: "tesla-model-3",
    makerSlug: "tesla",
    makerName: "テスラ",
    modelSlug: "model-3",
    name: "Model 3",
    yearFrom: 2019,
    yearTo: 2026,
    grades: [
      { name: "RWD", batteryKwh: 60, newPriceManYen: 530 },
      { name: "ロングレンジ", batteryKwh: 78, newPriceManYen: 640 },
    ],
    degradation: 0.8,
    monthlyVolume: 35,
  },
  {
    id: "tesla-model-y",
    makerSlug: "tesla",
    makerName: "テスラ",
    modelSlug: "model-y",
    name: "Model Y",
    yearFrom: 2022,
    yearTo: 2026,
    grades: [
      { name: "RWD", batteryKwh: 60, newPriceManYen: 560 },
      { name: "ロングレンジ", batteryKwh: 78, newPriceManYen: 670 },
    ],
    degradation: 0.8,
    monthlyVolume: 25,
  },
];

export const MAKERS = Array.from(
  new Map(MODELS.map((m) => [m.makerSlug, m.makerName])).entries(),
).map(([slug, name]) => ({ slug, name }));

export const REGIONS = [
  { id: "hokkaido-tohoku", name: "北海道・東北", demand: 0.97 },
  { id: "kanto", name: "関東", demand: 1.03 },
  { id: "chubu", name: "中部", demand: 1.0 },
  { id: "kinki", name: "近畿", demand: 1.01 },
  { id: "chugoku-shikoku", name: "中国・四国", demand: 0.98 },
  { id: "kyushu-okinawa", name: "九州・沖縄", demand: 0.99 },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

export function findModel(makerSlug: string, modelSlug: string) {
  return MODELS.find((m) => m.makerSlug === makerSlug && m.modelSlug === modelSlug);
}

export function modelPath(m: CarModel) {
  return `/ev/${m.makerSlug}/${m.modelSlug}`;
}

export function displayName(m: CarModel) {
  return `${m.makerName} ${m.name}`;
}
