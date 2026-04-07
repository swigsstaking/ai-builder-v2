import { forwardRef } from 'react';

const base = `w-full bg-[#151525] border border-white/[0.07] text-[#e2e8f0] placeholder:text-[#64748b]
  rounded-lg transition-colors duration-150
  focus:outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/15`;

export const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <input ref={ref} className={`${base} px-3 py-2 text-sm ${error ? 'border-red-500/50' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, className = '', rows = 3, ...props }, ref) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <textarea ref={ref} rows={rows} className={`${base} px-3 py-2 text-sm resize-y ${error ? 'border-red-500/50' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <select ref={ref} className={`${base} px-3 py-2 text-sm ${error ? 'border-red-500/50' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

export default Input;
