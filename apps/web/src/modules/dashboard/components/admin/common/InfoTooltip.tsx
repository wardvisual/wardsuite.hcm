import { Info } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@web/lib/utils';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="flex items-center justify-center text-[#bbbbbb] hover:text-[#6b7280] transition-colors focus:outline-none"
        aria-label="More info"
      >
        <Info className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 pointer-events-none"
          >
            <div className="w-max max-w-[220px] rounded-xl bg-[#111111] px-3.5 py-2.5 text-[11px] font-medium leading-relaxed text-white shadow-xl">
              {text}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-px h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-[#111111]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
