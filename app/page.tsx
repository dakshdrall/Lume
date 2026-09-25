import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeartsCanvas } from "@/components/HeartsCanvas";
import { Hero } from "@/components/Hero";
import { MotionProvider } from "@/components/MotionProvider";
import { ThemePreview } from "@/components/ThemePreview";
import { WaitlistProvider } from "@/components/WaitlistContext";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function Home() {
  return (
    <MotionProvider>
      <WaitlistProvider>
        <HeartsCanvas />
        <Header />
        <main id="main" className="relative">
          <Hero />
          <Features />
          <ThemePreview />
          <WaitlistForm />
        </main>
        <Footer />
      </WaitlistProvider>
    </MotionProvider>
  );
}
