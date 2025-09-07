import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';
import logo from '../../figma/logo.png';

export const PortfolioHeader = () => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-[24px] py-[16px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="flex items-center gap-[8px]">
        <img src={logo} alt="Token Portfolio" className="w-[24px] h-[24px] rounded-[4px]" />
        <h1 className="text-[16px] font-semibold tracking-[-0.01em] text-foreground">Token Portfolio</h1>
      </div>
      
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');
          
          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button onClick={openConnectModal} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition inline-flex items-center gap-2 text-sm">
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </button>
                  );
                }
                
                return (
                  <div className="flex gap-[8px]">
                    <button
                      onClick={openChainModal}
                      className="px-[8px] py-[6px] rounded-[8px] bg-secondary text-secondary-foreground text-[12px] hover:bg-secondary/80 transition-colors"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>
                    
                    <button onClick={openAccountModal} className="px-[12px] py-[6px] rounded-[8px] bg-primary text-primary-foreground font-medium hover:brightness-110 transition-colors text-[14px]">
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </header>
  );
};