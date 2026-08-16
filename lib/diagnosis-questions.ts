export type DiagnosisOption = { id: string; label: string };
export type DiagnosisQuestion = {
  id: string;
  title: string;
  image: string;
  options: DiagnosisOption[];
  supplementLabel?: string;
  supplementPlaceholder?: string;
};

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: "world",
    title: "理由は説明できなくても、最も惹かれる世界はどれですか？",
    image: "/images/diagnosis/question-1-worlds.png",
    options: [
      { id: "A", label: "自然光や植物に包まれた、温かく穏やかな世界" },
      { id: "B", label: "白や余白を活かした、静かで整った世界" },
      { id: "C", label: "都市やネオンに囲まれた、刺激的で洗練された世界" },
      { id: "D", label: "古い建物や手仕事のある、歴史や物語を感じる世界" },
      { id: "E", label: "海や空、草原が広がる、自由で開放的な世界" },
      { id: "F", label: "色彩や遊び心にあふれた、個性的で楽しい世界" },
    ],
  },
  {
    id: "content",
    title: "最近、無意識に繰り返し選んでいる音楽やコンテンツはどれですか？",
    image: "/images/diagnosis/question-2-content.png",
    options: [
      { id: "A", label: "静かで、心を落ち着かせてくれるもの" },
      { id: "B", label: "明るく、前向きな気持ちになれるもの" },
      { id: "C", label: "力強く、挑戦する勇気をくれるもの" },
      { id: "D", label: "切なさや懐かしさに浸れるもの" },
      { id: "E", label: "深く考えたり、新しい発見が得られたりするもの" },
      { id: "F", label: "笑ったり没頭したりして、現実を忘れられるもの" },
    ],
    supplementLabel: "最近よく聴く曲、よく見る動画や作品（任意）",
    supplementPlaceholder: "曲名、アーティスト名、動画、映画、漫画など",
  },
  {
    id: "character",
    title: "物語の中で、最も心を動かされるのはどんな人物ですか？",
    image: "/images/diagnosis/question-3-characters.png",
    options: [
      { id: "A", label: "困難を乗り越え、成長していく人" },
      { id: "B", label: "常識に縛られず、自分の道を切り開く人" },
      { id: "C", label: "大切な人を支え、守り続ける人" },
      { id: "D", label: "仲間と力を合わせ、大きなことを成し遂げる人" },
      { id: "E", label: "才能や技術を、ひたむきに極めていく人" },
      { id: "F", label: "傷ついた経験から、自分らしさを取り戻す人" },
    ],
  },
  {
    id: "authenticTime",
    title: "どんな時間に、最も「自分らしい」と感じますか？",
    image: "/images/diagnosis/question-4-authentic-time.png",
    options: [
      { id: "A", label: "一人で静かに考え、集中しているとき" },
      { id: "B", label: "誰かと本音で深く話しているとき" },
      { id: "C", label: "仲間と同じ目標に向かって動いているとき" },
      { id: "D", label: "新しいことを試し、未知の世界に触れているとき" },
      { id: "E", label: "アイデアや感覚を、自分なりの形で表現しているとき" },
      { id: "F", label: "人を支えたり、喜んでもらえたりしたとき" },
    ],
  },
  {
    id: "coreValue",
    title: "人生の選択で、最も失いたくないものは何ですか？",
    image: "/images/diagnosis/question-5-values.png",
    options: [
      { id: "A", label: "自分で選び、自分のペースで生きられる自由" },
      { id: "B", label: "安心して暮らせる安定と心の余裕" },
      { id: "C", label: "大切な人との信頼やつながり" },
      { id: "D", label: "成長し、新しい可能性を広げていくこと" },
      { id: "E", label: "自分らしさや、信念に正直でいること" },
      { id: "F", label: "誰かの役に立ち、意味のあることをすること" },
    ],
  },
];

export function resolveAnswers(selections: Record<string, string>) {
  return diagnosisQuestions.map((question) => {
    const option = question.options.find((candidate) => candidate.id === selections[question.id]);
    return { questionId: question.id, question: question.title, optionId: option?.id ?? "", answer: option?.label ?? "" };
  });
}

