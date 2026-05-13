import { STATS } from '../landing.data';

export function StatsSection() {
    return (
        <section className="bg-[#f7f7f7] py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="space-y-1.5">
                            <p className="text-2xl font-black tracking-tight text-[#111111]">{value}</p>
                            <p className="text-xs font-medium text-[#9ca3af]">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
