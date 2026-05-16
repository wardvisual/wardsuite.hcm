import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EASE_OUT, TRUST_BADGES } from '../landing.data';
import { MockAppCard } from './MockAppCard';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

export function HeroSection() {
    const { isAuthenticated } = useAuthStore();

    return (
        <section className="bg-white">
            <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.48, ease: EASE_OUT }}
                        className="space-y-7"
                    >
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-[#d1d5db]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9ca3af]">
                                Human Capital Management
                            </p>
                        </div>

                        <h1 className="text-4xl font-black leading-[1.06] tracking-tight text-[#111111] sm:text-5xl lg:text-[3.5rem]">
                            Track attendance
                            <br className="hidden sm:block" />
                            <span className="text-[#9ca3af]">without losing</span>
                            <br />
                            <span className="text-[#9ca3af]">operational context.</span>
                        </h1>

                        <p className="max-w-lg text-base leading-7 text-[#6b7280]">
                            WardSuite HCM lets employees punch in and out with one tap while automatically
                            computing regular hours, overtime, night differential, lateness, and undertime.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-7 py-3 text-sm font-black text-white shadow-[0_2px_10px_rgba(15,23,42,0.16)] transition-all duration-150 hover:opacity-90 active:scale-95"
                                >
                                    Go to Dashboard
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    to="/auth/register"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-7 py-3 text-sm font-black text-white shadow-[0_2px_10px_rgba(15,23,42,0.16)] transition-all duration-150 hover:opacity-90 active:scale-95"
                                >
                                    Get started free
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-5">
                            {TRUST_BADGES.map((item) => (
                                <span
                                    key={item}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-[#6b7280]"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-sm lg:max-w-none">
                            <MockAppCard />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
