// 売却の流れ（トップページと /flow で共通）
export type Step = { title: string; body: string; key?: boolean };

export const STEPS: Step[] = [
  {
    title: "「売りたい」を押す",
    body: "車両情報と写真を送ります。名前や連絡先は業者に見えません。",
  },
  {
    title: "業者が概算額を入札",
    body: "EVに強い業者が、バッテリー状態も見て概算額を出します。",
  },
  {
    title: "最大3社を自分で選ぶ",
    body: "金額・評価・所在地を見て選んだ業者にだけ連絡先が届きます。",
    key: true,
  },
  {
    title: "チャットで商談",
    body: "現車確認や契約の相談もチャットで。電話は希望したときだけ。",
  },
];
