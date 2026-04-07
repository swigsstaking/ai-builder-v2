const variants = {
  default: 'bg-white/[0.06] text-slate-300',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-red-500/15 text-red-400',
  info: 'bg-blue-500/15 text-blue-400',
  purple: 'bg-purple-500/15 text-purple-400',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({ variant = 'default', size = 'md', icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

// Pre-configured status badges for sites
export const STATUS_BADGES = {
  draft:      { variant: 'default', label: 'Brouillon' },
  building:   { variant: 'warning', label: 'Construction...' },
  published:  { variant: 'success', label: 'Publié' },
  error:      { variant: 'danger',  label: 'Erreur' },
};

export function SiteStatusBadge({ status }) {
  const config = STATUS_BADGES[status] || STATUS_BADGES.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
