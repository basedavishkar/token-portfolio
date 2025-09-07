import { Token } from '../types';

export const SAMPLE_TOKENS: Omit<Token, 'value'>[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
    current_price: 0,
    price_change_percentage_24h: 0,
    holdings: 0.05,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    current_price: 0,
    price_change_percentage_24h: 0,
    holdings: 2.5,
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'sol',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422',
    current_price: 0,
    price_change_percentage_24h: 0,
    holdings: 15.0,
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'doge',
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png?1547792256',
    current_price: 0,
    price_change_percentage_24h: 0,
    holdings: 500.0,
  },
];

export const initializeSamplePortfolio = () => {
  const hasExistingData = localStorage.getItem('persist:root');
  return !hasExistingData;
};