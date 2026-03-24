import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { CLINIC_INFO } from "@/lib/constants";

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${CLINIC_INFO.name} | 鍼灸・整体・マッサージ`,
    template: `%s | ${CLINIC_INFO.name}`,
  },
  description: CLINIC_INFO.description,
  openGraph: {
    title: CLINIC_INFO.name,
    description: CLINIC_INFO.description,
    type: "website",
    locale: "ja_JP",
    siteName: CLINIC_INFO.name,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSerifJP.variable} ${notoSansJP.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["LocalBusiness", "MedicalBusiness"],
              name: CLINIC_INFO.name,
              description: CLINIC_INFO.description,
              address: {
                "@type": "PostalAddress",
                streetAddress: CLINIC_INFO.address,
                addressLocality: "渋谷区",
                addressRegion: "東京都",
                addressCountry: "JP",
              },
              telephone: CLINIC_INFO.phone,
              openingHours: ["Mo-Fr 09:00-12:30", "Mo-Fr 15:00-20:00", "Sa 09:00-14:00"],
            }),
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  );
}
