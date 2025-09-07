import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Doughnut } from 'react-chartjs-2';
import { Token } from '../types';
import { TOKEN_COLORS, FALLBACK_COLORS } from '../constants';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const getTokenColor = (tokenId: string, symbol: string): string => {
  // Check predefined colors first
  const tokenKey = symbol.toLowerCase();
  if (TOKEN_COLORS[tokenKey as keyof typeof TOKEN_COLORS]) {
    return TOKEN_COLORS[tokenKey as keyof typeof TOKEN_COLORS];
  }

  // Exact colors from Figma pie chart
  const figmaColors: { [key: string]: string } = {
    'bitcoin': '#F7931A',      // Bitcoin orange
    'btc': '#F7931A',
    'ethereum': '#8247E5',     // Ethereum purple  
    'eth': '#8247E5',
    'solana': '#9945FF',       // Solana purple
    'sol': '#9945FF',
    'dogecoin': '#00CED1',     // Dogecoin cyan
    'doge': '#00CED1',
    'usd-coin': '#2775CA',     // USDC blue
    'usdc': '#2775CA',
    'stellar': '#08B5E5',      // Stellar cyan
    'xlm': '#08B5E5',
  };
  
  const key = tokenId.toLowerCase();
  const symKey = symbol.toLowerCase();
  
  if (figmaColors[key]) {
    return figmaColors[key];
  }
  if (figmaColors[symKey]) {
    return figmaColors[symKey];
  }
  
  // Fallback colors matching Figma aesthetic
  const hash = (tokenId + symbol).split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
};

export const PortfolioOverview = () => {
  const { tokens, lastUpdated } = useSelector((state: RootState) => state.portfolio);
  
  const visibleTokens = tokens.filter(token => token.holdings > 0);
  const totalValue = visibleTokens.reduce((acc, token) => acc + (token.value || 0), 0);
  
  // Ensure we have data for the chart
  const hasData = visibleTokens.length > 0 && totalValue > 0;
  
  const chartData = {
    labels: hasData ? visibleTokens.map(token => token.symbol.toUpperCase()) : ['No Data'],
    datasets: [
      {
        data: hasData ? visibleTokens.map(token => token.value || 0) : [1],
        backgroundColor: hasData 
          ? visibleTokens.map(token => getTokenColor(token.id, token.symbol))
          : ['#374151'],
        borderWidth: 0,
        cutout: '45%',
        borderRadius: 2,
        spacing: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: hasData,
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: { parsed: number }) {
            const value = context.parsed;
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0';
            return `$${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 0,
      }
    },
    animation: {
      animateRotate: true,
      duration: 1000,
    }
  };


  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-8">
        <div className="grid grid-cols-12 gap-12 items-start">
          {/* Left side - Portfolio Total */}
          <div className="col-span-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">
              Portfolio Total
            </h2>
            <div className="text-5xl font-bold text-foreground mb-4 tracking-tight">
              ${totalValue.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
          
          {/* Right side - Chart and Legend */}
          <div className="col-span-6 flex items-center gap-8">
            {/* Chart */}
            <div className="w-44 h-44 relative flex-shrink-0">
              <Doughnut data={chartData} options={chartOptions} />
              {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No data</span>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="space-y-4 flex-1">
              {hasData ? (
                visibleTokens
                  .sort((a, b) => (b.value || 0) - (a.value || 0))
                  .map((token) => {
                    const percentage = totalValue > 0 ? ((token.value || 0) / totalValue) * 100 : 0;
                    const color = getTokenColor(token.id, token.symbol);
                    
                    return (
                      <div key={token.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span 
                            className="text-sm font-medium text-foreground"
                          >
                            {token.name} ({token.symbol.toUpperCase()})
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })
              ) : (
                <div className="text-muted-foreground text-sm">
                  Add tokens to see portfolio breakdown
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};