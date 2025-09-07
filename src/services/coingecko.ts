import axios from 'axios';
import { COINGECKO_BASE_URL } from '../constants';
import { CoinGeckoTokenResponse, CoinGeckoPriceResponse } from '../types';

const api = axios.create({
  baseURL: COINGECKO_BASE_URL,
  timeout: 10000,
});

export const coingeckoApi = {
  async getTokenPrices(tokenIds: string[]) {
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: tokenIds.join(','),
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: true,
        price_change_percentage: '24h',
      },
    });
    return response.data.map((token: { id: string; current_price: number; price_change_percentage_24h: number; sparkline_in_7d: { price: number[] } }) => ({
      id: token.id,
      currentPrice: token.current_price,
      priceChangePercentage24h: token.price_change_percentage_24h,
      sparklineIn7d: token.sparkline_in_7d.price,
    }));
  },

  async searchTokens(query: string) {
    if (!query.trim()) return [];
    
    const response = await api.get('/search', {
      params: {
        query: query.trim(),
      },
    });
    
    return response.data.coins.slice(0, 10).map((coin: { id: string; name: string; symbol: string; large: string; market_cap_rank: number }) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      large: coin.large,
      market_cap_rank: coin.market_cap_rank,
    }));
  },

  async getTrendingTokens() {
    const response = await api.get('/search/trending');
    
    return response.data.coins.slice(0, 8).map((item: { item: { id: string; name: string; symbol: string; large: string; market_cap_rank: number } }) => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol,
      large: item.item.large,
      market_cap_rank: item.item.market_cap_rank,
    }));
  },
};