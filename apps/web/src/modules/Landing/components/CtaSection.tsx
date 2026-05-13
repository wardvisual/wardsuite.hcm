import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EASE_OUT } from '../landing.data';
import { SectionLabel } from './SectionLabel';

export function CtaSection() {
    return (
        <section className="bg-white py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="floating-card rounded-[28px] bg-[#111111] px-8 py-16 text-center sm:px-16"
                >
                    <SectionLabel dark>Get Started</SectionLabel>
                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Ready to simplify
                        <br />
                        attendance tracking?
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#888]">
                        Sign up and start tracking your team's time in minutes. No setup fees,
                        no complex configuration.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/auth/register"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-black text-[#111111] transition-all duration-150 hover:opacity-90 active:scale-95"
                        >
                            Create your account
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/auth/login"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-8 py-3 text-sm font-black text-white transition-all duration-150 hover:bg-white/12 active:scale-95"
                        >
                            Sign in
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
