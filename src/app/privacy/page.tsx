import type { Metadata } from "next";
import PublicLayout from "@/components/templates/PublicLayout";
import { CLINIC_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "さくら鍼灸整骨院のプライバシーポリシー。個人情報の取り扱いについて。",
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-serif text-3xl font-bold text-center text-gray-800 mb-10">
            プライバシーポリシー
          </h1>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">1. 収集する個人情報</h2>
              <p>当院では、以下の個人情報を収集することがあります。</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>氏名、フリガナ</li>
                <li>電話番号</li>
                <li>メールアドレス</li>
                <li>来院歴（初診・再診）</li>
                <li>症状・ご要望に関する情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">2. 利用目的</h2>
              <p>収集した個人情報は、以下の目的で利用いたします。</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>予約の受付・管理・確認連絡</li>
                <li>施術に必要な情報の把握</li>
                <li>予約に関するご連絡（確認メール送信を含む）</li>
                <li>当院からのお知らせ・ご案内（ご同意いただいた場合のみ）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">3. 第三者提供について</h2>
              <p>
                当院は、以下の場合を除き、お客様の個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>お客様の同意がある場合</li>
                <li>法令に基づき開示が求められた場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">4. 個人情報の管理</h2>
              <p>
                当院は、個人情報の正確性及び安全性を確保するために、セキュリティに万全の対策を講じ、
                個人情報の漏洩、改ざん、不正アクセスなどの防止に努めます。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">5. 開示・訂正・削除について</h2>
              <p>
                お客様ご自身の個人情報について、開示・訂正・削除等をご希望される場合は、
                お電話にてお問い合わせください。本人確認の上、速やかに対応いたします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">6. お問い合わせ先</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800">{CLINIC_INFO.name}</p>
                <p>院長: 田中 さくら</p>
                <p>{CLINIC_INFO.address}</p>
                <p>TEL: {CLINIC_INFO.phone}</p>
              </div>
            </section>

            <p className="text-sm text-gray-400 text-right">制定日: 2026年3月24日</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
