import { HeroSection } from "@/components/public/home/HeroSection"
import { FeaturesSection } from "@/components/public/home/FeaturesSection"
import { TestimonialsSection } from "@/components/public/home/TestimonialsSection"
import { CTASection } from "@/components/public/home/CTASection"

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}

