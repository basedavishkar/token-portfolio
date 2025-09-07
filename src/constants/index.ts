// Token color mapping for consistent chart colors
export const TOKEN_COLORS = {
  'bitcoin': '#F7931A',
  'ethereum': '#627EEA', 
  'solana': '#9945FF',
  'dogecoin': '#C2A633',
  'usdc': '#2775CA',
  'stellar': '#08B5E5',
  'cardano': '#0033AD',
  'polygon': '#8247E5',
  'chainlink': '#375BD2',
  'uniswap': '#FF007A'
} as const;

// Fallback colors for unknown tokens
export const FALLBACK_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12',
  '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C'
];

// LocalStorage key
export const STORAGE_KEY = 'token-portfolio-data';

// API endpoints
export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
