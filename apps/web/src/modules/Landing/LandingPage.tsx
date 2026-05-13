import {
    CtaSection,
    FeaturesSection,
    HeroSection,
    HowItWorksSection,
    LandingFooter,
    LandingHeader,
    StatsSection,
} from './components';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#f7f7f7] font-sans">
            <LandingHeader />
            <main>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <StatsSection />
                <CtaSection />
            </main>
            <LandingFooter />
        </div>
    );
}
