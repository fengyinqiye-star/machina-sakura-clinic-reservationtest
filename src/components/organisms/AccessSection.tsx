import { CLINIC_INFO } from "@/lib/constants";

export default function AccessSection() {
  return (
    <section className="py-16 bg-sakura-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-center text-gray-800 mb-10">
          アクセス
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
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
                <span>Google Maps</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">住所</h3>
              <p className="text-gray-600">{CLINIC_INFO.postalCode}</p>
              <p className="text-gray-600">{CLINIC_INFO.address}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">最寄り駅</h3>
              <p className="text-gray-600">{CLINIC_INFO.nearestStation}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">営業時間</h3>
              <table className="text-sm w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 text-gray-600">月〜金</td>
                    <td className="py-2 text-gray-800">9:00 - 12:30 / 15:00 - 20:00</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 text-gray-600">土</td>
                    <td className="py-2 text-gray-800">9:00 - 14:00</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-600">日・祝</td>
                    <td className="py-2 text-red-500 font-medium">休業</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">お電話</h3>
              <a
                href={`tel:${CLINIC_INFO.phone.replace(/-/g, "")}`}
                className="inline-flex items-center gap-2 text-sakura-500 hover:text-sakura-600 text-lg font-bold min-h-[44px]"
              >
                <span>&#9742;</span>
                {CLINIC_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
