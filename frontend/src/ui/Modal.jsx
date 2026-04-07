import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, size = 'md', children, className = '' }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose?.()}
    >
      <div
        ref={contentRef}
        className={`w-full ${sizes[size]} bg-[#1e1e35] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/50
          animate-in fade-in zoom-in-95 duration-200 ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {onClose && (
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 mt-4 border-t border-white/[0.07] ${className}`}>
      {children}
    </div>
  );
}
