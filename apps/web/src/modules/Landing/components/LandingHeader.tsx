import { Link } from 'react-router-dom';
import { Logo } from '@web/components/ui/Logo';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

export function LandingHeader() {
    const { isAuthenticated } = useAuthStore();

    return (
        <header className="sticky top-0 z-50 border-b border-[#f0f0f0] bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Logo size="sm" />
                <nav className="flex items-center gap-2.5">
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn-primary px-5 py-2 text-xs">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/auth/login" className="btn-secondary px-5 py-2 text-xs">
                                Sign In
                            </Link>
                            <Link to="/auth/register" className="btn-primary px-5 py-2 text-xs">
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
