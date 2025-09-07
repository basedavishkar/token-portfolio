import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { removeToken, updateHoldings, fetchPrices } from '../store/portfolioSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit3, Trash2, RefreshCw, Plus, Star } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { AddTokenModal } from './AddTokenModal';

export const WatchlistTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tokens, loading } = useSelector((state: RootState) => state.portfolio);
  const [editingHoldings, setEditingHoldings] = useState<string | null>(null);
  const [holdingsValue, setHoldingsValue] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleRefreshPrices = () => {
    const tokenIds = tokens.map(token => token.id);
    dispatch(fetchPrices(tokenIds));
  };

  const handleEditHoldings = (tokenId: string, currentHoldings: number) => {
    setEditingHoldings(tokenId);
    setHoldingsValue(currentHoldings.toString());
  };

  const handleSaveHoldings = (tokenId: string) => {
    const newHoldings = parseFloat(holdingsValue);
    if (!isNaN(newHoldings) && newHoldings >= 0) {
      dispatch(updateHoldings({ id: tokenId, holdings: newHoldings }));
    }
    setEditingHoldings(null);
    setHoldingsValue('');
  };

  const formatPrice = (price: number | undefined) => {
    if (!price || isNaN(price)) return '$0.00';
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatPercentage = (percentage: number | undefined) => {
    if (!percentage || isNaN(percentage)) return '0.00%';
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Watchlist Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-primary fill-current" />
          <h2 className="text-xl font-semibold text-foreground">Watchlist</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (tokens.length > 0) {
                const tokenIds = tokens.map(token => token.id);
                dispatch(fetchPrices(tokenIds));
              }
            }}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-9 px-4 text-sm border-border hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Prices</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="h-9 px-4 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Token
          </Button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token</th>
                <th className="text-right px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="text-right px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">24h</th>
                <th className="text-center px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Chart</th>
                <th className="text-right px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Holdings</th>
                <th className="text-right px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                <th className="px-4 sm:px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Star className="w-12 h-12 text-muted-foreground/50" />
                      <p>No tokens added yet</p>
                      <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Token
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                tokens.map((token) => (
                  <tr 
                    key={token.id} 
                    className="border-b border-border hover:bg-muted/30 transition-colors duration-200 group"
                  >
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={token.image || '/placeholder.svg'} 
                          alt={token.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200">{token.name}</div>
                          <div className="text-xs text-muted-foreground font-medium">{token.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                        {formatPrice(token.current_price)}
                      </span>
                    </td>
                    
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      <span className={`font-semibold text-sm tabular-nums px-2 py-1 rounded-md ${
                        token.price_change_percentage_24h >= 0 
                          ? 'text-green-500 bg-green-500/10' 
                          : 'text-red-500 bg-red-500/10'
                      }`}>
                        {formatPercentage(token.price_change_percentage_24h)}
                      </span>
                    </td>
                    
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center hidden sm:table-cell">
                      <div className="w-16 sm:w-20 h-6 sm:h-8 mx-auto">
                        <Sparkline 
                          data={token.sparkline_in_7d?.price || []} 
                          isPositive={token.price_change_percentage_24h >= 0}
                        />
                      </div>
                    </td>
                    
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      {editingHoldings === token.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <Input
                            type="number"
                            value={holdingsValue}
                            onChange={(e) => setHoldingsValue(e.target.value)}
                            className="w-20 sm:w-24 h-8 sm:h-9 text-xs sm:text-sm"
                            step="0.000001"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveHoldings(token.id)}
                            className="h-8 sm:h-9 px-2 sm:px-3 text-xs"
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <span 
                          className="font-mono text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors duration-200 tabular-nums"
                          onClick={() => handleEditHoldings(token.id, token.holdings)}
                        >
                          {token.holdings.toLocaleString()}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                        ${(token.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-200">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEditHoldings(token.id, token.holdings)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit Holdings
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => dispatch(removeToken(token.id))}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {tokens.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-[11px] text-muted-foreground">
          <span>1 — {tokens.length} of {tokens.length} results</span>
          <div className="flex items-center gap-2">
            <span>1 of 1 pages</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="border-border h-[28px] px-[10px] text-[11px] rounded-[6px]" disabled>
                Prev
              </Button>
              <Button variant="outline" size="sm" className="border-border h-[28px] px-[10px] text-[11px] rounded-[6px]" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Token Modal */}
      <AddTokenModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};