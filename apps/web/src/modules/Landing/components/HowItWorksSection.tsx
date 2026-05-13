import { motion } from 'motion/react';
import { EASE_OUT, STEPS } from '../landing.data';
import { SectionLabel } from './SectionLabel';

export function HowItWorksSection() {
    return (
        <section className="bg-white py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="mb-12 text-center"
                >
                    <SectionLabel>How It Works</SectionLabel>
                    <h2 className="text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
                        Three steps. That's it.
                    </h2>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {STEPS.map(({ step, title, description }, i) => (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.4, ease: EASE_OUT }}
                            className="floating-card space-y-4 p-7"
                        >
                            <span className="block select-none text-5xl font-black leading-none tabular-nums text-[#ebebeb]">
                                {step}
                            </span>
                            <div>
                                <h3 className="text-base font-black text-[#111111]">{title}</h3>
                                <p className="mt-1.5 text-xs leading-5 text-[#6b7280]">{description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
