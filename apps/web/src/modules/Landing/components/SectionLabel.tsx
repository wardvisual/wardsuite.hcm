import type { ReactNode } from 'react';

interface SectionLabelProps {
    children: ReactNode;
    dark?: boolean;
}

export function SectionLabel({ children, dark = false }: SectionLabelProps) {
    const lineColor = dark ? 'bg-[#333]' : 'bg-[#d1d5db]';
    const textColor = dark ? 'text-[#555]' : 'text-[#9ca3af]';

    return (
        <div className="mb-4 flex items-center justify-center gap-3">
            <span className={`h-px w-8 ${lineColor}`} />
            <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${textColor}`}>
                {children}
            </p>
            <span className={`h-px w-8 ${lineColor}`} />
        </div>
    );
}
