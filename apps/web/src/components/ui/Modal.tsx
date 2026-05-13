import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@web/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'modal' | 'drawer';
  className?: string;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'modal',
  className,
}: ModalProps) {
  const panelMotion =
    variant === 'drawer'
      ? {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 24 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
      }
      : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
      };
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-[2000] flex p-4 ${variant === 'drawer' ? 'items-stretch justify-end' : 'items-center justify-center'
            }`}
        >
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit}
            transition={panelMotion.transition}
            className={cn(
              'relative z-10 w-full bg-white shadow-2xl p-6',
              variant === 'drawer'
                ? 'h-full max-w-md rounded-l-3xl rounded-r-none'
                : `rounded-3xl ${sizeMap[size]}`,
              className
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                {title && <h2 className="text-lg font-black text-[#111111]">{title}</h2>}
                {description && <p className="mt-0.5 text-sm text-[#6b7280]">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[#f5f5f5] text-[#bbbbbb] hover:text-black transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
