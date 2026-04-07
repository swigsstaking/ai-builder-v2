export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05] ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer
            ${activeTab === tab.key
              ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#3b82f6]/20 text-white border border-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
