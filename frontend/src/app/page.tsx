import { LandingNav } from "@/components/LandingNav";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { RecipeShowcase } from "@/components/RecipeShowcase";
import { ScanSection } from "@/components/ScanSection";
import { CtaBanner } from "@/components/CtaBanner";
import { LandingFooter } from "@/components/LandingFooter";

export default function Page() {
  return (
    <main className="min-h-screen bg-chimge-bg overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <RecipeShowcase />
      <ScanSection />
      <CtaBanner />
      <LandingFooter />
    </main>
  );
}
