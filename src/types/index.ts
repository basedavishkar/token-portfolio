// Core token interfaces
export interface Token {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
  holdings: number;
  value: number;
}

export interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
  large: string;
  image?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
}

// Portfolio state interface
export interface PortfolioState {
  tokens: Token[];
  searchResults: TokenSearchResult[];
  trendingTokens: TokenSearchResult[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  totalValue: number;
}

// API response interfaces
export interface CoinGeckoTokenResponse {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
  };
  current_price?: number;
  price_change_percentage_24h?: number;
}

export interface CoinGeckoPriceResponse {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}
