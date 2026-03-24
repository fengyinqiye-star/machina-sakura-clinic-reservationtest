export interface StaffMember {
  name: string;
  role: string;
  qualifications: string[];
  specialty: string;
  message: string;
  image: string;
}

export const staffMembers: StaffMember[] = [
  {
    name: "田中 さくら",
    role: "院長",
    qualifications: ["柔道整復師", "はり師", "きゅう師"],
    specialty: "鍼灸治療・骨盤矯正",
    message:
      "患者様お一人おひとりに寄り添い、根本的な改善を目指した施術を心がけています。お気軽にご相談ください。",
    image: "/images/staff/staff-01.webp",
  },
  {
    name: "佐藤 健太",
    role: "副院長",
    qualifications: ["柔道整復師", "あん摩マッサージ指圧師"],
    specialty: "スポーツ障害・姿勢改善",
    message:
      "スポーツ経験を活かし、アスリートから日常の不調まで幅広く対応いたします。",
    image: "/images/staff/staff-02.webp",
  },
  {
    name: "鈴木 美咲",
    role: "スタッフ",
    qualifications: ["はり師", "きゅう師"],
    specialty: "美容鍼・女性特有の不調",
    message:
      "女性ならではのお悩みに寄り添い、美容と健康の両面からサポートいたします。",
    image: "/images/staff/staff-03.webp",
  },
];

export const qualificationsList = [
  "柔道整復師",
  "はり師",
  "きゅう師",
  "あん摩マッサージ指圧師",
];
