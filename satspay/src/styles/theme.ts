/**
 * Professional theme configuration for SatsPay
 * Centralized styling constants for consistent financial application design
 */

export const theme = {
  // Professional color palette
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    bitcoin: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    }
  },

  // Professional typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // Professional spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Professional border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
  },

  // Professional shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Professional animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // Financial data display styles
  financial: {
    amount: {
      small: 'text-sm font-mono font-medium tracking-tight',
      medium: 'text-lg font-mono font-semibold tracking-tight',
      large: 'text-2xl font-mono font-bold tracking-tight',
      xlarge: 'text-4xl font-mono font-black tracking-tight',
    },
    status: {
      success: 'bg-success-100 text-success-800 border border-success-200',
      warning: 'bg-warning-100 text-warning-800 border border-warning-200',
      error: 'bg-error-100 text-error-800 border border-error-200',
      pending: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
      autopay: 'bg-bitcoin-100 text-bitcoin-800 border border-bitcoin-200',
    },
  },

  // Professional component styles
  components: {
    card: {
      base: 'bg-white rounded-xl shadow-sm border border-secondary-200 transition-all duration-300',
      hover: 'hover:shadow-lg hover:border-primary-300',
      active: 'border-primary-500 shadow-md',
    },
    button: {
      base: 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm',
      hover: 'hover:shadow-md hover:scale-105',
      active: 'active:scale-95',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    input: {
      base: 'block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 transition-all duration-200',
      focus: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md',
      error: 'border-error-500 focus:ring-error-500 focus:border-error-500',
    },
  },

  // Professional layout
  layout: {
    container: 'max-w-7xl mx-auto',
    section: 'py-8 px-6 lg:py-12 lg:px-8',
    grid: {
      cols1: 'grid-cols-1',
      cols2: 'grid-cols-1 md:grid-cols-2',
      cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      cols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    },
  },

  // Accessibility
  accessibility: {
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    screenReader: 'sr-only',
    skipLink: 'absolute left-[-10000px] top-auto w-1 h-1 overflow-hidden focus:left-6 focus:top-7 focus:w-auto focus:h-auto focus:overflow-visible',
  },
} as const;

// Helper functions for consistent styling
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
    case 'connected':
      return theme.financial.status.success;
    case 'pending':
    case 'processing':
      return theme.financial.status.pending;
    case 'failed':
    case 'error':
    case 'disconnected':
      return theme.financial.status.error;
    case 'warning':
      return theme.financial.status.warning;
    case 'autopay':
      return theme.financial.status.autopay;
    default:
      return theme.financial.status.pending;
  }
};

export const getAmountSize = (amount: number) => {
  if (amount >= 1) return theme.financial.amount.xlarge;
  if (amount >= 0.1) return theme.financial.amount.large;
  if (amount >= 0.01) return theme.financial.amount.medium;
  return theme.financial.amount.small;
};

export const formatBitcoinAmount = (amount: number, precision: number = 8) => {
  return amount.toFixed(precision);
};

export const getWalletTypeColor = (type: string) => {
  switch (type) {
    case 'mobile':
      return 'bg-primary-100 text-primary-800 border border-primary-200';
    case 'web':
      return 'bg-bitcoin-100 text-bitcoin-800 border border-bitcoin-200';
    case 'cross-platform':
      return 'bg-secondary-100 text-secondary-800 border border-secondary-200';
    default:
      return 'bg-secondary-100 text-secondary-800 border border-secondary-200';
  }
};

export default theme;