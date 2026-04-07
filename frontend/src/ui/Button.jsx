import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white hover:brightness-110 shadow-lg shadow-purple-500/20',
  secondary: 'bg-white/[0.06] text-slate-300 border border-white/[0.07] hover:bg-white/[0.10]',
  danger: 'bg-red-600/90 text-white hover:bg-red-600',
  ghost: 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-2.5 text-sm gap-2 rounded-xl',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading, disabled, icon: Icon, iconRight: IconRight, children, className = '', ...props },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer
        ${variants[variant]} ${sizes[size]}
        ${isDisabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
      {IconRight && !loading && <IconRight className="w-4 h-4" />}
    </button>
  );
});

export default Button;
