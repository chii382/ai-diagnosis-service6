import { BottomCtaSection } from "./components/BottomCtaSection";
import { FeatureSection } from "./components/FeatureSection";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { PricingSection } from "./components/PricingSection";
import { FaqSection } from "./components/FaqSection";
import { OpeningSequence } from "./components/OpeningSequence";
import { SiteFooter } from "./components/SiteFooter";
import { ClickRipple } from "./components/ClickRipple";

export default function Home() {
  return (
    <>
      <ClickRipple />
      <OpeningSequence />
      <Header />
      <main id="main-content" className="lp-page">
        <HeroSection />
        <FeatureSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <BottomCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
