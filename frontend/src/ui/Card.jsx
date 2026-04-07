const variantStyles = {
  default: 'bg-[#1e1e35] border border-white/[0.07]',
  interactive: 'bg-[#1e1e35] border border-white/[0.07] hover:border-white/[0.14] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
  selected: 'bg-[#1e1e35] border-2 border-purple-500/50 ring-2 ring-purple-500/15',
  ghost: 'bg-white/[0.03] border border-white/[0.05]',
};

export default function Card({ variant = 'default', className = '', children, ...props }) {
  return (
    <div className={`rounded-xl ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`px-5 py-4 border-b border-white/[0.07] ${className}`}>{children}</div>;
}

export function CardBody({ className = '', children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return <div className={`px-5 py-3 border-t border-white/[0.07] ${className}`}>{children}</div>;
}
