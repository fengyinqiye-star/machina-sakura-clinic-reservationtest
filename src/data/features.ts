export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export const features: Feature[] = [
  {
    title: "丁寧なカウンセリング",
    description:
      "初回はもちろん、毎回のご来院時にお身体の状態をしっかりお伺いし、最適な施術プランをご提案します。",
    icon: "heart",
  },
  {
    title: "国家資格保有スタッフ",
    description:
      "柔道整復師・はり師・きゅう師の国家資格を持つスタッフが、確かな技術で施術いたします。",
    icon: "certificate",
  },
  {
    title: "幅広い施術メニュー",
    description:
      "鍼灸・整体・マッサージと豊富なメニューをご用意。お一人おひとりの症状に合わせた施術をお選びいただけます。",
    icon: "menu",
  },
];
