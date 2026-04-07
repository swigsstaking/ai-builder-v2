/**
 * Style configuration for each design template.
 * Maps design style names to their visual properties (nav, border radius, buttons, fonts).
 */
export const styleConfig = {
  modern: {
    navBg: 'bg-white',
    navShadow: 'shadow-sm',
    navText: 'text-gray-900',
    borderRadius: 'rounded-lg',
    buttonStyle: 'rounded-lg',
    fontFamily: 'font-sans',
  },
  bold: {
    navBg: 'bg-gray-900',
    navShadow: 'shadow-xl',
    navText: 'text-white',
    borderRadius: 'rounded-none',
    buttonStyle: 'rounded-none uppercase tracking-wider',
    fontFamily: 'font-bold',
  },
  elegant: {
    navBg: 'bg-stone-50',
    navShadow: 'shadow-none border-b border-stone-200',
    navText: 'text-stone-800',
    borderRadius: 'rounded-sm',
    buttonStyle: 'rounded-full',
    fontFamily: 'font-serif',
  },
  minimal: {
    navBg: 'bg-white',
    navShadow: 'shadow-none border-b',
    navText: 'text-gray-800',
    borderRadius: 'rounded-md',
    buttonStyle: 'rounded-md',
    fontFamily: 'font-light',
  },
  artistic: {
    navBg: 'bg-gradient-to-r from-purple-900 to-indigo-900',
    navShadow: 'shadow-lg',
    navText: 'text-white',
    borderRadius: 'rounded-2xl',
    buttonStyle: 'rounded-full',
    fontFamily: 'font-medium',
  },
};

export default styleConfig;
