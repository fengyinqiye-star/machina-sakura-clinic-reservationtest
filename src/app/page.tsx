import PublicLayout from "@/components/templates/PublicLayout";
import HeroSection from "@/components/organisms/HeroSection";
import FeaturesSection from "@/components/organisms/FeaturesSection";
import MenuOverviewSection from "@/components/organisms/MenuOverviewSection";
import NewsSection from "@/components/organisms/NewsSection";
import AccessSection from "@/components/organisms/AccessSection";
import CtaSection from "@/components/organisms/CtaSection";

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturesSection />
      <MenuOverviewSection />
      <NewsSection />
      <AccessSection />
      <CtaSection />
    </PublicLayout>
  );
}
