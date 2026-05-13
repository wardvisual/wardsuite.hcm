import { Logo } from '@web/components/ui/Logo';

export function LandingFooter() {
    return (
        <footer className="border-t border-[#f0f0f0] bg-white">
            <div className="mx-auto flex h-16 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Logo size="sm" />
                <p className="text-xs text-[#bbbbbb]">
                    © {new Date().getFullYear()} WardSuite HCM. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
