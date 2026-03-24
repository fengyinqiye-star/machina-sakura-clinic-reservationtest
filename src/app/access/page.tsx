import type { Metadata } from "next";
import PublicLayout from "@/components/templates/PublicLayout";
import { CLINIC_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "アクセス・営業時間",
  description:
    "さくら鍼灸整骨院へのアクセス、営業時間、地図のご案内。JR渋谷駅南口より徒歩5分。",
};

const businessHoursData = [
  { day: "月曜", morning: "9:00 - 12:30", afternoon: "15:00 - 20:00" },
  { day: "火曜", morning: "9:00 - 12:30", afternoon: "15:00 - 20:00" },
  { day: "水曜", morning: "9:00 - 12:30", afternoon: "15:00 - 20:00" },
  { day: "木曜", morning: "9:00 - 12:30", afternoon: "15:00 - 20:00" },
  { day: "金曜", morning: "9:00 - 12:30", afternoon: "15:00 - 20:00" },
  { day: "土曜", morning: "9:00 - 14:00", afternoon: "-" },
  { day: "日曜・祝日", morning: "休業", afternoon: "休業" },
];

export default function AccessPage() {
  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            アクセス・営業時間
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Map */}
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-200">
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ? (
                <iframe
                  src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="さくら鍼灸整骨院の地図"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Google Maps
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-2">所在地</h2>
                <p className="text-gray-600">{CLINIC_INFO.postalCode}</p>
                <p className="text-gray-600">{CLINIC_INFO.address}</p>
              </div>

              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-2">最寄り駅</h2>
                <p className="text-gray-600">{CLINIC_INFO.nearestStation}</p>
                <p className="text-sm text-gray-500 mt-1">
                  南口を出て左手の坂を上り、2つ目の信号を右折。50m先左手のビル1階です。
                </p>
              </div>

              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-2">駐車場</h2>
                <p className="text-gray-600">{CLINIC_INFO.parking}</p>
              </div>

              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-2">お電話</h2>
                <a
                  href={`tel:${CLINIC_INFO.phone.replace(/-/g, "")}`}
                  className="inline-flex items-center gap-2 text-sakura-500 hover:text-sakura-600 text-xl font-bold min-h-[44px]"
                >
                  <span>&#9742;</span>
                  {CLINIC_INFO.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Business Hours Table */}
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-center text-gray-800 mb-6">
              営業時間
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-sakura-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                      曜日
                    </th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">
                      午前
                    </th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">
                      午後
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {businessHoursData.map((row) => (
                    <tr key={row.day} className="border-t border-gray-100">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700">{row.day}</td>
                      <td
                        className={`py-3 px-4 text-center text-sm ${
                          row.morning === "休業" ? "text-red-500 font-medium" : "text-gray-600"
                        }`}
                      >
                        {row.morning}
                      </td>
                      <td
                        className={`py-3 px-4 text-center text-sm ${
                          row.afternoon === "休業" ? "text-red-500 font-medium" : "text-gray-600"
                        }`}
                      >
                        {row.afternoon}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              定休日: {CLINIC_INFO.closedDays}
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
