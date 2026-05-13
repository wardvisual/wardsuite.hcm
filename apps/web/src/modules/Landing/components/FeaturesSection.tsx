import { motion } from 'motion/react';
import { EASE_OUT, FEATURES } from '../landing.data';
import { SectionLabel } from './SectionLabel';

export function FeaturesSection() {
    return (
        <section className="bg-[#ffffff] py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="mb-12 text-center"
                >
                    <SectionLabel>Features</SectionLabel>
                    <h2 className="text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
                        Everything you need to manage attendance
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6b7280]">
                        Built for real work schedules — handles OT, night differential (22:00–06:00),
                        lateness, and undertime out of the box.
                    </p>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map(({ Icon, iconBg, iconColor, title, description }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07, duration: 0.4, ease: EASE_OUT }}
                            className="floating-card space-y-4 p-6"
                        >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                                <Icon className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#111111]">{title}</h3>
                                <p className="mt-1.5 text-xs leading-5 text-[#6b7280]">{description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
