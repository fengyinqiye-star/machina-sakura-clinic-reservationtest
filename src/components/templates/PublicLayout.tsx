import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
