import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Token Portfolio',
  projectId: '2f05a7cdc2bb9f2d8a55ac5f28349b93',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
});