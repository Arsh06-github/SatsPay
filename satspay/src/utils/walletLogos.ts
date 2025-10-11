/**
 * Professional wallet logo utilities and fallbacks
 */

// Professional default wallet logo as base64 SVG
const DEFAULT_WALLET_LOGO = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2364748b;stop-opacity:1" /><stop offset="100%" style="stop-color:%23475569;stop-opacity:1" /></linearGradient></defs><rect width="40" height="40" rx="8" fill="url(%23defaultGradient)"/><circle cx="20" cy="20" r="12" fill="white" opacity="0.9"/><text x="20" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="%23475569">₿</text></svg>`;

// Professional wallet logo mappings with high-quality SVGs
export const WALLET_LOGOS: { [key: string]: string } = {
  // Mobile wallets
  bluewallet: '/logos/bluewallet.svg',
  munn: '/logos/munn.svg',
  phoenix: '/logos/phoenix.svg',
  zengo: '/logos/zengo.svg',
  breez: '/logos/breez.svg',
  eclair: '/logos/eclair.svg',
  klever: '/logos/klever.svg',
  
  // Web wallets
  sparrow: '/logos/sparrow.svg',
  electrum: '/logos/electrum.svg',
  
  // Cross-platform wallets
  casa: '/logos/casa.svg',
  blockstream: '/logos/blockstream.svg',
  unstoppable: '/logos/unstoppable.svg',
};

// Wallet metadata for enhanced display
export const WALLET_METADATA: { [key: string]: { 
  name: string; 
  type: 'mobile' | 'web' | 'cross-platform';
  description: string;
  features: string[];
  color: string;
}} = {
  // Mobile wallets
  bluewallet: {
    name: 'BlueWallet',
    type: 'mobile',
    description: 'Bitcoin & Lightning wallet for iOS and Android',
    features: ['Lightning Network', 'Watch-only', 'Multisig'],
    color: '#3B82F6'
  },
  munn: {
    name: 'Munn',
    type: 'mobile',
    description: 'Self-custodial Lightning wallet',
    features: ['Lightning Network', 'Self-custodial', 'Simple UI'],
    color: '#10B981'
  },
  phoenix: {
    name: 'Phoenix',
    type: 'mobile',
    description: 'Lightning wallet by ACINQ',
    features: ['Lightning Network', 'Channel management', 'Backup'],
    color: '#F97316'
  },
  zengo: {
    name: 'ZenGo',
    type: 'mobile',
    description: 'Keyless crypto wallet',
    features: ['Keyless security', 'Multi-crypto', 'DeFi'],
    color: '#8B5CF6'
  },
  breez: {
    name: 'Breez',
    type: 'mobile',
    description: 'Lightning-powered Bitcoin wallet',
    features: ['Lightning Network', 'Point of Sale', 'Podcasts'],
    color: '#06B6D4'
  },
  eclair: {
    name: 'Éclair Mobile',
    type: 'mobile',
    description: 'Lightning wallet by ACINQ',
    features: ['Lightning Network', 'Channel management', 'Advanced'],
    color: '#F59E0B'
  },
  klever: {
    name: 'Klever',
    type: 'mobile',
    description: 'Multi-crypto wallet',
    features: ['Multi-crypto', 'Staking', 'DeFi'],
    color: '#EC4899'
  },
  
  // Web wallets
  sparrow: {
    name: 'Sparrow',
    type: 'web',
    description: 'Desktop Bitcoin wallet',
    features: ['Privacy focused', 'PSBT', 'Hardware wallet'],
    color: '#64748B'
  },
  electrum: {
    name: 'Electrum',
    type: 'web',
    description: 'Lightweight Bitcoin client',
    features: ['SPV', 'Hardware wallet', 'Multisig'],
    color: '#3B82F6'
  },
  
  // Cross-platform wallets
  casa: {
    name: 'Casa',
    type: 'cross-platform',
    description: 'Self-custody Bitcoin wallet',
    features: ['Multisig', 'Hardware integration', 'Recovery'],
    color: '#16A34A'
  },
  blockstream: {
    name: 'Blockstream Green',
    type: 'cross-platform',
    description: 'Multi-platform Bitcoin wallet',
    features: ['2FA security', 'Liquid Network', 'Hardware wallet'],
    color: '#22C55E'
  },
  unstoppable: {
    name: 'Unstoppable',
    type: 'cross-platform',
    description: 'DeFi and crypto wallet',
    features: ['DeFi', 'Multi-crypto', 'DEX'],
    color: '#EF4444'
  },
};

/**
 * Get wallet logo URL with professional fallback
 */
export function getWalletLogo(walletId: string): string {
  return WALLET_LOGOS[walletId] || DEFAULT_WALLET_LOGO;
}

/**
 * Get wallet metadata
 */
export function getWalletMetadata(walletId: string) {
  return WALLET_METADATA[walletId] || {
    name: walletId.charAt(0).toUpperCase() + walletId.slice(1),
    type: 'cross-platform' as const,
    description: 'Bitcoin wallet',
    features: ['Bitcoin'],
    color: '#64748B'
  };
}

/**
 * Generate a professional colored SVG logo for a wallet
 */
export function generateWalletLogo(walletId: string, walletName: string): string {
  const metadata = getWalletMetadata(walletId);
  const color = metadata.color;
  const initial = walletName.charAt(0).toUpperCase();
  
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${encodeURIComponent(color)};stop-opacity:1" /><stop offset="100%" style="stop-color:${encodeURIComponent(color)}CC;stop-opacity:1" /></linearGradient></defs><rect width="40" height="40" rx="8" fill="url(%23walletGradient)"/><circle cx="20" cy="20" r="12" fill="white" opacity="0.9"/><text x="20" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${encodeURIComponent(color)}">${initial}</text></svg>`;
}

/**
 * Handle image load error with professional fallback
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>, walletId: string, walletName: string) {
  const img = event.target as HTMLImageElement;
  img.src = generateWalletLogo(walletId, walletName);
}

/**
 * Get wallet type icon
 */
export function getWalletTypeIcon(type: string): string {
  switch (type) {
    case 'mobile':
      return '📱';
    case 'web':
      return '🌐';
    case 'cross-platform':
      return '🔄';
    default:
      return '💼';
  }
}

/**
 * Get wallet type color classes
 */
export function getWalletTypeColor(type: string): string {
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
}