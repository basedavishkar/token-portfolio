import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { searchTokens, fetchTrendingTokens, addToken, clearSearchResults } from '../store/portfolioSlice';
import { TokenSearchResult } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, TrendingUp, Star } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTokenModal: React.FC<AddTokenModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, trendingTokens, searchLoading, tokens } = useSelector((state: RootState) => state.portfolio);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchTrendingTokens());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      dispatch(searchTokens(debouncedSearchQuery));
    } else {
      dispatch(clearSearchResults());
    }
  }, [debouncedSearchQuery, dispatch]);

  const handleTokenSelect = (tokenId: string) => {
    if (selectedTokens.includes(tokenId)) {
      setSelectedTokens(selectedTokens.filter(id => id !== tokenId));
    } else {
      setSelectedTokens([...selectedTokens, tokenId]);
    }
  };

  const handleAddToWatchlist = () => {
    const allTokens = searchQuery.trim() ? searchResults : trendingTokens;
    
    selectedTokens.forEach(tokenId => {
      const token = allTokens.find(t => t.id === tokenId);
      if (token && !tokens.find(existing => existing.id === tokenId)) {
        dispatch(addToken({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          large: token.large || token.image,
        }));
      }
    });
    
    setSelectedTokens([]);
    setSearchQuery('');
    dispatch(clearSearchResults());
    onClose();
  };

  const handleClose = () => {
    setSelectedTokens([]);
    setSearchQuery('');
    dispatch(clearSearchResults());
    onClose();
  };

  const tokensToShow = searchQuery.trim() ? searchResults : trendingTokens;
  const showTrending = !searchQuery.trim() && trendingTokens.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] bg-card border border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-foreground text-lg font-semibold">Add Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens (e.g., ETH, SOL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg text-sm"
            />
          </div>

          {/* Trending Section */}
          {showTrending && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Trending
              </div>
            </div>
          )}

          {/* Token List */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tokensToShow.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery.trim() ? 'No tokens found' : 'No trending tokens available'}
              </div>
            ) : (
              tokensToShow.map((token) => (
                <div 
                  key={token.id} 
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-muted/30 ${
                    selectedTokens.includes(token.id) 
                      ? 'bg-muted/50' 
                      : ''
                  }`}
                  onClick={() => handleTokenSelect(token.id)}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={token.large || token.image} 
                      alt={token.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div>
                      <div className="font-semibold text-sm text-foreground">{token.name}</div>
                      <div className="text-xs text-muted-foreground font-medium">{token.symbol?.toUpperCase()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {token.current_price && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-foreground">
                          ${token.current_price.toLocaleString()}
                        </div>
                        {token.price_change_percentage_24h !== undefined && (
                          <div className={`text-xs font-medium ${
                            token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {token.price_change_percentage_24h >= 0 ? '+' : ''}
                            {token.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      {selectedTokens.includes(token.id) ? (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-primary fill-current" />
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-border text-popover-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToWatchlist}
              disabled={selectedTokens.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Add to Watchlist
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};