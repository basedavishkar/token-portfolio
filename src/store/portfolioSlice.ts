import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Token, PortfolioState, TokenSearchResult } from '../types';
import { coingeckoApi } from '../services/coingecko';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import { SAMPLE_TOKENS } from '../data/sampleTokens';

// Load initial state from localStorage
const savedData = loadFromLocalStorage();
const initialState: PortfolioState = {
  tokens: savedData?.tokens || [],
  searchResults: [],
  trendingTokens: [],
  loading: false,
  searchLoading: false,
  error: null,
  lastUpdated: savedData?.lastUpdated || null,
  totalValue: 0,
};

// Async thunks
export const fetchPrices = createAsyncThunk(
  'portfolio/fetchPrices',
  async (tokenIds: string[]) => {
    // Use direct API call to get raw response
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`);
    const data = await response.json();
    return data;
  }
);

export const searchTokens = createAsyncThunk(
  'portfolio/searchTokens',
  async (query: string) => {
    return await coingeckoApi.searchTokens(query);
  }
);

export const fetchTrendingTokens = createAsyncThunk(
  'portfolio/fetchTrendingTokens',
  async () => {
    return await coingeckoApi.getTrendingTokens();
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    addToken: (state, action: PayloadAction<{ id: string; name: string; symbol: string; large: string }>) => {
      const existingToken = state.tokens.find(token => token.id === action.payload.id);
      if (!existingToken) {
        const newToken: Token = {
          id: action.payload.id,
          name: action.payload.name,
          symbol: action.payload.symbol,
          image: action.payload.large,
          current_price: 0,
          price_change_percentage_24h: 0,
          holdings: 0,
          value: 0,
        };
        state.tokens.push(newToken);
        // Save to localStorage after adding token
        saveToLocalStorage({ tokens: state.tokens, lastUpdated: state.lastUpdated });
      }
    },
    
    removeToken: (state, action: PayloadAction<string>) => {
      state.tokens = state.tokens.filter(token => token.id !== action.payload);
      state.totalValue = state.tokens.reduce((sum, token) => sum + token.value, 0);
      // Save to localStorage
      saveToLocalStorage({ tokens: state.tokens, lastUpdated: state.lastUpdated });
    },
    
    updateHoldings: (state, action: PayloadAction<{ id: string; holdings: number }>) => {
      const token = state.tokens.find(t => t.id === action.payload.id);
      if (token) {
        token.holdings = action.payload.holdings;
        token.value = token.current_price * token.holdings;
      }
      state.totalValue = state.tokens.reduce((sum, token) => sum + token.value, 0);
      // Save to localStorage
      saveToLocalStorage({ tokens: state.tokens, lastUpdated: state.lastUpdated });
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch prices
      .addCase(fetchPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.lastUpdated = new Date().toLocaleTimeString();
        
        const prices = action.payload;
        prices.forEach((priceData: any) => {
          const token = state.tokens.find(t => t.id === priceData.id);
          if (token) {
            token.current_price = priceData.current_price || priceData.currentPrice;
            token.price_change_percentage_24h = priceData.price_change_percentage_24h || priceData.priceChangePercentage24h;
            token.sparkline_in_7d = priceData.sparkline_in_7d || { price: priceData.sparklineIn7d };
            token.value = token.current_price * token.holdings;
          }
        });
        state.totalValue = state.tokens.reduce((sum, token) => sum + token.value, 0);
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        saveToLocalStorage({ tokens: state.tokens, lastUpdated: state.lastUpdated });
      })
      .addCase(fetchPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prices';
      })
      
      // Search tokens
      .addCase(searchTokens.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchTokens.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchTokens.rejected, (state) => {
        state.searchLoading = false;
      })
      
      // Trending tokens
      .addCase(fetchTrendingTokens.fulfilled, (state, action) => {
        state.trendingTokens = action.payload;
      });
  },
});

export const { addToken, removeToken, updateHoldings, clearSearchResults } = portfolioSlice.actions;
export default portfolioSlice.reducer;