import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPrices, addToken, updateHoldings } from '../store/portfolioSlice';
import { PortfolioHeader } from '../components/PortfolioHeader';
import { PortfolioOverview } from '../components/PortfolioOverview';
import { WatchlistTable } from '../components/WatchlistTable';
import { SAMPLE_TOKENS, initializeSamplePortfolio } from '../data/sampleTokens';

const Index = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tokens } = useSelector((state: RootState) => state.portfolio);

  useEffect(() => {
    // Initialize with sample data if no existing data
    if (tokens.length === 0) {
      SAMPLE_TOKENS.forEach(token => {
        dispatch(addToken({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          large: token.image,
        }));
        // Set initial holdings
        dispatch(updateHoldings({ id: token.id, holdings: token.holdings }));
      });
      
      // Fetch prices after adding tokens
      setTimeout(() => {
        const tokenIds = SAMPLE_TOKENS.map(token => token.id);
        dispatch(fetchPrices(tokenIds));
      }, 500);
    }
  }, [dispatch, tokens.length]);

  useEffect(() => {
    // Set up periodic price refresh every 30 seconds
    const interval = setInterval(() => {
      if (tokens.length > 0) {
        const tokenIds = tokens.map(token => token.id);
        dispatch(fetchPrices(tokenIds));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, tokens]);

  return (
    <div className="min-h-screen bg-background">
      <PortfolioHeader />
      <main className="px-6 py-6 space-y-6">
        <div className="max-w-[1400px]">
          <PortfolioOverview />
        </div>
        <div className="max-w-[1400px]">
          <WatchlistTable />
        </div>
      </main>
    </div>
  );
};

export default Index;
