import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LogIn, LogOut } from 'lucide-react';
import { EASE_OUT, MOCK_KPIS, MOCK_PUNCHES } from '../landing.data';

type MockPunchType = 'IN' | 'OUT';

type MockPunch = {
    id: number;
    type: MockPunchType;
    time: string;
};

function formatNowTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export function MockAppCard() {
    const [isPunchedIn, setIsPunchedIn] = useState(true);
    const [isPunching, setIsPunching] = useState(false);
    const [punches, setPunches] = useState<MockPunch[]>(() => [...MOCK_PUNCHES]);

    const nextAction: MockPunchType = isPunchedIn ? 'OUT' : 'IN';

    const statusText = useMemo(
        () => (isPunchedIn ? 'Currently Clocked In' : 'Not Clocked In'),
        [isPunchedIn],
    );

    const handlePunch = () => {
        if (isPunching) return;

        setIsPunching(true);
        const performedAction = nextAction;

        window.setTimeout(() => {
            setIsPunchedIn((prev) => !prev);
            setPunches((prev) => [
                {
                    id: Date.now(),
                    type: performedAction,
                    time: formatNowTime(),
                },
                ...prev,
            ].slice(0, 4));
            setIsPunching(false);
        }, 550);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.22, duration: 0.55, ease: EASE_OUT }}
            className="floating-card w-full p-6"
        >
            <div className="mb-5 flex items-center gap-2.5">
                <motion.span
                    animate={{ scale: isPunchedIn ? [1, 1.12, 1] : 1 }}
                    transition={{ duration: 1.8, repeat: isPunchedIn ? Infinity : 0, ease: 'easeInOut' }}
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${isPunchedIn ? 'bg-emerald-500' : 'bg-[#bbbbbb]'}`}
                />
                <AnimatePresence mode="wait">
                    <motion.span
                        key={statusText}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${isPunchedIn
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                            : 'border-[#ebebeb] bg-[#f5f5f5] text-[#6b7280]'
                            }`}
                    >
                        {statusText}
                    </motion.span>
                </AnimatePresence>
            </div>

            <div className="mb-5 flex items-center gap-4">
                <motion.div className="relative flex shrink-0 items-center justify-center" whileTap={{ scale: 0.96 }}>
                    {isPunchedIn && (
                        <>
                            <motion.div
                                className="absolute h-24 w-24 rounded-full border border-emerald-300/60"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                            />
                            <motion.div
                                className="absolute h-24 w-24 rounded-full border border-emerald-200/50"
                                animate={{ scale: [1, 1.8], opacity: [0.35, 0] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.55 }}
                            />
                        </>
                    )}

                    <motion.button
                        type="button"
                        onClick={handlePunch}
                        disabled={isPunching}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                        className={`relative z-10 flex h-24 w-24 cursor-pointer overflow-hidden flex-col items-center justify-center gap-1 rounded-full font-black text-white shadow-[0_14px_40px_rgba(15,23,42,0.24)] disabled:cursor-not-allowed disabled:opacity-60 ${nextAction === 'OUT' ? 'bg-[#111111]' : 'bg-emerald-600'
                            }`}
                    >
                        <motion.div
                            aria-hidden="true"
                            className={`absolute inset-0 ${nextAction === 'OUT'
                                ? 'bg-[linear-gradient(120deg,#0f172a_0%,#334155_35%,#111827_70%,#64748b_100%)]'
                                : 'bg-[linear-gradient(120deg,#22c55e_0%,#14b8a6_35%,#10b981_70%,#84cc16_100%)]'
                                }`}
                            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                            style={{ backgroundSize: '200% 200%' }}
                        />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={nextAction}
                                initial={{ opacity: 0, scale: 0.5, rotate: -15, y: 8 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotate: 15, y: -8 }}
                                transition={{ type: 'spring', stiffness: 460, damping: 20 }}
                                className="relative z-10 flex flex-col items-center gap-1"
                            >
                                <div className="relative flex items-center justify-center">
                                    {nextAction === 'OUT' ? (
                                        <LogOut className="h-5 w-5 text-white" />
                                    ) : (
                                        <LogIn className="h-5 w-5 text-white" />
                                    )}
                                    {isPunching && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.6 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.6 }}
                                            className="absolute -right-2 -top-2 h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
                                            style={{ animation: 'spin 0.75s linear infinite' }}
                                        />
                                    )}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                                    {nextAction === 'OUT' ? 'Punch Out' : 'Punch In'}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </motion.button>
                </motion.div>

                <div className="grid flex-1 grid-cols-2 gap-1.5">
                    {MOCK_KPIS.map((kpi) => (
                        <div key={kpi.label} className={`${kpi.bg} rounded-xl px-2.5 py-2`}>
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#bbbbbb]">
                                {kpi.label}
                            </p>
                            <p className="mt-0.5 text-sm font-black tabular-nums text-[#111111]">
                                {kpi.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl bg-[#fafafa] p-3">
                <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#bbbbbb]">
                    Punch History
                </p>
                <div className="space-y-1.5">
                    {punches.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.22 + i * 0.05, duration: 0.22 }}
                            className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                        >
                            <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg ${p.type === 'IN'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-[#f0f0f0] text-[#6b7280]'
                                    }`}
                            >
                                {p.type === 'IN' ? (
                                    <LogIn className="h-2.5 w-2.5" />
                                ) : (
                                    <LogOut className="h-2.5 w-2.5" />
                                )}
                            </div>
                            <span className="flex-1 text-[11px] text-[#6b7280]">Punch {p.type}</span>
                            <span className="text-[11px] font-bold tabular-nums text-[#111111]">
                                {p.time}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
